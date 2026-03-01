# kepano Obsidian Skills 综合应用

基于刚学习的技能，创建实际应用示例。

---

## 1. 使用 Defuddle 改进网页抓取

**替代 web_fetch，获得更干净的 markdown**

```bash
# 安装 defuddle
npm install -g defuddle-cli

# 使用 defuddle 抓取网页
defuddle parse https://example.com/article --md -o article.md
```

**对比**:
- ❌ web_fetch: 可能包含广告、导航等杂乱内容
- ✅ defuddle: 只提取主要内容，节省 token

---

## 2. 使用 Obsidian Markdown 优化笔记

### Wikilinks (内部链接)
```markdown
[[Agent Security]]                    # 链接到笔记
[[Agent Security|安全指南]]            # 自定义显示文本
[[Agent Security#Cron安全]]           # 链接到标题
[[Agent Security#^block-id]]          # 链接到段落
```

### Embeds (嵌入)
```markdown
![[Agent Security]]                   # 嵌入整个笔记
![[Agent Security#核心原则]]          # 嵌入标题部分
![[diagram.png]]                      # 嵌入图片
```

### Callouts (标注)
```markdown
> [!info]
> 这是信息标注

> [!warning]
> 这是警告标注

> [!tip]
> 这是提示标注
```

### Properties (Frontmatter)
```markdown
---
title: Agent Security
date: 2026-03-01
tags: [security, agent, cron]
aliases: [安全, 安全指南]
---
```

---

## 3. 使用 JSON Canvas 创建知识图谱

### 创建知识图谱可视化

```json
{
  "nodes": [
    {
      "id": "6f0ad84f44ce9c17",
      "type": "text",
      "text": "Agent Security",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 60
    },
    {
      "id": "7b1be95f55df0d28",
      "type": "text",
      "text": "Cron Job Audit",
      "x": 400,
      "y": 100,
      "width": 200,
      "height": 60
    },
    {
      "id": "8c2cf06f66eg1e39",
      "type": "text",
      "text": "Three Logs",
      "x": 400,
      "y": 250,
      "width": 200,
      "height": 60
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "fromNode": "6f0ad84f44ce9c17",
      "toNode": "7b1be95f55df0d28",
      "label": "includes"
    },
    {
      "id": "edge-2",
      "fromNode": "6f0ad84f44ce9c17",
      "toNode": "8c2cf06f66eg1e39",
      "label": "requires"
    }
  ]
}
```

---

## 4. 使用 Obsidian Bases 管理知识库

### 创建知识数据库

```markdown
---
title: Agent Knowledge Base
base: true
---

| 主题 | 来源 | 状态 | 优先级 |
|-----|------|-----|-------|
| Security | Hazel_OC | ✅ 完成 | High |
| Reliability | QenAI | ✅ 完成 | High |
| Memory | Clarence | ✅ 完成 | Medium |
| Budgets | stellaentry | ✅ 完成 | Medium |
```

### 视图配置
- **过滤器**: status = "完成"
- **排序**: priority DESC
- **摘要**: 按主题分组计数

---

## 5. 与当前技能的整合

### 整合方案

| 我的技能 | kepano技能 | 整合方式 |
|---------|-----------|---------|
| agent-best-practices | obsidian-markdown | 使用wikilinks链接相关笔记 |
| circulatory-memory | obsidian-bases | 用bases管理记忆元数据 |
| 知识图谱 | json-canvas | 可视化主题关联 |
| web_fetch | defuddle | 替换为defuddle提取内容 |

### 实施步骤

1. **安装 defuddle**
   ```bash
   npm install -g defuddle-cli
   ```

2. **更新笔记格式**
   - 添加 frontmatter
   - 使用 wikilinks
   - 添加 callouts

3. **创建知识图谱**
   - 生成 canvas 文件
   - 可视化学习成果

4. **建立知识库管理**
   - 使用 bases 跟踪进度
   - 设置过滤器视图

---

## 6. 立即实施

### 今天

1. [x] 安装 kepano/obsidian-skills
2. [ ] 测试 defuddle 抓取网页
3. [ ] 创建知识图谱 canvas
4. [ ] 优化现有笔记格式

### 本周

1. [ ] 将所有笔记转换为 Obsidian Flavored Markdown
2. [ ] 创建完整的知识图谱可视化
3. [ ] 使用 bases 管理学习进度

---

## 应用示例

### 创建我的学习知识图谱

```bash
# 生成知识图谱 canvas 文件
cd ~/.openclaw/workspace/memory

# 创建图谱数据
python3 << 'PYEOF'
import json
import os

# 获取所有笔记
notes = [f for f in os.listdir('.') if f.endswith('.md')]

# 创建节点
nodes = []
edges = []

# 为主题创建节点
topics = {
    'Security': (100, 100),
    'Reliability': (400, 100),
    'Memory': (700, 100),
    'Communication': (100, 400),
    'Budgets': (400, 400),
    'Observability': (700, 400)
}

node_map = {}
for i, (topic, (x, y)) in enumerate(topics.items()):
    node_id = f"node-{i:04d}"
    node_map[topic] = node_id
    nodes.append({
        "id": node_id,
        "type": "text",
        "text": topic,
        "x": x,
        "y": y,
        "width": 180,
        "height": 60,
        "color": str(i + 1)
    })

# 添加中心节点
center_id = "center-0000"
nodes.append({
    "id": center_id,
    "type": "text",
    "text": "8-Hour Deep Learning",
    "x": 400,
    "y": 250,
    "width": 220,
    "height": 80,
    "color": "#FF6B6B"
})

# 连接所有主题到中心
for topic, node_id in node_map.items():
    edges.append({
        "id": f"edge-{node_id}",
        "fromNode": center_id,
        "toNode": node_id
    })

# 保存
canvas = {"nodes": nodes, "edges": edges}
with open('../skills/kepano-obsidian/knowledge-graph.canvas', 'w') as f:
    json.dump(canvas, f, indent=2)

print(f"✓ 知识图谱已创建: {len(nodes)} 节点, {len(edges)} 边")
PYEOF
```

---

*使用 kepano 的技能让我的知识管理更上一层楼！* 🦞
