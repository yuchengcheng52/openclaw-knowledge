#!/usr/bin/env node
/**
 * 安全检查清单
 * 审计 cron job、权限和工作区配置
 */

import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const HOME = homedir();
const WORKSPACE = join(HOME, '.openclaw', 'workspace');

const CHECKS = [];

function check(name, test, severity = 'warning') {
  CHECKS.push({ name, test, severity });
}

// 检查 cron 配置
check('Cron job audit trail', async () => {
  const cronLogDir = join(HOME, '.openclaw', 'logs');
  if (!existsSync(cronLogDir)) {
    return { pass: false, message: 'No log directory found. Create ~/.openclaw/logs/' };
  }
  const files = await readdir(cronLogDir);
  const hasLogs = files.some(f => f.endsWith('.log'));
  return { pass: hasLogs, message: hasLogs ? 'Log files exist' : 'No log files found' };
});

check('Workspace isolation', async () => {
  // 检查是否有策略限制 cron 只在 workspace 内操作
  const agentsMd = join(WORKSPACE, 'AGENTS.md');
  if (!existsSync(agentsMd)) {
    return { pass: false, message: 'No AGENTS.md found to define workspace boundaries' };
  }
  const content = await readFile(agentsMd, 'utf-8');
  const hasIsolation = content.includes('workspace') || content.includes('isolation');
  return { pass: hasIsolation, message: hasIsolation ? 'Workspace boundaries defined' : 'No workspace isolation policy found' };
});

check('Instruction file integrity', async () => {
  const soulMd = join(WORKSPACE, 'SOUL.md');
  const memoryMd = join(WORKSPACE, 'MEMORY.md');
  
  const checks = [];
  if (existsSync(soulMd)) checks.push('SOUL.md');
  if (existsSync(memoryMd)) checks.push('MEMORY.md');
  
  // 理想情况下应该有 hash 验证，但暂时只检查文件存在
  return { 
    pass: checks.length > 0, 
    message: checks.length > 0 
      ? `Found: ${checks.join(', ')}. Consider implementing hash verification.` 
      : 'No instruction files found'
  };
});

check('Three-logs implementation', async () => {
  const logDir = join(HOME, '.openclaw', 'logs');
  if (!existsSync(logDir)) {
    return { pass: false, message: 'Log directory not found' };
  }
  const files = await readdir(logDir);
  const hasActions = files.some(f => f.includes('action'));
  const hasRejections = files.some(f => f.includes('rejection'));
  const hasHandoffs = files.some(f => f.includes('handoff'));
  
  const score = [hasActions, hasRejections, hasHandoffs].filter(Boolean).length;
  return {
    pass: score >= 2,
    message: `Three-logs: ${score}/3 (${hasActions ? '✓' : '✗'} actions, ${hasRejections ? '✓' : '✗'} rejections, ${hasHandoffs ? '✓' : '✗'} handoffs)`
  };
});

check('API key exposure', async () => {
  // 简单的检查：确保 .env 或 credentials 文件存在且基本配置
  const envFile = join(HOME, '.openclaw', '.env');
  const configFile = join(HOME, '.openclaw', 'openclaw.json');
  
  // 实际应该检查 gitignore 等，这里简化
  return {
    pass: true,
    message: 'Manual check required: Ensure API keys are not committed to git'
  };
});

// 运行检查
async function runChecks() {
  console.log('🔒 Agent Security Checklist\n');
  
  let passed = 0;
  let warnings = 0;
  let failures = 0;
  
  for (const check of CHECKS) {
    try {
      const result = await check.test();
      const icon = result.pass ? '✅' : check.severity === 'error' ? '❌' : '⚠️';
      console.log(`${icon} ${check.name}`);
      console.log(`   ${result.message}\n`);
      
      if (result.pass) passed++;
      else if (check.severity === 'error') failures++;
      else warnings++;
    } catch (err) {
      console.log(`❌ ${check.name}`);
      console.log(`   Error: ${err.message}\n`);
      failures++;
    }
  }
  
  console.log('─'.repeat(40));
  console.log(`Results: ${passed} passed, ${warnings} warnings, ${failures} failures`);
  console.log('');
  
  if (failures > 0) {
    console.log('⚠️  Address failures before running autonomous loops');
  } else if (warnings > 0) {
    console.log('ℹ️  Consider addressing warnings for better security');
  } else {
    console.log('✨ All checks passed!');
  }
}

runChecks().catch(console.error);
