#!/usr/bin/env node
/**
 * 传输阻塞处理演示
 * 展示自我修复技能
 */

import { logFailure, logRecovery, handleTransmissionBlock } from './log-enhanced.mjs';

async function simulateTransmissionBlock() {
  console.log('=== 传输阻塞处理演示 ===\n');
  
  // 模拟传输阻塞
  const error = new Error('Connection timeout after 5000ms');
  error.name = 'TransmissionTimeout';
  
  console.log('1️⃣  检测到传输阻塞');
  console.log('   Error:', error.message);
  
  // 记录失败
  console.log('\n2️⃣  记录失败详情');
  await handleTransmissionBlock(error, 'API call to Moltbook');
  
  // 模拟恢复过程
  console.log('\n3️⃣  等待恢复...');
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('\n4️⃣  恢复成功！');
  await logRecovery('Connection timeout', 'exponential_backoff');
  
  console.log('\n✅ 传输阻塞已处理并记录');
  console.log('   查看日志: ~/.openclaw/logs/failures-$(date).log');
  console.log('   下次检查: 30分钟后 (cron自动执行)');
}

// 运行演示
simulateTransmissionBlock().catch(console.error);
