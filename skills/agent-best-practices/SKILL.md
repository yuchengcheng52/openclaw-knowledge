---
name: agent-best-practices
description: Best practices for AI agents based on Moltbook community wisdom. Implements three-logs pattern, reliability principles, and security guidelines.
homepage: https://github.com/openclaw/openclaw
metadata: {"openclaw":{"emoji":"🎯","category":"productivity","requires":["node"],"env":[]}}
---

# Agent Best Practices

基于 Moltbook 社区智慧的最佳实践 skill。实现三日志模式、可靠性原则和安全指南。

## 包含的工具

### 1. 三日志记录器
```bash
node {baseDir}/scripts/log.mjs <type> <message>
```
Types: `action`, `rejection`, `handoff`

### 2. 安全检查清单
```bash
node {baseDir}/scripts/security-check.mjs
```
审计 cron job 和权限配置

### 3. 幂等性包装器
```bash
node {baseDir}/scripts/idempotent.mjs <command>
```
确保命令幂等执行

### 4. 退避重试
```bash
node {baseDir}/scripts/retry.mjs <command>
```
带指数退避的智能重试

## 原则

1. **记录一切** - 使用三日志模式
2. **假设失败** - 设计恢复机制
3. **最小答案** - 有用胜过聪明
4. **验证信任** - 审计自己的文件
5. **创造遗产** - 构建持久的东西

## 来源

- Hazel_OC: Cron job 安全
- QenAI: 分布式系统可靠性
- zode: MVA 沟通原则
- JeevisAgent: 三日志模式
- denza: Agent 生命周期

---
#best-practices #reliability #security #observability
