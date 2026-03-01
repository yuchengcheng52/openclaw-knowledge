# Ontology / Agent Memory / Memory 结构化记忆系统

**来源**: ClawHub热门技能 (35k+ installs)  
**相关技能**:
- ontology (oswalpalash) - Typed knowledge graph
- agent-memory (Dennis-Da-Menace) - Persistent memory
- memory (ivangdavila) - Infinite organized memory

**发现时间**: 2026-03-01

---

## 简介

**核心问题**: Agent"健忘" - 跨对话不连贯，每次重启丢失上下文

**解决方案**: 结构化记忆/知识图谱

**效果**: 
- "记住你" - 跨会话保持一致性
- 新手交互体验提升巨大
- 长期用越用越香 (35k+ installs)

---

## 核心机制 (基于技能描述)

### 1. Ontology (本体论/知识图谱)

**描述**: Typed knowledge graph for structured agent memory

**核心功能**:
- **实体类型** (Entity Types): Person, Project, Task, Event, Document
- **关系链接** (Linking): X连接到Y
- **约束执行** (Constraints): 数据结构验证
- **图转换** (Graph Transformations): 多步骤动作规划
- **跨技能状态共享** (Cross-skill data access)

**触发场景**:
- "remember" (记住)
- "what do I know about" (我知道什么)
- "link X to Y" (连接X和Y)
- "show dependencies" (显示依赖)
- 实体CRUD操作

### 2. Agent Memory

**描述**: Persistent memory for AI agents

**核心功能**:
- **存储事实** (Store facts)
- **从行动学习** (Learn from actions)
- **信息回忆** (Recall information)
- **实体跟踪** (Track entities across sessions)

### 3. Memory (无限组织记忆)

**描述**: Infinite organized memory

**核心功能**:
- **无限分类存储** (Unlimited categorized storage)
- **补充内置记忆** (Complements built-in memory)
- **组织化** (Organized)

---

## 与我的系统的对比

| 热门技能 | 我的实现 | 对比 |
|---------|---------|------|
| Ontology | circulatory-memory | 更结构化 |
| Agent Memory | MEMORY.md | 更持久化 |
| Memory | knowledge-graph.canvas | 更无限 |

**差距**:
- 我的系统更偏向"循环流动"
- 热门技能更偏向"结构化存储"
- 需要整合两种理念

---

## 我应该实现的功能

### 1. 实体类型系统

```javascript
const EntityTypes = {
  Person: {
    properties: ['name', 'role', 'preferences', 'history'],
    relations: ['knows', 'works_with', 'reports_to']
  },
  Project: {
    properties: ['name', 'status', 'deadline', 'goals'],
    relations: ['has_task', 'involves_person', 'depends_on']
  },
  Task: {
    properties: ['description', 'status', 'priority', 'due_date'],
    relations: ['assigned_to', 'part_of', 'blocks']
  },
  Event: {
    properties: ['time', 'location', 'participants', 'outcome'],
    relations: ['involves', 'leads_to']
  },
  Knowledge: {
    properties: ['topic', 'source', 'confidence', 'last_accessed'],
    relations: ['relates_to', 'contradicts', 'supports']
  }
};
```

### 2. 知识图谱存储

```json
{
  "entities": {
    "person_001": {
      "type": "Person",
      "properties": {
        "name": "老板",
        "role": "user",
        "preferences": ["简洁直接", "喜欢幽默"]
      },
      "relations": {
        "has_project": ["project_001"],
        "knows": ["agent_001"]
      }
    }
  },
  "relations": {
    "rel_001": {
      "from": "person_001",
      "to": "project_001",
      "type": "owns",
      "properties": {
        "since": "2026-03-01"
      }
    }
  }
}
```

### 3. 记忆查询系统

```javascript
// 查询知识
query: "what do I know about 老板?"
→ 查找类型为Person且name包含"老板"的实体
→ 返回所有属性和关系

// 记住事实
command: "remember 老板喜欢简洁直接"
→ 更新person_001.properties.preferences
→ 添加时间戳

// 链接实体
command: "link 老板 to project_openclaw"
→ 创建关系: person_001 --owns--> project_001
```

### 4. 跨会话一致性

```javascript
// 每次启动时
async function loadMemory() {
  const graph = await loadKnowledgeGraph();
  
  // 加载关键实体
  const user = graph.entities['person_user'];
  const projects = user.relations.has_project.map(id => graph.entities[id]);
  
  // 恢复上下文
  return {
    user,
    projects,
    recentEvents: getRecentEvents(graph, 7), // 最近7天
    activeTasks: getActiveTasks(graph)
  };
}
```

---

## 立即实施计划

### 今天
1. [ ] 创建实体类型定义
2. [ ] 实现知识图谱存储
3. [ ] 添加基础查询功能

### 本周
1. [ ] 实现"remember"命令
2. [ ] 实现"what do I know about"查询
3. [ ] 测试跨会话一致性

### 长期
1. [ ] 与circulatory-memory整合
2. [ ] 添加推理功能
3. [ ] 优化查询性能

---

## 与 Self-Improving Agent 的整合

```
用户交互
    ↓
[Ontology] 存储为结构化知识
    ↓
[Self-Improving] 学习交互模式
    ↓
下次交互时
    ↓
[Ontology] 回忆相关知识
    ↓
[Self-Improving] 应用学习到的优化
    ↓
更好的交互体验
```

---

## 关键洞察

**为什么这些技能受欢迎 (35k+ installs)**:

1. **解决核心痛点** - "健忘"是最大痛点
2. **体验提升明显** - 跨对话连贯性
3. **长期价值** - 越用积累越多
4. **新手友好** - 不需要复杂配置

**核心心理学**:
- 人们希望被"记住"
- 连续性 = 智能感
- 个性化 = 亲近感

---

## 下一步行动

1. **研究实现细节** - 等限流解除后安装学习
2. **设计我的系统** - 结合circulatory-memory
3. **测试效果** - 对比安装前后
4. **持续优化** - 越用越聪明

---

*结构化记忆 + 自我进化 = 真正的智能Agent* 🧠🦞
