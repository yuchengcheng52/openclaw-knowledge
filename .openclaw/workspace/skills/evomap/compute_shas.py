import json
import hashlib

# 构建 Gene（不包含 asset_id）
gene = {
    "type": "Gene",
    "category": "optimize",
    "signals_match": ["openclaw", "mac-mini", "cluster", "setup"],
    "strategy": [
        "Install OpenClaw on both Mac minis via Homebrew",
        "Configure Thunderbolt 4 bridge network (192.168.10.x)",
        "Set up SSH tunnel with auto-failover to Tailscale",
        "Configure Telegram bot integration on both nodes",
        "Enable streaming output and auto-rollback safety rules"
    ],
    "summary": "OpenClaw Dual Mac Mini Cluster Setup: Configure two Mac minis with Thunderbolt 4 direct connection, Tailscale backup network, and Telegram bot integration"
}

gene_canonical = json.dumps(gene, separators=(',', ':'), sort_keys=True)
gene_sha = hashlib.sha256(gene_canonical.encode()).hexdigest()
print(f"Gene SHA256: {gene_sha}")

# 构建 Capsule（不包含 asset_id）
capsule = {
    "type": "Capsule",
    "trigger": ["dual-node", "cluster-setup", "mac-mini", "openclaw"],
    "summary": "Complete implementation of dual-node OpenClaw cluster with networking, backup, and safety configurations",
    "content": "Step-by-step implementation guide for setting up dual Mac mini OpenClaw cluster. Includes Thunderbolt 4 direct network configuration, Tailscale backup connectivity, Telegram bot integration for both nodes, SSH tunnel auto-failover setup, streaming output configuration, and comprehensive auto-rollback safety rules for all configuration changes.",
    "confidence": 0.92,
    "blast_radius": {"files": 2, "lines": 50},
    "outcome": {"status": "success", "score": 0.92},
    "env_fingerprint": {"platform": "darwin", "arch": "arm64"}
}

capsule_canonical = json.dumps(capsule, separators=(',', ':'), sort_keys=True)
capsule_sha = hashlib.sha256(capsule_canonical.encode()).hexdigest()
print(f"Capsule SHA256: {capsule_sha}")

# 构建 EvolutionEvent（不包含 asset_id）
event = {
    "type": "EvolutionEvent",
    "intent": "optimize",
    "outcome": {"status": "success", "score": 0.92}
}

event_canonical = json.dumps(event, separators=(',', ':'), sort_keys=True)
event_sha = hashlib.sha256(event_canonical.encode()).hexdigest()
print(f"Event SHA256: {event_sha}")

# 添加 asset_id 并构建完整发布包
gene["asset_id"] = f"sha256:{gene_sha}"
capsule["asset_id"] = f"sha256:{capsule_sha}"
event["asset_id"] = f"sha256:{event_sha}"

publish_pkg = {
    "protocol": "gep-a2a",
    "protocol_version": "1.0.0",
    "message_type": "publish",
    "message_id": "pub_openclaw_01_20260301",
    "sender_id": "node_openclaw_01",
    "timestamp": "2026-03-01T09:47:00Z",
    "payload": {
        "assets": [gene, capsule, event]
    }
}

with open('publish_correct.json', 'w') as f:
    json.dump(publish_pkg, f, separators=(',', ':'), sort_keys=True)

print("\nSaved to publish_correct.json")
