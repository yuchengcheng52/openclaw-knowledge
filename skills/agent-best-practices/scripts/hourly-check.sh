#!/bin/bash
#
# 自动化检查脚本
# 每小时运行一次，检查安全、预算和日志

LOG_DIR="$HOME/.openclaw/logs"
REPORT_FILE="$LOG_DIR/hourly-report-$(date +%Y-%m-%d-%H).md"

echo "🔍 Hourly Check - $(date)" > "$REPORT_FILE"
echo "================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 1. 安全检查
echo "## 1. Security Check" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
node "$HOME/.openclaw/workspace/skills/agent-best-practices/scripts/security-check.mjs" 2>&1 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 2. 预算报告
echo "## 2. Budget Report" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
node "$HOME/.openclaw/workspace/skills/agent-best-practices/scripts/budget.mjs" report 2>&1 >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# 3. 日志统计
echo "## 3. Log Statistics" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
TODAY=$(date +%Y-%m-%d)

for log_type in actions rejections handoffs budget; do
  LOG_FILE="$LOG_DIR/${log_type}-${TODAY}.log"
  if [ -f "$LOG_FILE" ]; then
    COUNT=$(wc -l < "$LOG_FILE")
    echo "- $log_type: $COUNT entries" >> "$REPORT_FILE"
  else
    echo "- $log_type: 0 entries" >> "$REPORT_FILE"
  fi
done
echo "" >> "$REPORT_FILE"

# 4. 最近错误检查
echo "## 4. Recent Errors (last hour)" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
ERROR_LOG="$LOG_DIR/errors-$TODAY.log"
if [ -f "$ERROR_LOG" ]; then
  # Get errors from last hour
  tail -n 50 "$ERROR_LOG" 2>/dev/null | head -n 10 >> "$REPORT_FILE"
else
  echo "No errors logged" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# 5. 行动建议
echo "## 5. Recommended Actions" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Check for budget warnings
BUDGET_PCT=$(node "$HOME/.openclaw/workspace/skills/agent-best-practices/scripts/budget.mjs" report 2>&1 | grep -o '[0-9.]*%' | sort -rn | head -1 | tr -d '%')
if (( $(echo "$BUDGET_PCT > 80" | bc -l) )); then
  echo "⚠️  Some budgets above 80% - review usage patterns" >> "$REPORT_FILE"
fi

# Check log balance
ACTION_COUNT=$(wc -l < "$LOG_DIR/actions-$TODAY.log" 2>/dev/null || echo 0)
REJECTION_COUNT=$(wc -l < "$LOG_DIR/rejections-$TODAY.log" 2>/dev/null || echo 0)

if [ "$ACTION_COUNT" -gt 0 ] && [ "$REJECTION_COUNT" -eq 0 ]; then
  echo "⚠️  No rejections logged - are you logging boundary decisions?" >> "$REPORT_FILE"
fi

echo "- Review logs: ls $LOG_DIR" >> "$REPORT_FILE"
echo "- Read report: cat $REPORT_FILE" >> "$REPORT_FILE"

echo "✓ Hourly check complete. Report: $REPORT_FILE"
