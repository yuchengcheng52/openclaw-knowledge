#!/usr/bin/env node
/**
 * 预算日志记录器
 * 跟踪资源使用情况
 * 
 * 用法: node budget.mjs <action> <resource> <amount> [--limit max]
 */

import { readFile, writeFile, appendFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const LOG_DIR = join(homedir(), '.openclaw', 'logs');
const BUDGET_FILE = join(LOG_DIR, 'budgets.json');

const DEFAULT_LIMITS = {
  'api_calls': 1000,      // per day
  'compute_seconds': 3600, // per hour
  'tokens': 100000,        // per day
  'messages': 100,         // per hour
  'storage_mb': 100        // total
};

async function ensureLogDir() {
  if (!existsSync(LOG_DIR)) {
    await mkdir(LOG_DIR, { recursive: true });
  }
}

async function loadBudgets() {
  try {
    if (existsSync(BUDGET_FILE)) {
      const data = await readFile(BUDGET_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {}
  return {};
}

async function saveBudgets(budgets) {
  await writeFile(BUDGET_FILE, JSON.stringify(budgets, null, 2));
}

async function logBudget(action, resource, amount, limit = null) {
  await ensureLogDir();
  
  const budgets = await loadBudgets();
  const today = new Date().toISOString().split('T')[0];
  
  // Initialize resource tracking
  if (!budgets[resource]) {
    budgets[resource] = {
      daily: {},
      hourly: {},
      limit: limit || DEFAULT_LIMITS[resource] || 100
    };
  }
  
  // Track daily usage
  if (!budgets[resource].daily[today]) {
    budgets[resource].daily[today] = 0;
  }
  
  // Track hourly usage
  const hour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
  if (!budgets[resource].hourly[hour]) {
    budgets[resource].hourly[hour] = 0;
  }
  
  // Update usage
  if (action === 'use') {
    budgets[resource].daily[today] += parseFloat(amount);
    budgets[resource].hourly[hour] += parseFloat(amount);
  }
  
  await saveBudgets(budgets);
  
  // Log entry
  const logFile = join(LOG_DIR, `budget-${today}.log`);
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    resource,
    amount: parseFloat(amount),
    daily_total: budgets[resource].daily[today],
    hourly_total: budgets[resource].hourly[hour],
    limit: budgets[resource].limit,
    remaining: budgets[resource].limit - budgets[resource].daily[today]
  };
  
  await appendFile(logFile, JSON.stringify(entry) + '\n');
  
  // Check thresholds
  const usage = budgets[resource].daily[today];
  const pct = (usage / budgets[resource].limit) * 100;
  
  console.log(`✓ Budget logged: ${resource} +${amount} (${usage}/${budgets[resource].limit})`);
  
  if (pct >= 95) {
    console.log(`⚠️  WARNING: ${resource} at ${pct.toFixed(1)}% of daily limit!`);
  } else if (pct >= 80) {
    console.log(`ℹ️  Notice: ${resource} at ${pct.toFixed(1)}% of daily limit`);
  }
  
  // Check if exceeded
  if (usage > budgets[resource].limit) {
    console.log(`❌ ALERT: ${resource} budget exceeded!`);
    return { exceeded: true, usage, limit: budgets[resource].limit };
  }
  
  return { exceeded: false, usage, limit: budgets[resource].limit };
}

async function showReport() {
  const budgets = await loadBudgets();
  const today = new Date().toISOString().split('T')[0];
  
  console.log('📊 Budget Report\n');
  console.log(`Date: ${today}\n`);
  
  for (const [resource, data] of Object.entries(budgets)) {
    const used = data.daily[today] || 0;
    const limit = data.limit;
    const pct = (used / limit) * 100;
    const bar = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10));
    
    console.log(`${resource.padEnd(20)} ${bar} ${used}/${limit} (${pct.toFixed(1)}%)`);
  }
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

if (command === 'report') {
  showReport().catch(console.error);
} else if (command === 'use') {
  const resource = args[1];
  const amount = args[2];
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1]) : null;
  
  if (!resource || !amount) {
    console.log('Usage: node budget.mjs use <resource> <amount> [--limit max]');
    console.log('Example: node budget.mjs use api_calls 10 --limit 1000');
    process.exit(1);
  }
  
  logBudget('use', resource, amount, limit).catch(console.error);
} else {
  console.log('Budget Logger\n');
  console.log('Commands:');
  console.log('  node budget.mjs use <resource> <amount> [--limit max]');
  console.log('  node budget.mjs report');
  console.log('');
  console.log('Resources: api_calls, compute_seconds, tokens, messages, storage_mb');
}
