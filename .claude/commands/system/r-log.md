> ⚠️ PROJECT SCOPED: Save to .claude/memory/ and .claude/modules/ only.

Log a piece of project knowledge. Behaviour depends on type argument.

## /r-log decision [title]

Add to .claude/memory/decisions.md:
#### [today] — [title]
- **Problem**: - **Options Considered**: - **Decision**: - **Reason**:
- **Tradeoffs**: - **Revisit If**:
Confirm saved.

## /r-log gotcha [title]

1. Add to .claude/memory/gotchas.md
2. Add to .claude/modules/[relevant].md gotchas section + changelog
3. Update .claude/skills/_base.md gotchas section

#### [Module] — [Title]
- **What Happens**: - **Why**: - **How to Avoid**: - **Discovered**: [today]
Confirm saved to all files.

## /r-log pattern [name]

Add to .claude/memory/patterns.md:
#### [Pattern Name]
- **When to use**: - **Example**: [file path + snippet] - **Anti-pattern**:
Update .claude/skills/_base.md patterns section.
Confirm saved.

## /r-log  (no type) — ask which type: decision / gotcha / pattern
