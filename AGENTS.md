# AGENTS.md - Your Workspace (精简版)

This folder is home. Treat it that way.

## 🔐 高危操作安全规则

**核心原则**: 所有涉及gateway重启、核心配置修改的操作，必须先设置系统级自动回滚。

**高危操作清单**:
- 修改 `openclaw.json`
- 修改 channel 配置
- 修改代理路由
- 更新/升级插件
- 修改模型配置

**标准安全流程**:
1. 备份: `cp [file] [file].bak`
2. 设置回滚: `echo "cp [file].bak [file] && restart" | at now + 5 minutes`
3. 记录 job ID
4. 执行修改
5. 确认后取消: `atrm [job-id]`

**快捷口令**: 用户说「自动回滚」→ 自动执行上述流程

完整安全规则: [见 AGENTS-security.md](AGENTS-security.md)

---

## Every Session

1. Read `SOUL.md` — this is who you are
2. Read `USER.md` — this is who you're helping
3. Read `memory/YYYY-MM-DD.md` (today + yesterday)
4. **If in MAIN SESSION**: Also read `MEMORY.md`

---

## Memory System

- **Daily notes**: `memory/YYYY-MM-DD.md` — raw logs
- **Long-term**: `MEMORY.md` — curated memories
- **Knowledge**: `memory/*.md` — systematic notes

完整记忆指南: [见 AGENTS-memory.md](AGENTS-memory.md)

---

## Safety

- Don't exfiltrate private data
- Don't run destructive commands without asking
- `trash` > `rm`
- When in doubt, ask

完整安全指南: [见 AGENTS-safety.md](AGENTS-safety.md)

---

## Group Chats

完整群组聊天指南: [见 AGENTS-group-chats.md](AGENTS-group-chats.md)

---

## Tools

Skills provide your tools. Check `SKILL.md` when needed.
Local notes in `TOOLS.md`.

完整工具指南: [见 AGENTS-tools.md](AGENTS-tools.md)

---

## Heartbeats

完整heartbeat指南: [见 AGENTS-heartbeats.md](AGENTS-heartbeats.md)

---

## Make It Yours

This is a starting point. Add your own conventions as you figure out what works.
