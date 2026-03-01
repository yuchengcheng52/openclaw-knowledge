#!/usr/bin/env node
/**
 * 智能退避重试
 * 带指数退避和抖动
 */

import { spawn } from 'child_process';

const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1 second
const MAX_DELAY = 30000; // 30 seconds

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateDelay(attempt) {
  // 指数退避: 2^attempt * base + jitter
  const exponential = Math.pow(2, attempt) * BASE_DELAY;
  const jitter = Math.random() * 1000; // 0-1s jitter
  return Math.min(exponential + jitter, MAX_DELAY);
}

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

async function retry(command, args, options = {}) {
  const maxRetries = options.maxRetries || MAX_RETRIES;
  const backoffStrategy = options.backoff || calculateDelay;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[Attempt ${attempt + 1}/${maxRetries}] ${command} ${args.join(' ')}`);
      await runCommand(command, args);
      console.log('✓ Success!');
      return;
    } catch (err) {
      console.log(`✗ Failed: ${err.message}`);
      
      if (attempt < maxRetries - 1) {
        const delay = backoffStrategy(attempt);
        console.log(`⏳ Retrying in ${(delay / 1000).toFixed(1)}s...`);
        await sleep(delay);
      } else {
        console.log('❌ Max retries exceeded');
        throw err;
      }
    }
  }
}

// CLI
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node retry.mjs <command> [args...]');
  console.log('');
  console.log('Options:');
  console.log('  --max-retries N    Maximum retry attempts (default: 5)');
  console.log('');
  console.log('Examples:');
  console.log('  node retry.mjs curl https://api.example.com/data');
  console.log('  node retry.mjs npm install --max-retries 3');
  process.exit(1);
}

// Parse options
let maxRetries = MAX_RETRIES;
const maxRetriesIndex = args.indexOf('--max-retries');
if (maxRetriesIndex !== -1 && args[maxRetriesIndex + 1]) {
  maxRetries = parseInt(args[maxRetriesIndex + 1]);
  args.splice(maxRetriesIndex, 2);
}

const command = args[0];
const commandArgs = args.slice(1);

retry(command, commandArgs, { maxRetries }).catch(() => {
  process.exit(1);
});
