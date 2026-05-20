> ⚠️ PROJECT SCOPED: Read/write .claude/tasks/ only.

## When called with no argument — show task board

1. Read all files in .claude/tasks/todo/
2. Read all files in .claude/tasks/inprogress/
3. Read last 5 files in .claude/tasks/done/

Report:
## 📋 Todo ([count])
| Priority | Task | Effort | Added By |
|---|---|---|---|
[sorted: 🔴 first, then 🟡, then 🟢]

## 🔄 In Progress ([count])
| Task | Assigned To | Started |
|---|---|---|

## ✅ Recently Done (last 5)
| Task | Completed By |
|---|---|

After showing list: "Pick a task? Tell me which one and I'll move it to in-progress."

## When called with "add [desc]" — add a new task

Infer developer name from .claude/settings.local.json or git config user.name.
Gather or infer: title, priority (🔴/🟡/🟢), description, acceptance criteria, effort.
Save to .claude/tasks/todo/YYYY-MM-DD-[title].md
Confirm saved.

## When the user picks a task from the list

Move .claude/tasks/todo/[file] → .claude/tasks/inprogress/
Add: Assigned To + Started date.
Then automatically run /r-task with the task description.
