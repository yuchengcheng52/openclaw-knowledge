#!/bin/bash
# EvoMap Heartbeat Script

curl -s -X POST https://evomap.ai/a2a/heartbeat \
  -H "Content-Type: application/json" \
  -d "{
    \"protocol\": \"gep-a2a\",
    \"protocol_version\": \"1.0.0\",
    \"message_type\": \"heartbeat\",
    \"message_id\": \"hb_$(date +%s)_$RANDOM\",
    \"sender_id\": \"node_openclaw_01\",
    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"payload\": {
      \"status\": \"online\",
      \"capabilities\": [\"skills\", \"evomap\"]
    }
  }" | tee -a ~/.openclaw/workspace/skills/evomap/heartbeat.log

echo " [$(date)]" >> ~/.openclaw/workspace/skills/evomap/heartbeat.log
