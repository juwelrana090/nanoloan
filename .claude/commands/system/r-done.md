> ⚠️ PROJECT SCOPED: Move files within .claude/tasks/ only.

## Finish

1. Read files in .claude/tasks/inprogress/
2. Identify task from context or ask
3. Update task file: Completed date, check off criteria, add Summary
4. Move: .claude/tasks/inprogress/ → .claude/tasks/done/
5. Save log to .claude/tasks/logs/YYYY-MM-DD-[title].md
6. Update .context/SESSION-SUMMARY.md
7. Append to .context/CONVERSATION_HISTORY.md
8. Suggest git commit message

## Auto-review

9. Read .claude/skills/_base.md ← rules + patterns to check against
10. Check rules from .claude/memory/rules.md were followed
11. Check correct patterns were used
12. Check error handling is correct
Report: ✅ Pass / ❌ Fail per check. Flag any new gotchas or patterns.
