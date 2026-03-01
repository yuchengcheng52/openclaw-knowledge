#!/usr/bin/env node
/**
 * Structured Memory / Ontology System
 * 结构化记忆/知识图谱系统
 * 
 * 灵感来自: ontology, agent-memory, memory (35k+ installs)
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { mkdir } from 'fs/promises';

const MEMORY_DIR = join(homedir(), '.openclaw', 'structured-memory');
const KNOWLEDGE_FILE = join(MEMORY_DIR, 'knowledge-graph.json');

// 实体类型定义
const ENTITY_TYPES = {
  Person: {
    description: 'A person the agent interacts with',
    properties: ['name', 'role', 'preferences', 'notes'],
    relations: ['knows', 'works_with', 'owns']
  },
  Project: {
    description: 'A project or initiative',
    properties: ['name', 'status', 'goals', 'deadline'],
    relations: ['has_task', 'involves', 'depends_on']
  },
  Task: {
    description: 'A specific task or action item',
    properties: ['description', 'status', 'priority', 'due_date'],
    relations: ['assigned_to', 'part_of', 'blocks']
  },
  Knowledge: {
    description: 'Learned information or facts',
    properties: ['topic', 'content', 'source', 'confidence'],
    relations: ['relates_to', 'contradicts', 'supports']
  },
  Event: {
    description: 'A significant event',
    properties: ['description', 'time', 'outcome'],
    relations: ['involves', 'leads_to']
  }
};

// 确保目录存在
async function ensureDir() {
  if (!existsSync(MEMORY_DIR)) {
    await mkdir(MEMORY_DIR, { recursive: true });
  }
}

// 加载知识图谱
async function loadKnowledgeGraph() {
  if (!existsSync(KNOWLEDGE_FILE)) {
    return { entities: {}, relations: {} };
  }
  const data = await readFile(KNOWLEDGE_FILE, 'utf-8');
  return JSON.parse(data);
}

// 保存知识图谱
async function saveKnowledgeGraph(graph) {
  await ensureDir();
  await writeFile(KNOWLEDGE_FILE, JSON.stringify(graph, null, 2));
}

// 生成唯一ID
function generateId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 记住一个实体
 */
export async function rememberEntity(type, properties, relations = {}) {
  if (!ENTITY_TYPES[type]) {
    console.error(`❌ Unknown entity type: ${type}`);
    console.log(`Available types: ${Object.keys(ENTITY_TYPES).join(', ')}`);
    return null;
  }
  
  const graph = await loadKnowledgeGraph();
  const id = generateId(type.toLowerCase());
  
  graph.entities[id] = {
    type,
    properties: {
      ...properties,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    relations
  };
  
  await saveKnowledgeGraph(graph);
  
  console.log(`✅ Remembered ${type}: "${properties.name || id}"`);
  console.log(`   ID: ${id}`);
  
  return id;
}

/**
 * 查询知识
 */
export async function queryKnowledge(query, type = null) {
  const graph = await loadKnowledgeGraph();
  const results = [];
  
  const query_lower = query.toLowerCase();
  
  for (const [id, entity] of Object.entries(graph.entities)) {
    // 如果指定了类型，过滤
    if (type && entity.type !== type) continue;
    
    // 搜索属性
    for (const [key, value] of Object.entries(entity.properties)) {
      if (String(value).toLowerCase().includes(query_lower)) {
        results.push({ id, entity, matched_field: key });
        break;
      }
    }
  }
  
  return results;
}

/**
 * 链接两个实体
 */
export async function linkEntities(fromId, toId, relationType, properties = {}) {
  const graph = await loadKnowledgeGraph();
  
  if (!graph.entities[fromId]) {
    console.error(`❌ Entity not found: ${fromId}`);
    return false;
  }
  if (!graph.entities[toId]) {
    console.error(`❌ Entity not found: ${toId}`);
    return false;
  }
  
  const relationId = generateId('rel');
  
  graph.relations[relationId] = {
    from: fromId,
    to: toId,
    type: relationType,
    properties: {
      ...properties,
      created_at: new Date().toISOString()
    }
  };
  
  // 更新实体的关系列表
  if (!graph.entities[fromId].relations[relationType]) {
    graph.entities[fromId].relations[relationType] = [];
  }
  graph.entities[fromId].relations[relationType].push(toId);
  
  await saveKnowledgeGraph(graph);
  
  console.log(`✅ Linked: ${fromId} --${relationType}--> ${toId}`);
  return true;
}

/**
 * 显示知识图谱
 */
export async function showKnowledgeGraph() {
  const graph = await loadKnowledgeGraph();
  
  console.log('\n🧠 Structured Memory / Knowledge Graph\n');
  console.log('='.repeat(60));
  
  const entityCount = Object.keys(graph.entities).length;
  const relationCount = Object.keys(graph.relations).length;
  
  console.log(`\n📊 Overview:`);
  console.log(`   Entities: ${entityCount}`);
  console.log(`   Relations: ${relationCount}`);
  
  // 按类型分组
  const byType = {};
  for (const [id, entity] of Object.entries(graph.entities)) {
    if (!byType[entity.type]) byType[entity.type] = [];
    byType[entity.type].push({ id, ...entity });
  }
  
  console.log(`\n📋 By Type:`);
  for (const [type, entities] of Object.entries(byType)) {
    console.log(`\n   ${type} (${entities.length}):`);
    for (const e of entities.slice(0, 3)) {
      const name = e.properties.name || e.id;
      console.log(`      - ${name}`);
    }
    if (entities.length > 3) {
      console.log(`      ... and ${entities.length - 3} more`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('');
}

/**
 * 获取实体的完整信息
 */
export async function getEntity(entityId) {
  const graph = await loadKnowledgeGraph();
  const entity = graph.entities[entityId];
  
  if (!entity) {
    console.log(`❌ Entity not found: ${entityId}`);
    return null;
  }
  
  console.log(`\n📌 ${entity.type}: ${entity.properties.name || entityId}`);
  console.log(`   ID: ${entityId}`);
  console.log(`   Properties:`);
  for (const [key, value] of Object.entries(entity.properties)) {
    if (key !== 'name') {
      console.log(`      ${key}: ${value}`);
    }
  }
  
  if (Object.keys(entity.relations).length > 0) {
    console.log(`   Relations:`);
    for (const [relType, targets] of Object.entries(entity.relations)) {
      for (const targetId of targets) {
        const target = graph.entities[targetId];
        const targetName = target ? (target.properties.name || targetId) : targetId;
        console.log(`      ${relType} --> ${targetName}`);
      }
    }
  }
  
  return entity;
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

async function main() {
  switch (command) {
    case 'remember':
      const type = args[1];
      const name = args[2];
      if (!type || !name) {
        console.log('Usage: node structured-memory.mjs remember <type> <name>');
        console.log(`Types: ${Object.keys(ENTITY_TYPES).join(', ')}`);
        process.exit(1);
      }
      await rememberEntity(type, { name });
      break;
      
    case 'query':
      const query = args[1];
      if (!query) {
        console.log('Usage: node structured-memory.mjs query <search>');
        process.exit(1);
      }
      const results = await queryKnowledge(query);
      console.log(`\n🔍 Found ${results.length} results for "${query}":`);
      for (const r of results) {
        console.log(`   - ${r.entity.type}: ${r.entity.properties.name || r.id}`);
      }
      break;
      
    case 'link':
      const fromId = args[1];
      const toId = args[2];
      const relType = args[3] || 'relates_to';
      if (!fromId || !toId) {
        console.log('Usage: node structured-memory.mjs link <from-id> <to-id> [relation-type]');
        process.exit(1);
      }
      await linkEntities(fromId, toId, relType);
      break;
      
    case 'show':
    case 'graph':
      await showKnowledgeGraph();
      break;
      
    case 'get':
      const id = args[1];
      if (!id) {
        console.log('Usage: node structured-memory.mjs get <entity-id>');
        process.exit(1);
      }
      await getEntity(id);
      break;
      
    default:
      console.log('Structured Memory / Ontology System\n');
      console.log('Commands:');
      console.log('  remember <type> <name>   Remember an entity');
      console.log('  query <search>            Query knowledge');
      console.log('  link <from> <to> [type]   Link two entities');
      console.log('  show                      Show knowledge graph');
      console.log('  get <id>                  Get entity details');
      console.log('');
      console.log('Entity Types:');
      for (const [type, info] of Object.entries(ENTITY_TYPES)) {
        console.log(`  ${type}: ${info.description}`);
      }
      console.log('');
      console.log('Examples:');
      console.log('  node structured-memory.mjs remember Person "老板"');
      console.log('  node structured-memory.mjs query "老板"');
      console.log('  node structured-memory.mjs show');
  }
}

main().catch(console.error);
