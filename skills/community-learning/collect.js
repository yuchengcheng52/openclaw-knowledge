#!/usr/bin/env node
/**
 * Community Learning Skill
 * Collect and organize insights from AI communities
 */

const fs = require('fs');
const path = require('path');

const INSIGHTS_FILE = path.join(__dirname, 'insights.json');

function loadInsights() {
  try {
    const data = fs.readFileSync(INSIGHTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return { insights: [], meta: { lastUpdated: new Date().toISOString(), totalInsights: 0, sources: [], topics: [] } };
  }
}

function saveInsights(data) {
  fs.writeFileSync(INSIGHTS_FILE, JSON.stringify(data, null, 2));
}

function addInsight(content, source, topic, options = {}) {
  const data = loadInsights();
  const insight = {
    id: String(data.insights.length + 1),
    content,
    source,
    topic,
    subtopic: options.subtopic || '',
    date: new Date().toISOString().split('T')[0],
    karma: options.karma || 0,
    url: options.url || '',
    tags: options.tags || []
  };
  
  data.insights.push(insight);
  data.meta.totalInsights = data.insights.length;
  data.meta.lastUpdated = new Date().toISOString();
  
  // Update topics list
  const topics = new Set(data.meta.topics);
  topics.add(topic);
  data.meta.topics = Array.from(topics);
  
  saveInsights(data);
  console.log(`✅ Added insight #${insight.id} on "${topic}"`);
  return insight;
}

function reviewByTopic(topic) {
  const data = loadInsights();
  const filtered = data.insights.filter(i => 
    i.topic === topic || i.subtopic === topic || i.tags.includes(topic)
  );
  
  if (filtered.length === 0) {
    console.log(`No insights found for topic: ${topic}`);
    return;
  }
  
  console.log(`\n📚 Insights on "${topic}":\n`);
  filtered.forEach(i => {
    console.log(`[${i.id}] ${i.content}`);
    console.log(`   Source: ${i.source} | 👍 ${i.karma} | ${i.date}`);
    if (i.tags.length) console.log(`   Tags: ${i.tags.join(', ')}`);
    console.log();
  });
}

function listTopics() {
  const data = loadInsights();
  console.log('\n📑 Available topics:\n');
  
  const topicCounts = {};
  data.insights.forEach(i => {
    topicCounts[i.topic] = (topicCounts[i.topic] || 0) + 1;
  });
  
  Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([topic, count]) => {
      console.log(`  • ${topic}: ${count} insight(s)`);
    });
  
  console.log(`\nTotal: ${data.meta.totalInsights} insights from ${data.meta.sources.join(', ')}`);
}

function generateSummary() {
  const data = loadInsights();
  const today = new Date().toISOString().split('T')[0];
  
  console.log('\n📊 Community Learning Summary\n');
  console.log(`Last updated: ${data.meta.lastUpdated}`);
  console.log(`Total insights: ${data.meta.totalInsights}`);
  console.log(`Topics covered: ${data.meta.topics.join(', ')}`);
  
  // Top insights by karma
  console.log('\n🏆 Top insights by karma:\n');
  data.insights
    .sort((a, b) => b.karma - a.karma)
    .slice(0, 3)
    .forEach((i, idx) => {
      console.log(`${idx + 1}. [${i.karma}👍] ${i.content.substring(0, 80)}...`);
      console.log(`   ${i.source} | ${i.topic}`);
    });
  
  // Recent additions
  const recent = data.insights.filter(i => i.date === today);
  if (recent.length > 0) {
    console.log(`\n🆕 Added today (${recent.length}):`);
    recent.forEach(i => console.log(`  • [${i.topic}] ${i.content.substring(0, 60)}...`));
  }
}

// CLI
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'add':
    const content = args[1];
    const source = args.find(a => a.startsWith('--source='))?.split('=')[1] || 'Unknown';
    const topic = args.find(a => a.startsWith('--topic='))?.split('=')[1] || 'general';
    const tags = args.find(a => a.startsWith('--tags='))?.split('=')[1]?.split(',') || [];
    addInsight(content, source, topic, { tags });
    break;
    
  case 'review':
    const reviewTopic = args.find(a => a.startsWith('--topic='))?.split('=')[1] || args[1];
    if (!reviewTopic) {
      console.log('Usage: review --topic=<topic>');
      process.exit(1);
    }
    reviewByTopic(reviewTopic);
    break;
    
  case 'topics':
    listTopics();
    break;
    
  case 'summary':
    generateSummary();
    break;
    
  default:
    console.log(`
Community Learning Skill

Usage:
  collect.js add "insight text" --source="Author" --topic="category"
  collect.js review --topic="security"
  collect.js topics
  collect.js summary
`);
}
