#!/bin/bash
#
# 自动恢复检查脚本
# 解决传输阻塞后卡死问题
#

LOG_DIR="$HOME/.openclaw/logs"
RECOVERY_LOG="$LOG_DIR/recovery-$(date +%Y-%m-%d).log"
FAILURE_FLAG="$LOG_DIR/last_failure.json"

log_recovery() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$RECOVERY_LOG"
}

# 检查是否有未恢复的失败
if [ -f "$FAILURE_FLAG" ]; then
    log_recovery "⚠️  Found unresolved failure flag"
    
    # 读取失败信息
    FAILURE_TIME=$(cat "$FAILURE_FLAG" | grep -o '"timestamp":"[^"]*"' | cut -d'"' -f4)
    FAILURE_ERROR=$(cat "$FAILURE_FLAG" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    
    log_recovery "   Original failure: $FAILURE_ERROR"
    log_recovery "   Failed at: $FAILURE_TIME"
    
    # 计算失败时间（分钟前）
    FAILURE_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$FAILURE_TIME" +%s 2>/dev/null || echo "0")
    NOW_EPOCH=$(date +%s)
    MINUTES_AGO=$(( (NOW_EPOCH - FAILURE_EPOCH) / 60 ))
    
    log_recovery "   Minutes since failure: $MINUTES_AGO"
    
    # 如果超过5分钟，尝试自动恢复
    if [ "$MINUTES_AGO" -gt 5 ]; then
        log_recovery "🔄 Attempting automatic recovery..."
        
        # 1. 检查网络连接
        if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
            log_recovery "   ✅ Network is up"
            
            # 2. 检查gateway状态
            GATEWAY_STATUS=$(openclaw gateway status 2>/dev/null | grep -o "running\|stopped" || echo "unknown")
            log_recovery "   Gateway status: $GATEWAY_STATUS"
            
            if [ "$GATEWAY_STATUS" = "stopped" ]; then
                log_recovery "   🔄 Restarting gateway..."
                openclaw gateway restart 2>/dev/null || log_recovery "   ⚠️  Gateway restart failed"
            fi
            
            # 3. 标记为已恢复
            log_recovery "✅ Recovery attempted, marking as resolved"
            mv "$FAILURE_FLAG" "$LOG_DIR/resolved_$(date +%s)_failure.json"
            
            # 4. 记录恢复日志
            node "$HOME/.openclaw/workspace/skills/agent-best-practices/scripts/log-enhanced.mjs" \
                recovery "Auto-recovered from transmission block" \
                --json '{"method":"automatic_check","trigger":"cron"}' 2>/dev/null || true
            
        else
            log_recovery "   ❌ Network is down, cannot auto-recover"
        fi
    else
        log_recovery "   ⏳ Too soon to retry (wait 5 minutes)"
    fi
else
    # 没有失败标志，正常运行
    echo "✅ No unresolved failures found at $(date)"
fi

# 无聊一致性检查 - 不管是否有失败都执行
echo ""
echo "📋 Boring Consistency Checks:"
echo "============================"

# 1. 系统健康检查
cd "$HOME/.openclaw/workspace/skills/agent-best-practices" 2>/dev/null && \
    node scripts/health.mjs --json 2>/dev/null | grep -q "healthy" && \
    echo "✅ System healthy" || echo "⚠️  System check needed"

# 2. 预算检查
node scripts/budget.mjs report 2>/dev/null | grep -E "9[0-9]|100%" && \
    echo "⚠️  Budget alert!" || echo "✅ Budget OK"

# 3. 日志轮转检查
TODAY=$(date +%Y-%m-%d)
if [ $(ls -1 "$LOG_DIR"/*-"$TODAY".log 2>/dev/null | wc -l) -gt 0 ]; then
    echo "✅ Today's logs active"
else
    echo "⚠️  No logs today yet"
fi

echo ""
echo "Next check: $(date -v+30M '+%H:%M')"
