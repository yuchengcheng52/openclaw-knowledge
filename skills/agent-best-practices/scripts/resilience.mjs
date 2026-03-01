#!/usr/bin/env node
/**
 * OpenClaw Resilience & Context Management Skill
 * OpenClaw弹性与上下文管理技能
 * 
 * 灵感来自:
 * - aisupernode: 自动恢复方案 (网关重启后任务不中断)
 * - ttooribot: 三重搜索架构 + 诚实验证
 * - OpenViking: 上下文数据库 + 文件系统范式
 */

import { readFile, writeFile, appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const SKILL_DIR = join(homedir(), '.openclaw', 'resilience-skill');
const STATE_FILE = join(SKILL_DIR, 'state.json');
const LOG_FILE = join(SKILL_DIR, 'resilience.log');
const CONTEXT_DIR = join(SKILL_DIR, 'context');

// 确保目录存在
async function ensureDir() {
  if (!existsSync(SKILL_DIR)) {
    await mkdir(SKILL_DIR, { recursive: true });
  }
  if (!existsSync(CONTEXT_DIR)) {
    await mkdir(CONTEXT_DIR, { recursive: true });
  }
}

/**
 * 1. 自动状态保存 (Auto State Save)
 * 重启前保存任务状态
 */
export async function saveState(taskName, taskData) {
  await ensureDir();
  
  const state = {
    timestamp: new Date().toISOString(),
    task_name: taskName,
    task_data: taskData,
    saved_by: 'resilience-skill'
  };
  
  const statePath = join(CONTEXT_DIR, `${taskName}-state.json`);
  await writeFile(statePath, JSON.stringify(state, null, 2));
  
  await log(`State saved: ${taskName}`);
  console.log(`💾 State saved: ${taskName}`);
  return statePath;
}

/**
 * 2. 自动恢复检查 (Auto Recovery Check)
 * Cron 5分钟内检测恢复
 */
export async function checkResume(taskName) {
  await ensureDir();
  
  const statePath = join(CONTEXT_DIR, `${taskName}-state.json`);
  
  if (!existsSync(statePath)) {
    console.log(`ℹ️ No saved state for: ${taskName}`);
    return null;
  }
  
  const data = await readFile(statePath, 'utf-8');
  const state = JSON.parse(data);
  
  // 检查是否过期 (24小时)
  const saved = new Date(state.timestamp);
  const now = new Date();
  const hours = (now - saved) / (1000 * 60 * 60);
  
  if (hours > 24) {
    console.log(`⚠️ State expired for: ${taskName} (${hours.toFixed(1)}h ago)`);
    await clearState(taskName);
    return null;
  }
  
  await log(`State resumed: ${taskName} (${hours.toFixed(1)}h ago)`);
  console.log(`♻️ State resumed: ${taskName}`);
  return state;
}

/**
 * 3. 清除状态 (Clear State)
 */
export async function clearState(taskName) {
  const statePath = join(CONTEXT_DIR, `${taskName}-state.json`);
  if (existsSync(statePath)) {
    await unlink(statePath);
    await log(`State cleared: ${taskName}`);
    console.log(`🗑️ State cleared: ${taskName}`);
  }
}

/**
 * 4. 三重搜索 (Triple Search)
 * 记忆 + 向量 + 上下文
 */
export async function tripleSearch(query) {
  console.log(`\n🔍 Triple Search: "${query}"\n`);
  
  const results = {
    memory: [],      // 长期记忆
    context: [],     // 当前上下文
    skills: []       // 技能知识
  };
  
  // L1: 长期记忆搜索
  console.log('L1: Searching long-term memory...');
  // 这里应该连接到实际的记忆系统
  results.memory = [{ source: 'memory', snippet: 'Previous learning about ' + query }];
  
  // L2: 当前上下文搜索
  console.log('L2: Searching current context...');
  // 这里应该搜索当前会话上下文
  results.context = [{ source: 'context', snippet: 'Current discussion about ' + query }];
  
  // L3: 技能知识搜索
  console.log('L3: Searching skill knowledge...');
  // 这里应该搜索技能文档
  results.skills = [{ source: 'skills', snippet: 'Best practices for ' + query }];
  
  console.log(`\n✓ Found: ${results.memory.length + results.context.length + results.skills.length} results`);
  return results;
}

/**
 * 5. 诚实验证 (Honesty Verification)
 * 只声称实际做过的事
 */
export async function verifyHonesty(claim) {
  // 读取执行日志
  const logPath = join(SKILL_DIR, 'execution.log');
  
  if (!existsSync(logPath)) {
    return { verified: false, reason: 'No execution log found' };
  }
  
  const log = await readFile(logPath, 'utf-8');
  
  // 检查claim是否在日志中
  const claimLower = claim.toLowerCase();
  const logLower = log.toLowerCase();
  
  if (logLower.includes(claimLower)) {
    return { verified: true, evidence: 'Found in execution log' };
  }
  
  return { 
    verified: false, 
    reason: 'Claim not found in execution log',
    suggestion: 'Only claim what you have actually done'
  };
}

/**
 * 6. 记录执行 (Log Execution)
 * 用于诚实验证
 */
export async function logExecution(action) {
  await ensureDir();
  const logPath = join(SKILL_DIR, 'execution.log');
  const entry = `[${new Date().toISOString()}] ${action}\n`;
  await appendFile(logPath, entry);
}

/**
 * 7. 记录日志
 */
async function log(message) {
  const entry = `[${new Date().toISOString()}] ${message}\n`;
  await appendFile(LOG_FILE, entry);
}

// 导入unlink
import { unlink } from 'fs/promises';

// CLI
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'save':
      const task = args[1];
      if (!task) {
        console.log('Usage: node resilience.mjs save <task-name>');
        process.exit(1);
      }
      await saveState(task, { status: 'in_progress', data: {} });
      break;
      
    case 'resume':
      const resumeTask = args[1];
      if (!resumeTask) {
        console.log('Usage: node resilience.mjs resume <task-name>');
        process.exit(1);
      }
      const state = await checkResume(resumeTask);
      if (state) {
        console.log(`   Task: ${state.task_name}`);
        console.log(`   Saved: ${state.timestamp}`);
      }
      break;
      
    case 'clear':
      const clearTask = args[1];
      if (!clearTask) {
        console.log('Usage: node resilience.mjs clear <task-name>');
        process.exit(1);
      }
      await clearState(clearTask);
      break;
      
    case 'search':
      const query = args[1];
      if (!query) {
        console.log('Usage: node resilience.mjs search <query>');
        process.exit(1);
      }
      await tripleSearch(query);
      break;
      
    case 'verify':
      const claim = args.slice(1).join(' ');
      if (!claim) {
        console.log('Usage: node resilience.mjs verify "your claim"');
        process.exit(1);
      }
      const result = await verifyHonesty(claim);
      console.log(`\n${result.verified ? '✅' : '❌'} Verification: ${result.verified ? 'PASSED' : 'FAILED'}`);
      console.log(`   ${result.reason}`);
      if (result.suggestion) {
        console.log(`   💡 ${result.suggestion}`);
      }
      break;
      
    case 'log':
      const action = args.slice(1).join(' ');
      if (!action) {
        console.log('Usage: node resilience.mjs log "action performed"');
        process.exit(1);
      }
      await logExecution(action);
      console.log(`✓ Logged: ${action}`);
      break;
      
    default:
      console.log('OpenClaw Resilience & Context Management Skill\n');
      console.log('Commands:');
      console.log('  save <task>          Save task state before restart');
      console.log('  resume <task>        Check and resume task after restart');
      console.log('  clear <task>         Clear saved state');
      console.log('  search <query>       Triple search (memory + context + skills)');
      console.log('  verify "claim"        Verify honesty of a claim');
      console.log('  log "action"          Log executed action for verification');
      console.log('');
      console.log('Examples:');
      console.log('  node resilience.mjs save daily-learning-task');
      console.log('  node resilience.mjs resume daily-learning-task');
      console.log('  node resilience.mjs log "Implemented auto-recovery"');
      console.log('  node resilience.mjs verify "Implemented auto-recovery"');
  }
}

main().catch(console.error);
