# Custom Commands
> All custom commands use r- prefix.

## Template
Create: .claude/commands/custom/r-[name].md

Content:
---
> ⚠️ PROJECT SCOPED: All reads/writes stay within .claude/ and .context/ only.
[Exact instructions for Claude to execute when this command is typed]
---

## Ideas for this project
- /r-api-check   → fetch live API docs and diff against existing slices
- /r-quiz-debug  → load quiz .context/ files and diagnose quiz issues
- /r-context     → show full .context/ file status and staleness check
- /r-deploy      → your deployment / build steps
- /r-test        → run test suite
