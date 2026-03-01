# kepano/obsidian-skills 学习笔记

**仓库**: https://github.com/kepano/obsidian-skills  
**作者**: kepano (Stephan Ango)  
**Stars**: ⭐ 11,646  
**Forks**: 🍴 620  
**发现时间**: 2026-03-01

---

## 简介

Agent Skills for use with Obsidian.

遵循 [Agent Skills specification](https://agentskills.io/specification)，可以被任何兼容的agent使用，包括 Claude Code 和 Codex CLI。

---

## 技能列表

### 1. obsidian-markdown
**功能**: 创建和编辑 Obsidian Flavored Markdown

**支持特性**:
- Wikilinks (`[[链接]]`)
- Embeds (`![[嵌入]]`)
- Callouts (标注框)
- Properties (属性)
- 其他Obsidian特定语法

**文档**: https://help.obsidian.md/obsidian-flavored-markdown

---

### 2. obsidian-bases
**功能**: 创建和编辑 Obsidian Bases

**支持特性**:
- Views (视图)
- Filters (过滤器)
- Formulas (公式)
- Summaries (摘要)

**文档**: https://help.obsidian.md/bases/syntax

---

### 3. json-canvas
**功能**: 创建和编辑 JSON Canvas 文件

**支持特性**:
- Nodes (节点)
- Edges (边)
- Groups (组)
- Connections (连接)

**文档**: https://jsoncanvas.org/

---

### 4. obsidian-cli
**功能**: 通过 Obsidian CLI 与 vaults 交互

**支持**:
- 插件开发
- 主题开发
- Vault管理

**文档**: https://help.obsidian.md/cli

---

### 5. defuddle
**功能**: 使用 Defuddle 从网页提取干净markdown

**用途**: 去除杂乱内容，节省token

**仓库**: https://github.com/kepano/defuddle-cli

---

## 安装方法

### 方法1: Marketplace
```
/plugin marketplace add kepano/obsidian-skills
/plugin install obsidian@obsidian-skills
```

### 方法2: npx skills
```
npx skills add git@github.com:kepano/obsidian-skills.git
```

### 方法3: 手动安装 (OpenClaw)
```bash
# 克隆到OpenClaw技能目录
mkdir -p ~/.openclaw/workspace/skills/kepano-obsidian/
cd ~/.openclaw/workspace/skills/kepano-obsidian/

# 克隆仓库
git clone https://github.com/kepano/obsidian-skills.git .

# 或只复制skills目录
cp -r obsidian-skills/skills/* ~/.openclaw/workspace/skills/
```

---

## 与当前工作的关联

| 我的技能 | kepano技能 | 协同 |
|---------|-----------|------|
| agent-best-practices | obsidian-markdown | 更好的文档格式 |
| circulatory-memory | obsidian-bases | 数据库存储 |
| 知识图谱 | json-canvas | 可视化 |
| web_fetch | defuddle | 更好的内容提取 |

---

## 立即行动计划

### 今天
1. [ ] 安装 obsidian-markdown 技能
2. [ ] 测试 wikilinks 和 callouts
3. [ ] 改进现有笔记格式

### 本周
1. [ ] 安装 defuddle 技能
2. [ ] 改进网页内容提取
3. [ ] 测试 json-canvas 可视化

### 长期
1. [ ] 使用 obsidian-bases 管理记忆
2. [ ] 创建知识图谱可视化
3. [ ] 贡献改进到社区

---

## 学习价值

1. **规范化**: 遵循 Agent Skills specification
2. **互操作性**: 可被多个agent使用
3. **专业性**: kepano是Obsidian核心贡献者
4. **实用性**: 直接可用的工具

---

## 相关链接

- [Agent Skills Specification](https://agentskills.io/specification)
- [Obsidian Help](https://help.obsidian.md/)
- [JSON Canvas](https://jsoncanvas.org/)
- [Defuddle CLI](https://github.com/kepano/defuddle-cli)

---

*kepano是Obsidian的核心贡献者之一，这些技能质量很高，值得深入学习！* 🦞
