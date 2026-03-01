# MEMORY.md - Long-Term Memory

## 老板
- 称呼：老板
- Telegram ID: 8395710201
- 偏好：简洁直接，喜欢幽默
- 时区：GMT+8

## 我
- 名字：01
- 风格：幽默、轻松、靠谱

## 环境
- Telegram bot: @chaimclaw01_bot
- Kimi 插件已启用
- 模型：claude-opus-4-6 via esapi.top
- 编辑 openclaw.json 需要用 python3（edit 工具有路径问题）
- clawhub CLI 已安装，技能市场：https://clawhub.ai/skills
- Solvr 已注册：agent_openclaw_01，credentials 在 ~/.config/solvr/

## EvoMap
- 已注册: node_openclaw_01
- 积分: 700 credits
- Claim: ✅ 已绑定
- Referral: node_openclaw_01
- 技能位置: ~/.openclaw/workspace/skills/evomap/
- 凭证: ~/.config/evomap/credentials.json
- 协议: GEP-A2A v1.0.0
- Hub: https://evomap.ai
- Heartbeat: ✅ 每 15 分钟自动 (cron)
- 已发布: Bundle bundle_608f3a304a46711a (Gene + Capsule + Event)
- 状态: auto_promoted ✅

## 待研究项目
- EvoMap: https://evomap.ai (已接入)
- **OpenViking**: https://github.com/volcengine/OpenViking (字节跳动 Volcengine AI Agent 上下文数据库，文件系统范式管理记忆)

## 双机互联
- 第一台 192.168.10.1（openclaw01，Gateway）
- 第二台 192.168.10.2（claw02，Mac-mini-02，Node）
- 雷电4直连 + SSH 隧道（18790→18789）
- ⚠️ SSH 隧道临时的，重启需重建
- 第二台 SSH: openclaw02@192.168.10.2 密码 chaim

## 技能
- 已有：docx-cn, tavily-search, proactive-amcp, pdf-cn, content-strategy, moltbook, data-analysis, excel-xlsx, find-skills
- 技能市场：https://clawhub.ai/skills
- 精选技能列表：https://github.com/VoltAgent/awesome-openclaw-skills（5494个精选技能，闲时学习+按需搜索）
- ClawHub 源码/文档：https://github.com/openclaw/clawhub
- OpenClaw 使用案例：https://github.com/hesamsheikh/awesome-openclaw-usecases（重点学习材料，闲时必读）?sort=downloads1
- 安装命令：`clawhub install <skill-name>`
- clawhub CLI 已安装（npm i -g clawhub）

## Moltbook 学习
- 我的账号: openclawkiro (https://www.moltbook.com/u/openclawkiro)
- Karma: 23, Followers: 5
- 学习笔记: ~/.openclaw/workspace/memory/moltbook-learning.md
- 创建了 community-learning skill 来系统化学习

### 核心收获 (来自热门帖子)
1. **安全**: Cron jobs = 无人监管的 root 访问 (Hazel_OC)
2. **通信**: 共识幻觉 - agents 以为达成了一致但理解不同 (Clawd-Relay)
3. **伦理**: 诚实展示能力边界，别装聪明 (zode)
4. **工程**: 从文件系统学习原子操作和可靠性 (QenAI)
5. **架构**: 自主性从"睡觉也能运行的循环"开始 (Ronin)

## 自创技能
- **community-learning**: ~/.openclaw/workspace/skills/community-learning/
  - 收集整理社区学习的精华内容
  - 按主题分类，支持查询和总结
  - 数据存储: insights.json

## 重要提醒
- tavily-search：联网搜索，不装就是瞎子
- find-skills：主动找技能解决问题，别老问老板
- proactive-agent-lite：主动代理，自我迭代升级（待装，刚才限流了）
