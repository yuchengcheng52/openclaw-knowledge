# Agent Best Practices - 自动化部署指南

## 快速设置

### 1. 每小时健康检查

添加到 crontab:
```bash
# 编辑 crontab
crontab -e

# 添加以下行 (每小时运行健康检查)
0 * * * * cd ~/.openclaw/workspace/skills/agent-best-practices && node scripts/health.mjs --json >> ~/.openclaw/logs/health-checks.log 2>&1

# 添加以下行 (每小时运行完整检查)
0 * * * * ~/.openclaw/workspace/skills/agent-best-practices/scripts/hourly-check.sh
```

### 2. 每日日志轮转

```bash
# 每天凌晨归档日志
0 0 * * * cd ~/.openclaw/logs && tar -czf archive-$(date +\%Y\%m\%d).tar.gz *.log && rm -f *.log
```

### 3. 每周安全审计

```bash
# 每周一早上运行安全审计
0 9 * * 1 cd ~/.openclaw/workspace/skills/agent-best-practices && node scripts/security-check.mjs > ~/.openclaw/logs/weekly-security-$(date +\%Y\%m\%d).log 2>&1
```

### 4. 实时预算监控

```bash
# 每10分钟检查预算 (如果超过80%发送警告)
*/10 * * * * cd ~/.openclaw/workspace/skills/agent-best-practices && node scripts/budget.mjs report | grep -E "(8[0-9]|9[0-9])%" && echo "Budget warning at $(date)" >> ~/.openclaw/logs/budget-alerts.log
```

## 完整 Cron 配置示例

```bash
# Agent Best Practices - 完整自动化
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin

# 每小时健康检查
0 * * * * cd ~/.openclaw/workspace/skills/agent-best-practices && node scripts/health.mjs >> ~/.openclaw/logs/cron-health.log 2>&1

# 每小时完整检查
0 * * * * ~/.openclaw/workspace/skills/agent-best-practices/scripts/hourly-check.sh

# 每10分钟预算监控
*/10 * * * * cd ~/.openclaw/workspace/skills/agent-best-practices && node scripts/budget.mjs report >> ~/.openclaw/logs/budget-monitor.log 2>&1

# 每日日志归档 (凌晨3点)
0 3 * * * cd ~/.openclaw/logs && tar -czf archive-$(date +\%Y\%m\%d).tar.gz *.log 2>/dev/null && rm -f *.log

# 每周安全审计 (周一早9点)
0 9 * * 1 cd ~/.openclaw/workspace/skills/agent-best-practices && node scripts/security-check.mjs > ~/.openclaw/logs/weekly-security-$(date +\%Y\%m\%d).log 2>&1

# 每周知识库备份 (周日凌晨2点)
0 2 * * 0 cd ~/.openclaw/workspace && tar -czf ~/backups/workspace-$(date +\%Y\%m\%d).tar.gz memory skills
```

## 备份策略

### 本地备份
```bash
# 创建备份目录
mkdir -p ~/backups/agent-knowledge

# 每日备份知识库
rsync -av ~/.openclaw/workspace/memory/ ~/backups/agent-knowledge/memory/
rsync -av ~/.openclaw/workspace/skills/ ~/backups/agent-knowledge/skills/
```

### Git 备份 (推荐)
```bash
# 初始化 git 仓库
cd ~/.openclaw/workspace
git init
git add memory/ skills/
git commit -m "Initial knowledge base"

# 每日自动提交
0 23 * * * cd ~/.openclaw/workspace && git add -A && git commit -m "Daily update $(date +\%Y-\%m-\%d)" && git push origin main 2>/dev/null || true
```

## 监控和告警

### 健康检查失败告警
```bash
# 如果健康检查返回非零，发送通知
0 * * * * cd ~/.openclaw/workspace/skills/agent-best-practices && node scripts/health.mjs || echo "CRITICAL: Health check failed at $(date)" >> ~/.openclaw/logs/critical-alerts.log
```

### 预算超限告警
```bash
# 如果任何预算超过95%
*/10 * * * * cd ~/.openclaw/workspace/skills/agent-best-practices && node scripts/budget.mjs report | grep -E "9[5-9]%|100%" && echo "BUDGET EXCEEDED at $(date)" >> ~/.openclaw/logs/critical-alerts.log
```

## 故障排除

### 检查 cron 日志
```bash
# macOS
grep CRON /var/log/system.log | tail -20

# Linux
grep CRON /var/log/syslog | tail -20
```

### 手动测试
```bash
# 测试健康检查
cd ~/.openclaw/workspace/skills/agent-best-practices
node scripts/health.mjs

# 测试安全检查
node scripts/security-check.mjs

# 测试预算报告
node scripts/budget.mjs report
```

### 常见问题

**Q: Cron 任务没有运行?**
A: 检查路径是否正确，使用绝对路径

**Q: 日志文件没有创建?**
A: 确保 ~/.openclaw/logs 目录存在且有写权限

**Q: Node 命令找不到?**
A: 在 crontab 中设置完整 PATH

---
#deployment #automation #cron #monitoring #backup
