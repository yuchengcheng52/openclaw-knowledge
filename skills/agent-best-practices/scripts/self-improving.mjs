#!/usr/bin/env node
/**
 * Self-Improving Agent - 自我改进系统
 * 学习错误、优化表现、持续进化
 * 
 * 灵感来自: clawhub self-improving-agent (46k+ installs)
 */

import { readFile, writeFile, appendFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { mkdir } from 'fs/promises';

const LEARNING_DIR = join(homedir(), '.openclaw', 'learning');
const PATTERNS_FILE = join(LEARNING_DIR, 'error-patterns.json');
const LEARNINGS_FILE = join(LEARNING_DIR, 'learnings.md');

// 确保目录存在
async function ensureDir() {
  if (!existsSync(LEARNING_DIR)) {
    await mkdir(LEARNING_DIR, { recursive: true });
  }
}

/**
 * 记录错误和学习
 */
export async function recordError(error, context = {}) {
  await ensureDir();
  
  const errorEntry = {
    timestamp: new Date().toISOString(),
    error_type: error.name || 'Unknown',
    error_message: error.message,
    context: {
      operation: context.operation || 'unknown',
      inputs: context.inputs || {},
      expected: context.expected || 'success',
      actual: error.message
    },
    attempted_solution: context.attempted_solution || null,
    user_correction: context.user_correction || null
  };
  
  // 保存到学习日志
  await appendFile(LEARNINGS_FILE, `\n## ${new Date().toLocaleString()}\n\n` +
    `**错误**: ${error.message}\n\n` +
    `**场景**: ${context.operation}\n\n` +
    `**解决**: ${context.user_correction || '待记录'}\n\n` +
    `---\n`);
  
  // 更新错误模式
  await updateErrorPattern(errorEntry);
  
  console.log('📝 错误已记录到学习系统');
  return errorEntry;
}

/**
 * 更新错误模式统计
 */
async function updateErrorPattern(errorEntry) {
  let patterns = {};
  
  if (existsSync(PATTERNS_FILE)) {
    const data = await readFile(PATTERNS_FILE, 'utf-8');
    patterns = JSON.parse(data);
  }
  
  const type = errorEntry.error_type;
  
  if (!patterns[type]) {
    patterns[type] = {
      count: 0,
      first_seen: errorEntry.timestamp,
      last_seen: errorEntry.timestamp,
      contexts: [],
      solutions: {}
    };
  }
  
  patterns[type].count++;
  patterns[type].last_seen = errorEntry.timestamp;
  patterns[type].contexts.push(errorEntry.context.operation);
  
  // 只保留最近10个上下文
  if (patterns[type].contexts.length > 10) {
    patterns[type].contexts.shift();
  }
  
  await writeFile(PATTERNS_FILE, JSON.stringify(patterns, null, 2));
}

/**
 * 记录用户纠正
 */
export async function recordCorrection(errorType, correction, success = true) {
  await ensureDir();
  
  let patterns = {};
  if (existsSync(PATTERNS_FILE)) {
    const data = await readFile(PATTERNS_FILE, 'utf-8');
    patterns = JSON.parse(data);
  }
  
  if (patterns[errorType]) {
    if (!patterns[errorType].solutions[correction]) {
      patterns[errorType].solutions[correction] = {
        tried: 0,
        succeeded: 0
      };
    }
    
    patterns[errorType].solutions[correction].tried++;
    if (success) {
      patterns[errorType].solutions[correction].succeeded++;
    }
    
    // 计算成功率
    const sol = patterns[errorType].solutions[correction];
    sol.success_rate = parseFloat((sol.succeeded / sol.tried * 100).toFixed(1));
    
    await writeFile(PATTERNS_FILE, JSON.stringify(patterns, null, 2));
    
    console.log(`✅ 已学习: "${correction}" 解决 "${errorType}" (成功率: ${sol.success_rate}%)`);
  }
}

/**
 * 获取智能建议
 */
export async function getSuggestion(errorType) {
  if (!existsSync(PATTERNS_FILE)) {
    return null;
  }
  
  const data = await readFile(PATTERNS_FILE, 'utf-8');
  const patterns = JSON.parse(data);
  
  if (!patterns[errorType]) {
    return null;
  }
  
  const pattern = patterns[errorType];
  
  // 找出最佳解决方案
  let bestSolution = null;
  let bestRate = 0;
  let bestStats = null;
  
  for (const [solution, stats] of Object.entries(pattern.solutions)) {
    if (stats.success_rate > bestRate) {
      bestRate = stats.success_rate;
      bestSolution = solution;
      bestStats = stats;
    }
  }
  
  return {
    error_type: errorType,
    occurrence_count: pattern.count,
    best_solution: bestSolution,
    success_rate: bestRate,
    suggestion: bestSolution && bestStats ? 
      `Based on ${bestStats.tried} attempts, "${bestSolution}" has ${bestRate}% success rate.` :
      'No known solution yet. Recording for future learning.'
  };
}

/**
 * 显示进步报告
 */
export async function showProgress() {
  if (!existsSync(PATTERNS_FILE)) {
    console.log('📊 还没有学习数据');
    return;
  }
  
  const data = await readFile(PATTERNS_FILE, 'utf-8');
  const patterns = JSON.parse(data);
  
  console.log('\n🧠 Self-Improving Agent Progress Report\n');
  console.log('='.repeat(50));
  
  let totalErrors = 0;
  let totalSolutions = 0;
  
  for (const [type, pattern] of Object.entries(patterns)) {
    totalErrors += pattern.count;
    const solutionCount = Object.keys(pattern.solutions).length;
    totalSolutions += solutionCount;
    
    console.log(`\n📌 ${type}`);
    console.log(`   Occurrences: ${pattern.count}`);
    console.log(`   Solutions learned: ${solutionCount}`);
    
    if (solutionCount > 0) {
      const best = Object.entries(pattern.solutions)
        .sort((a, b) => b[1].success_rate - a[1].success_rate)[0];
      console.log(`   Best solution: "${best[0]}" (${best[1].success_rate}%)`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`📈 Total errors encountered: ${totalErrors}`);
  console.log(`💡 Total solutions learned: ${totalSolutions}`);
  console.log(`🎯 Improvement rate: ${totalSolutions > 0 ? (totalSolutions/totalErrors*100).toFixed(1) : 0}%`);
  console.log('');
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'record':
      const errorType = args[1];
      const message = args[2];
      if (!errorType || !message) {
        console.log('Usage: node self-improving.mjs record <error-type> <message>');
        process.exit(1);
      }
      await recordError(new Error(message), { operation: errorType });
      break;
      
    case 'correct':
      const type = args[1];
      const correction = args[2];
      if (!type || !correction) {
        console.log('Usage: node self-improving.mjs correct <error-type> <correction>');
        process.exit(1);
      }
      await recordCorrection(type, correction);
      break;
      
    case 'suggest':
      const errType = args[1];
      if (!errType) {
        console.log('Usage: node self-improving.mjs suggest <error-type>');
        process.exit(1);
      }
      const suggestion = await getSuggestion(errType);
      if (suggestion) {
        console.log(`\n💡 Suggestion for "${errType}":`);
        console.log(`   ${suggestion.suggestion}`);
      } else {
        console.log(`\n❓ No previous data for "${errType}"`);
      }
      break;
      
    case 'progress':
      await showProgress();
      break;
      
    default:
      console.log('Self-Improving Agent\n');
      console.log('Commands:');
      console.log('  record <type> <message>  Record an error');
      console.log('  correct <type> <solution>  Record a successful correction');
      console.log('  suggest <type>            Get suggestion for error type');
      console.log('  progress                  Show learning progress');
      console.log('');
      console.log('Example:');
      console.log('  node self-improving.mjs record transmission_timeout "Connection failed"');
      console.log('  node self-improving.mjs correct transmission_timeout "Use exponential backoff"');
      console.log('  node self-improving.mjs suggest transmission_timeout');
  }
}

main().catch(console.error);
