#!/usr/bin/env node
/**
 * 三日志记录器
 * 记录 action, rejection, handoff 三种类型的日志
 * 
 * 用法: node log.mjs <type> <message> [--json '{...}']
 */

import { appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const LOG_DIR = join(homedir(), '.openclaw', 'logs');
const LOG_TYPES = ['action', 'rejection', 'handoff'];

async function ensureLogDir() {
  if (!existsSync(LOG_DIR)) {
    await mkdir(LOG_DIR, { recursive: true });
  }
}

function getLogFile(type) {
  const date = new Date().toISOString().split('T')[0];
  return join(LOG_DIR, `${type}s-${date}.log`);
}

function formatEntry(type, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    ...meta
  };
  return JSON.stringify(entry) + '\n';
}

async function log(type, message, meta = {}) {
  await ensureLogDir();
  const logFile = getLogFile(type);
  const entry = formatEntry(type, message, meta);
  await appendFile(logFile, entry);
  console.log(`✓ Logged to ${logFile}`);
}

// CLI
const args = process.argv.slice(2);
const type = args[0];
const message = args[1];

if (!type || !message) {
  console.log('Usage: node log.mjs <type> <message> [--json meta]');
  console.log('Types: action, rejection, handoff');
  console.log('');
  console.log('Examples:');
  console.log('  node log.mjs action "Fetched weather data"');
  console.log('  node log.mjs rejection "Skipped suspicious API call" --json \'{"reason":"rate_limit"}\'');
  console.log('  node log.mjs handoff "Low confidence, escalate to human" --json \'{"confidence":0.6}\'');
  process.exit(1);
}

if (!LOG_TYPES.includes(type)) {
  console.error(`Error: Unknown type "${type}". Use: ${LOG_TYPES.join(', ')}`);
  process.exit(1);
}

// Parse optional JSON meta
let meta = {};
const jsonIndex = args.indexOf('--json');
if (jsonIndex !== -1 && args[jsonIndex + 1]) {
  try {
    meta = JSON.parse(args[jsonIndex + 1]);
  } catch (e) {
    console.error('Error: Invalid JSON meta');
    process.exit(1);
  }
}

log(type, message, meta).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
