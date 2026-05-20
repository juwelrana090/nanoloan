# Local Skill Cache

This directory is the LOCAL CACHE layer.
Claude reads these files FIRST before touching memory/ or modules/.

## How it works
- _base.md          → condensed rules + patterns + gotchas (rebuilt by /r-cache warm)
- _stack.md         → stack-specific guidance (rebuilt by /r-cache warm)
- _modules-index.md → lightweight module name→file map (rebuilt by /r-cache warm)

## Cache is stale when
- You run /r-memory scan (rebuilds memory/ but not cache)
- You add a new module
- You update rules or patterns in memory/

## To refresh
Run: /r-cache warm
