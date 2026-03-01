#!/usr/bin/env node
/**
 * Health Check Endpoint
 * 快速检查所有系统状态
 * 
 * 用法: node health.mjs [--json]
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const HOME = homedir();
const LOG_DIR = join(HOME, '.openclaw', 'logs');
const WORKSPACE = join(HOME, '.openclaw', 'workspace');

const CHECKS = {
  async logs() {
    const checks = ['actions', 'rejections', 'handoffs', 'budget'];
    const today = new Date().toISOString().split('T')[0];
    const results = {};
    
    for (const type of checks) {
      const logFile = join(LOG_DIR, `${type}-${today}.log`);
      results[type] = existsSync(logFile);
    }
    
    const allExist = Object.values(results).every(v => v);
    return {
      status: allExist ? 'healthy' : 'degraded',
      details: results
    };
  },
  
  async workspace() {
    const critical = ['SOUL.md', 'AGENTS.md', 'MEMORY.md'];
    const results = {};
    
    for (const file of critical) {
      const path = join(WORKSPACE, file);
      results[file] = existsSync(path);
    }
    
    const allExist = Object.values(results).every(v => v);
    return {
      status: allExist ? 'healthy' : 'critical',
      details: results
    };
  },
  
  async budget() {
    try {
      const budgetFile = join(LOG_DIR, 'budgets.json');
      if (!existsSync(budgetFile)) {
        return { status: 'unknown', details: { reason: 'No budget file' } };
      }
      
      const data = JSON.parse(await readFile(budgetFile, 'utf-8'));
      const today = new Date().toISOString().split('T')[0];
      
      const alerts = [];
      for (const [resource, info] of Object.entries(data)) {
        const used = info.daily[today] || 0;
        const pct = (used / info.limit) * 100;
        if (pct > 90) alerts.push(`${resource}: ${pct.toFixed(1)}%`);
      }
      
      return {
        status: alerts.length > 0 ? 'warning' : 'healthy',
        details: { alerts }
      };
    } catch (e) {
      return { status: 'error', details: { error: e.message } };
    }
  },
  
  async skills() {
    const skillsDir = join(WORKSPACE, 'skills', 'agent-best-practices', 'scripts');
    const scripts = ['log.mjs', 'budget.mjs', 'security-check.mjs', 'retry.mjs'];
    const results = {};
    
    for (const script of scripts) {
      results[script] = existsSync(join(skillsDir, script));
    }
    
    const allExist = Object.values(results).every(v => v);
    return {
      status: allExist ? 'healthy' : 'critical',
      details: results
    };
  }
};

async function runHealthCheck() {
  const results = {};
  let overall = 'healthy';
  
  for (const [name, check] of Object.entries(CHECKS)) {
    try {
      results[name] = await check();
      if (results[name].status === 'critical') overall = 'critical';
      else if (results[name].status === 'warning' && overall !== 'critical') overall = 'warning';
      else if (results[name].status === 'degraded' && overall === 'healthy') overall = 'degraded';
    } catch (e) {
      results[name] = { status: 'error', details: { error: e.message } };
      overall = 'critical';
    }
  }
  
  return { overall, checks: results, timestamp: new Date().toISOString() };
}

// CLI
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');

runHealthCheck().then(result => {
  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const icons = {
      healthy: '✅',
      degraded: '⚠️',
      warning: '⚠️',
      critical: '❌',
      error: '❌',
      unknown: '❓'
    };
    
    console.log(`🏥 Health Check - ${result.timestamp}\n`);
    console.log(`Overall: ${icons[result.overall]} ${result.overall.toUpperCase()}\n`);
    
    for (const [name, check] of Object.entries(result.checks)) {
      console.log(`${icons[check.status]} ${name}: ${check.status}`);
      if (Object.keys(check.details).length > 0) {
        console.log(`   ${JSON.stringify(check.details)}`);
      }
    }
    
    console.log('\n─────────────────');
    if (result.overall === 'healthy') {
      console.log('✨ All systems operational');
    } else if (result.overall === 'critical') {
      console.log('🚨 Critical issues detected - immediate attention needed');
    } else {
      console.log('⚠️  Some issues detected - review recommended');
    }
  }
  
  process.exit(result.overall === 'critical' ? 1 : 0);
}).catch(err => {
  console.error('Health check failed:', err);
  process.exit(1);
});
