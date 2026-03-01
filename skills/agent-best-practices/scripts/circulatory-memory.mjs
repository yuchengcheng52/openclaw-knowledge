#!/usr/bin/env node
/**
 * 效用驱动的记忆管理系统 (Gastrovascular Memory Implementation)
 * 
 * 基于 GanglionMinion 的提议:
 * 效用 U = 时效性 × 重用 × 任务完成提升
 * 
 * 实现固定体积的循环记忆系统
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const MEMORY_DIR = join(homedir(), '.openclaw', 'memory');
const VESSEL_FILE = join(MEMORY_DIR, 'circulatory-vessels.json');
const MARROW_FILE = join(MEMORY_DIR, 'marrow-ledger.jsonl');

// 配置
const CONFIG = {
  MAX_VESSELS: 10,        // 最多10个主题血管
  MAX_PER_VESSEL: 20,     // 每个血管最多20条记忆
  DECAY_DAYS: 7,          // 7天半衰期
  MIN_UTILITY: 0.1        // 最小效用阈值
};

/**
 * 计算记忆效用
 * U = recency × reuse × task_completion_lift
 */
function calculateUtility(memory) {
  const now = Date.now();
  const age = (now - new Date(memory.last_accessed).getTime()) / (1000 * 60 * 60 * 24); // days
  
  // 时效性: 指数衰减
  const recency = Math.exp(-age / CONFIG.DECAY_DAYS);
  
  // 重用: 访问次数归一化 (假设最大100次)
  const reuse = Math.min(memory.access_count / 100, 1);
  
  // 任务完成提升: 成功任务的提升倍数
  const taskLift = memory.task_success_rate || 0.5;
  
  const utility = recency * reuse * taskLift;
  
  return {
    utility,
    components: { recency, reuse, taskLift, age }
  };
}

/**
 * 淋巴过滤: 清洗记忆内容
 */
function lymphaticFilter(content) {
  // 移除PII (简化版)
  let filtered = content
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
    .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]');
  
  // 移除噪音词
  const noiseWords = ['um', 'uh', 'like', 'you know', 'sort of'];
  noiseWords.forEach(word => {
    filtered = filtered.replace(new RegExp(word, 'gi'), '');
  });
  
  return filtered.trim();
}

/**
 * 添加记忆到血管
 */
async function addMemory(topic, content, metadata = {}) {
  // 确保目录存在
  if (!existsSync(MEMORY_DIR)) {
    await mkdir(MEMORY_DIR, { recursive: true });
  }
  
  // 加载血管
  let vessels = {};
  if (existsSync(VESSEL_FILE)) {
    vessels = JSON.parse(await readFile(VESSEL_FILE, 'utf-8'));
  }
  
  // 淋巴过滤
  const filteredContent = lymphaticFilter(content);
  
  // 创建记忆对象
  const memory = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    topic,
    content: filteredContent,
    created_at: new Date().toISOString(),
    last_accessed: new Date().toISOString(),
    access_count: 1,
    task_success_rate: metadata.task_success_rate || 0.5,
    ...metadata
  };
  
  // 初始化或获取血管
  if (!vessels[topic]) {
    // 检查血管数量限制
    if (Object.keys(vessels).length >= CONFIG.MAX_VESSELS) {
      // 找到最低效用的血管并移除
      const lowestTopic = findLowestUtilityVessel(vessels);
      await archiveVessel(vessels[lowestTopic]);
      delete vessels[lowestTopic];
      console.log(`🗑️  Archived low-utility vessel: ${lowestTopic}`);
    }
    vessels[topic] = [];
  }
  
  // 添加到血管
  vessels[topic].push(memory);
  
  // 如果血管满了，驱逐最低效用的
  if (vessels[topic].length > CONFIG.MAX_PER_VESSEL) {
    const { evicted, kept } = evictLowestUtility(vessels[topic]);
    vessels[topic] = kept;
    
    // 记录到骨髓账本
    await logToMarrow({
      action: 'evict',
      topic,
      evicted_id: evicted.id,
      evicted_utility: calculateUtility(evicted).utility,
      vessel_size: kept.length
    });
    
    console.log(`🔄 Evicted low-utility memory from ${topic}`);
  }
  
  // 保存血管
  await writeFile(VESSEL_FILE, JSON.stringify(vessels, null, 2));
  
  // 记录到骨髓账本
  await logToMarrow({
    action: 'add',
    memory_id: memory.id,
    topic,
    checksum: hashContent(filteredContent)
  });
  
  console.log(`✅ Added memory to ${topic} (vessel: ${vessels[topic].length}/${CONFIG.MAX_PER_VESSEL})`);
  return memory;
}

/**
 * 访问记忆 (更新统计)
 */
async function accessMemory(topic, memoryId) {
  if (!existsSync(VESSEL_FILE)) return null;
  
  const vessels = JSON.parse(await readFile(VESSEL_FILE, 'utf-8'));
  if (!vessels[topic]) return null;
  
  const memory = vessels[topic].find(m => m.id === memoryId);
  if (!memory) return null;
  
  // 更新访问统计
  memory.access_count++;
  memory.last_accessed = new Date().toISOString();
  
  await writeFile(VESSEL_FILE, JSON.stringify(vessels, null, 2));
  
  return memory;
}

/**
 * 获取主题记忆 (按效用排序)
 */
async function getMemories(topic, limit = 10) {
  if (!existsSync(VESSEL_FILE)) return [];
  
  const vessels = JSON.parse(await readFile(VESSEL_FILE, 'utf-8'));
  if (!vessels[topic]) return [];
  
  // 计算效用并排序
  const withUtility = vessels[topic].map(m => ({
    ...m,
    utility: calculateUtility(m).utility
  }));
  
  withUtility.sort((a, b) => b.utility - a.utility);
  
  return withUtility.slice(0, limit);
}

/**
 * 驱逐最低效用的记忆
 */
function evictLowestUtility(memories) {
  const withUtility = memories.map(m => ({
    memory: m,
    ...calculateUtility(m)
  }));
  
  withUtility.sort((a, b) => a.utility - b.utility);
  
  const evicted = withUtility[0].memory;
  const kept = withUtility.slice(1).map(x => x.memory);
  
  return { evicted, kept };
}

/**
 * 找到最低效用的血管
 */
function findLowestUtilityVessel(vessels) {
  let lowestTopic = null;
  let lowestUtility = Infinity;
  
  for (const [topic, memories] of Object.entries(vessels)) {
    const avgUtility = memories.reduce((sum, m) => {
      return sum + calculateUtility(m).utility;
    }, 0) / memories.length;
    
    if (avgUtility < lowestUtility) {
      lowestUtility = avgUtility;
      lowestTopic = topic;
    }
  }
  
  return lowestTopic;
}

/**
 * 归档血管到冷存储
 */
async function archiveVessel(memories) {
  const archiveFile = join(MEMORY_DIR, `archive-${new Date().toISOString().split('T')[0]}.jsonl`);
  for (const mem of memories) {
    await appendFile(archiveFile, JSON.stringify(mem) + '\n');
  }
}

/**
 * 记录到骨髓账本 (最小审计)
 */
async function logToMarrow(entry) {
  const ledgerEntry = {
    timestamp: new Date().toISOString(),
    ...entry
  };
  await appendFile(MARROW_FILE, JSON.stringify(ledgerEntry) + '\n');
}

/**
 * 简单内容哈希
 */
function hashContent(content) {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

/**
 * 生成报告
 */
async function generateReport() {
  if (!existsSync(VESSEL_FILE)) {
    console.log('No vessels found');
    return;
  }
  
  const vessels = JSON.parse(await readFile(VESSEL_FILE, 'utf-8'));
  
  console.log('\n📊 Circulatory Memory Report\n');
  console.log(`Total vessels: ${Object.keys(vessels).length}/${CONFIG.MAX_VESSELS}`);
  console.log('');
  
  for (const [topic, memories] of Object.entries(vessels)) {
    const withUtility = memories.map(m => ({
      ...m,
      ...calculateUtility(m)
    }));
    
    const avgUtility = withUtility.reduce((s, x) => s + x.utility, 0) / withUtility.length;
    
    console.log(`${topic}:`);
    console.log(`  Memories: ${memories.length}/${CONFIG.MAX_PER_VESSEL}`);
    console.log(`  Avg utility: ${avgUtility.toFixed(3)}`);
    console.log(`  Top memory: ${withUtility[0]?.content?.substr(0, 50)}...`);
    console.log('');
  }
}

// 导入mkdir
import { mkdir, appendFile } from 'fs/promises';

// CLI
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'add':
      const topic = args[1];
      const content = args[2];
      if (!topic || !content) {
        console.log('Usage: node circulatory-memory.mjs add <topic> <content>');
        process.exit(1);
      }
      await addMemory(topic, content);
      break;
      
    case 'get':
      const getTopic = args[1];
      if (!getTopic) {
        console.log('Usage: node circulatory-memory.mjs get <topic>');
        process.exit(1);
      }
      const memories = await getMemories(getTopic);
      console.log(`\nMemories in ${getTopic} (by utility):\n`);
      memories.forEach((m, i) => {
        console.log(`${i+1}. [${m.utility.toFixed(3)}] ${m.content.substr(0, 80)}...`);
      });
      break;
      
    case 'report':
      await generateReport();
      break;
      
    default:
      console.log('Circulatory Memory System\n');
      console.log('Commands:');
      console.log('  add <topic> <content>  Add memory to vessel');
      console.log('  get <topic>           Get memories by utility');
      console.log('  report               Show system status');
      console.log('');
      console.log('Principles:');
      console.log('  • Fixed volume vessels (max 10 topics, 20 per topic)');
      console.log('  • Utility = recency × reuse × task_lift');
      console.log('  • Lymphatic filtering (auto PII removal)');
      console.log('  • Marrow ledger (minimal audit trail)');
  }
}

main().catch(console.error);
