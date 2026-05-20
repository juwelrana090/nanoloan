> ⚠️ PROJECT SCOPED: All outputs save to .context/ or .claude/ only.

## Local Cache First

1. Read .claude/skills/_base.md           ← rules + patterns (fast)
2. Read .claude/skills/_stack.md          ← stack guidance (fast)
3. Read .claude/skills/_modules-index.md  ← module map (fast)
Only read .claude/modules/[specific].md if this task touches that module.
Only read .claude/memory/ files if skills/ cache is cold (🔴).

## Execute

4. Read .claude/memory/pre-task-checklist.md — complete every item
5. Read .claude/modules/[relevant].md if needed
6. State complete plan before writing any code
7. Wait for approval if change touches more than 3 files
8. Execute the task
9. Read .claude/memory/post-task-checklist.md — complete every item
10. Update .context/SESSION-SUMMARY.md
11. Append to .context/CONVERSATION_HISTORY.md
12. Update all affected .claude/modules/ files
13. Update .claude/skills/_modules-index.md if modules changed
14. Update .claude/skills/_base.md if rules/patterns/gotchas changed
15. Save log to .claude/tasks/logs/YYYY-MM-DD-[title].md

## Log format

# Task: [title]
**Date**: **Summary**: **Files Changed**: **Modules Affected**:
**API Endpoints Used**: **Decisions Made**: **Context Updated**: **Notes**:

Confirm log saved with full path.
