#!/usr/bin/env node
/**
 * 增强版日志系统 - 添加失败和恢复记录
 * 解决传输阻塞问题
 */

import { appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const LOG_DIR = join(homedir(), '.openclaw', 'logs');
const LOG_TYPES = ['action', 'rejection', 'handoff', 'budget', 'failure', 'recovery'];

async function ensureLogDir() {
  if (!existsSync(LOG_DIR)) {
    await mkdir(LOG_DIR, { recursive: true });
  }
}

function getLogFile(type) {
  const date = new Date().toISOString().split('T')[0];
  return join(LOG_DIR, `${type}s-${date}.log`);
}

async function log(type, message, meta = {}) {
  await ensureLogDir();
  
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    session_id: process.env.SESSION_ID || 'unknown',
    ...meta
  };
  
  const logFile = getLogFile(type);
  await appendFile(logFile, JSON.stringify(entry) + '\n');
  
  // 控制台输出
  const icons = {
    action: '✅',
    rejection: '🚫',
    handoff: '🔄',
    budget: '💰',
    failure: '❌',
    recovery: '♻️'
  };
  
  console.log(`${icons[type] || '•'} [${type}] ${message}`);
  
  // 如果是失败，立即尝试记录恢复策略
  if (type === 'failure' && meta.recovery_strategy) {
    console.log(`   → Recovery: ${meta.recovery_strategy}`);
  }
}

// 专门的失败日志函数
export async function logFailure(error, context = {}) {
  const failureInfo = {
    error_type: error.name || 'Unknown',
    error_message: error.message,
    stack: error.stack?.split('\n')[0],
    context,
    recovery_strategy: context.recovery_strategy || 'manual_retry',
    retry_count: context.retry_count || 0
  };
  
  await log('failure', error.message, failureInfo);
  
  // 写入失败标记文件，用于自动恢复
  const failureFlag = join(LOG_DIR, 'last_failure.json');
  await writeFile(failureFlag, JSON.stringify({
    timestamp: new Date().toISOString(),
    error: error.message,
    recovered: false
  }));
}

// 专门的恢复日志函数
export async function logRecovery(originalFailure, recoveryMethod) {
  await log('recovery', `Recovered from: ${originalFailure}`, {
    recovery_method: recoveryMethod,
    recovery_time: new Date().toISOString()
  });
  
  // 清除失败标记
  const failureFlag = join(LOG_DIR, 'last_failure.json');
  if (existsSync(failureFlag)) {
    await unlink(failureFlag);
  }
}

// 传输阻塞专用处理
export async function handleTransmissionBlock(error, operation) {
  console.log('⚠️  Transmission block detected');
  
  await logFailure(error, {
    operation,
    block_type: 'transmission_timeout',
    recovery_strategy: 'exponential_backoff',
    max_retries: 5
  });
  
  // 通知系统需要恢复
  console.log('   Recovery strategy: exponential backoff + notification');
}

// 导入需要的函数
import { writeFile, unlink } from 'fs/promises';

// CLI
const args = process.argv.slice(2);
const type = args[0];
const message = args[1];

if (!type || !message) {
  console.log('Enhanced Log System with Self-Healing\n');
  console.log('Usage: node log-enhanced.mjs <type> <message> [--json meta]');
  console.log('Types: action, rejection, handoff, budget, failure, recovery\n');
  console.log('Examples:');
  console.log('  node log-enhanced.mjs failure "Network timeout" --json \'{"recovery_strategy":"retry"}\'');
  console.log('  node log-enhanced.mjs recovery "Connection restored" --json \'{"method":"auto_retry"}\'');
  process.exit(1);
}

// Parse optional JSON meta
let meta = {};
const jsonIndex = args.indexOf('--json');
if (jsonIndex !== -1 && args[jsonIndex + 1]) {
  try {
    meta = JSON.parse(args[jsonIndex + 1]);
  } catch (e) {
    console.error('Invalid JSON meta');
    process.exit(1);
  }
}

log(type, message, meta).catch(err => {
  console.error('Logging failed:', err);
  process.exit(1);
});
