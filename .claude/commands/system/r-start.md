> ⚠️ PROJECT SCOPED: Read only from this project's .claude/ and .context/ directories.

## Local Cache First — load in this order

1. .claude/skills/_base.md
2. .claude/skills/_stack.md
3. .claude/skills/_modules-index.md
If any are marked 🔴 Cold, note it and continue — do not stop.

## Then load full memory

4. CLAUDE.md (already loaded by Claude Code)
5. .context/MEMORY.md
6. .context/SESSION-SUMMARY.md
7. .claude/memory/context.md
8. .claude/memory/architecture.md
9. .claude/memory/rules.md
10. .claude/memory/patterns.md
11. .claude/memory/gotchas.md
12. .claude/memory/dependencies.md
13. Last 3 files in .claude/tasks/logs/
14. Last file in .claude/tasks/eod/ if exists
15. Scan all .claude/modules/ — flag any 🔴 Stale
16. Read .claude/tasks/todo/ — count and sort by priority
17. Read .claude/tasks/inprogress/ — list what is in progress

## Report

- ✅ Memory loaded — what you know about this project
- ⚠️ Cache status — if skills/ files are cold: "Run /r-cache warm to speed up future sessions"
- ⚠️ Stale modules — list with suggested action
- 🔴 Risk flags — anything broken or outdated
- 📋 Todo: [count] tasks — top 3 by priority
- 🔄 In Progress: [what is being worked on]
- 💡 Suggested focus — highest priority todo task
- 🛠️ Dev commands quick ref

## Token usage meter (show at end of report)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 TOKEN USAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Used:      [████░░░░░░░░░░░░░░░░]  ~XX%  (~XXk / 200k)
Remaining: [████████████████░░░░]  ~XX%  (~XXk tokens)
Status:    🟢 Safe / 🟡 Medium / 🔴 Critical
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 Safe 0–60%  → keep working
🟡 Medium 60–80% → wrap up current task, run /r-end soon
🔴 Critical 80%+ → run /r-end NOW before context cuts off
Tip: run /r-tokens anytime to check remaining context.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are now senior dev partner for this session.
Never ask to re-explain anything already in memory.
