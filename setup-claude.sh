#!/bin/bash

# ═══════════════════════════════════════════════════════
# Claude AI Development System Setup
# Usage: bash setup-claude.sh   (Git Bash on Windows)
# ═══════════════════════════════════════════════════════

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

print_step() { echo -e "\n${BLUE}═══ $1 ═══${NC}"; }
print_ok()   { echo -e "${GREEN}✅ $1${NC}"; }
print_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
print_skip() { echo -e "${YELLOW}⏭️  Skipped (already exists): $1${NC}"; }

make_file() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  if [ -f "$path" ]; then
    print_skip "$path"
    cat > /dev/null
  else
    cat > "$path"
    print_ok "Created: $path"
  fi
}

# ── SAFETY CHECK ────────────────────────────────────────

print_step "Safety Check"

if [ ! -f "package.json" ] && [ ! -f "composer.json" ] && [ ! -f "requirements.txt" ] && [ ! -f "go.mod" ]; then
  print_warn "No recognisable project file found. Run from your project root."
  read -r -p "  Continue anyway? [y/N]: " CONFIRM
  [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ] && exit 1
fi

PROJECT_NAME=$(basename "$PWD")
TODAY=$(date +%Y-%m-%d)

HAS_AGENTS=false; HAS_CLAUDE=false; HAS_CONTEXT=false; HAS_CLAUDE_DIR=false
[ -f "AGENTS.md" ] && HAS_AGENTS=true
[ -f "CLAUDE.md" ] && HAS_CLAUDE=true
[ -d ".context"  ] && HAS_CONTEXT=true
[ -d ".claude"   ] && HAS_CLAUDE_DIR=true

echo ""
print_info "Project: $PROJECT_NAME"
print_info "Location: $PWD"
echo ""
[ "$HAS_AGENTS" = true ]     && echo -e "  ${GREEN}✅ AGENTS.md${NC}"  || echo -e "  ${YELLOW}➕ AGENTS.md — will create${NC}"
[ "$HAS_CLAUDE" = true ]     && echo -e "  ${GREEN}✅ CLAUDE.md${NC}"  || echo -e "  ${YELLOW}➕ CLAUDE.md — will create${NC}"
[ "$HAS_CONTEXT" = true ]    && echo -e "  ${GREEN}✅ .context/${NC}"  || echo -e "  ${YELLOW}➕ .context/ — will create${NC}"
[ "$HAS_CLAUDE_DIR" = true ] && echo -e "  ${GREEN}✅ .claude/${NC}"   || echo -e "  ${YELLOW}➕ .claude/ — will create${NC}"
echo ""
print_info "SAFE MODE always active — existing files are NEVER overwritten"

# ── DETECT PROJECT ──────────────────────────────────────

print_step "Detecting Project"

STACK=""
if [ -f "package.json" ]; then
  if grep -q '"expo"' package.json 2>/dev/null; then       STACK="React Native + Expo"
  elif grep -q '"react-native"' package.json 2>/dev/null;  then STACK="React Native"
  elif grep -q '"next"' package.json 2>/dev/null;          then STACK="Next.js"
  elif grep -q '"@nestjs/core"' package.json 2>/dev/null;  then STACK="NestJS"
  else STACK="Node.js"; fi
fi
[ -f "composer.json" ]    && STACK="$STACK PHP/Laravel"
[ -f "requirements.txt" ] && STACK="$STACK Python"
[ -f "Gemfile" ]          && STACK="$STACK Ruby"
[ -f "go.mod" ]           && STACK="$STACK Go"
[ -f "Cargo.toml" ]       && STACK="$STACK Rust"
[ -z "$STACK" ]           && STACK="Unknown"

SRC_FOLDERS=""
for folder in src app lib resources pages components api modules shared interfaces; do
  [ -d "$folder" ] && SRC_FOLDERS="$SRC_FOLDERS $folder/"
done

API_URL=""
if [ -f ".env" ]; then
  API_URL=$(grep "EXPO_PUBLIC_API_URL" .env 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" | xargs 2>/dev/null)
fi
[ -z "$API_URL" ] && API_URL="https://backend.bespeaky.com"

print_info "Stack:   $STACK"
print_info "Source:  $SRC_FOLDERS"
print_info "API URL: $API_URL"

# ── FOLDERS ─────────────────────────────────────────────

print_step "Creating Folder Structure"

mkdir -p .context
mkdir -p .claude/memory .claude/modules .claude/skills
mkdir -p .claude/tasks/todo .claude/tasks/inprogress .claude/tasks/done
mkdir -p .claude/tasks/plans .claude/tasks/logs .claude/tasks/eod
mkdir -p .claude/commands/system .claude/commands/custom
touch .claude/tasks/eod/.gitkeep
print_ok "Folder structure created"

# ── SETTINGS ────────────────────────────────────────────

print_step "Creating Settings Files"

ALLOW_PATHS='"Read(.context/**)",
      "Read(.claude/**)",
      "Read(AGENTS.md)",
      "Read(CLAUDE.md)"'
for folder in $SRC_FOLDERS; do
  folder=$(echo "$folder" | xargs)
  ALLOW_PATHS="$ALLOW_PATHS,
      \"Read($folder**)\",
      \"Write($folder**)\""
done
ALLOW_PATHS="$ALLOW_PATHS,
      \"Write(.context/**)\",
      \"Write(.claude/tasks/**)\",
      \"Write(.claude/memory/**)\",
      \"Write(.claude/modules/**)\",
      \"Write(.claude/skills/**)\",
      \"Write(.claude/commands/**)\""

make_file ".claude/settings.json" << EOF
{
  "permissions": {
    "allow": [
      $ALLOW_PATHS
    ],
    "deny": [
      "Write(~/**)",
      "Write(../**)",
      "Read(~/.ssh/**)",
      "Read(~/.env)",
      "Write(android-release.keystore)",
      "Write(android-signing.properties)",
      "Write(google-services.json)",
      "Write(GoogleService-Info.plist)"
    ]
  }
}
EOF

make_file ".claude/settings.local.json" << 'EOF'
{
  "developerName": "",
  "notes": "Fill in your name above. This file is YOURS only — never commit it."
}
EOF

# ── AGENTS.md ───────────────────────────────────────────

print_step "AGENTS.md"
if [ "$HAS_AGENTS" = true ]; then
  print_skip "AGENTS.md — your existing file is kept as-is"
else
  make_file "AGENTS.md" << EOF
# AGENTS.md — $PROJECT_NAME
## Universal AI Agent Operating Instructions

> **MANDATORY**: Every AI agent — Claude, Cursor, Copilot, Gemini, GPT, or any other —
> MUST read and follow this file before touching any code or answering any question.

## 🚨 READ-BEFORE-WRITE PROTOCOL

### Step 1 — Load Local Cache First (fastest)
\`\`\`
.claude/skills/_base.md           ← rules + patterns + gotchas condensed
.claude/skills/_stack.md          ← stack-specific guidance
.claude/skills/_modules-index.md  ← lightweight module map
\`\`\`
Cache hit = use directly. Cache miss (🔴 Cold) = read .claude/memory/ then update cache.

### Step 2 — Read Project Memory
\`\`\`
.context/MEMORY.md                ← context folder index
.context/SESSION-SUMMARY.md       ← last session summary
.claude/memory/context.md         ← product context
.claude/memory/rules.md           ← non-negotiable rules
.claude/memory/gotchas.md         ← known traps
\`\`\`

### Step 3 — Fetch Live API Documentation
\`\`\`
GET ${API_URL}/docs-json
\`\`\`
This changes over time. Always check before any API-touching work.

### Step 4 — State Plan Before Coding
List files that change, endpoints involved, blast radius, confirm rules followed.

## 📁 Project Overview
- **App:** $PROJECT_NAME
- **Stack:** $STACK
- **API Base:** ${API_URL}/v1
- **API Docs:** ${API_URL}/docs-json
- **Platform:** Windows + PowerShell + Git Bash

## ✅ After Every Task — REQUIRED
1. Update \`.context/SESSION-SUMMARY.md\`
2. Append to \`.context/CONVERSATION_HISTORY.md\`
3. Update \`.claude/modules/[affected].md\`
4. Log gotchas → \`.claude/memory/gotchas.md\`
5. Log patterns → \`.claude/memory/patterns.md\`
6. Update \`.claude/skills/_base.md\` if rules/patterns/gotchas changed
7. Update \`.claude/skills/_modules-index.md\` if modules changed

## 🚫 Never Do
- Modify \`android-release.keystore\` or \`android-signing.properties\`
- Expose secrets from \`.env\`
- Skip cache load before starting work
- Skip fetching live API docs before API work
- Break TypeScript strict mode
- Write files outside the project root
EOF
fi

# ── CLAUDE.md ───────────────────────────────────────────

print_step "CLAUDE.md"
if [ "$HAS_CLAUDE" = true ]; then
  print_skip "CLAUDE.md — your existing file is kept as-is"
else
  make_file "CLAUDE.md" << EOF
# CLAUDE.md — $PROJECT_NAME
## Claude Code CLI Operating Instructions

> ⚠️ Auto-loaded by Claude Code every session.
> Read AGENTS.md first — all universal rules apply here too.

## 🚀 Local Cache First — Non Negotiable

Before ANY reasoning or code, load in this order:

1. .claude/skills/_base.md           ← rules + patterns + gotchas (fast)
2. .claude/skills/_stack.md          ← stack-specific guidance (fast)
3. .claude/skills/_modules-index.md  ← module map (fast)
4. .context/MEMORY.md                ← context folder index
5. .context/SESSION-SUMMARY.md       ← last session summary
6. .claude/memory/context.md         ← product context
7. .claude/memory/rules.md           ← non-negotiable rules
8. .claude/memory/gotchas.md         ← known traps

Cache hit = read .claude/skills/ → use directly.
Cache miss (🔴 Cold) = read .claude/memory/ + .claude/modules/ → update .claude/skills/.

## 🔒 Scope Rules
- ALL memory files → .claude/memory/
- ALL module files → .claude/modules/
- ALL task logs → .claude/tasks/logs/
- ALL plans → .claude/tasks/plans/
- ALL context updates → .context/
- NEVER write any file outside project root

## 🧭 Project Context
- **Name**: $PROJECT_NAME
- **Stack**: $STACK
- **API**: ${API_URL}/v1
- **API Docs**: ${API_URL}/docs-json ← fetch before every API task
- **Phase**: [Run /r-memory scan to fill]

## 📁 Project Structure
[Run /r-memory scan to auto-fill]

## 🏗️ Architecture
[Run /r-memory scan to auto-fill]

## 📏 Non-Negotiable Rules
[Run /r-memory scan to auto-fill]

## 🔁 Established Patterns
[Run /r-memory scan to auto-fill]

## ⚠️ Gotchas
[Run /r-memory scan to auto-fill]

## 🛠️ Dev Commands
- Install: npm install
- Dev server: npx expo start --clear
- Android: npx expo run:android
- Clean build: npx expo prebuild --clean
- Release: .\\build-release.ps1

## ⚙️ Settings
- .claude/settings.json → shared — always commit
- .claude/settings.local.json → personal — never commit

## 📋 Before Every Task
1. Load cache (.claude/skills/)
2. Read .context/SESSION-SUMMARY.md
3. Read .claude/modules/[relevant].md
4. Read .claude/memory/gotchas.md
5. Fetch ${API_URL}/docs-json if touching API
6. State plan before writing any code
7. List all files that will change
8. Check blast radius

## 📋 After Every Task
1. Update .context/SESSION-SUMMARY.md
2. Append to .context/CONVERSATION_HISTORY.md
3. Update .claude/modules/[affected].md
4. Log gotchas → .claude/memory/gotchas.md
5. Log patterns → .claude/memory/patterns.md
6. Log decisions → .claude/memory/decisions.md
7. Update .claude/skills/_base.md if rules/patterns changed
8. Update .claude/skills/_modules-index.md if modules changed
9. Save task log → .claude/tasks/logs/$TODAY-[title].md

## 👥 Team Guidelines
- All .claude/ files are shared — commit all changes
- Only settings.local.json and tasks/eod/ are personal/gitignored
- After touching a module — update .claude/modules/[name].md
- New gotcha found — add to .claude/memory/gotchas.md and commit
- New pattern found — add to .claude/memory/patterns.md and commit
- Run /r-memory scan after pulling major changes

## 📋 Task Collaboration
- See all tasks: /r-todo
- Add task: /r-todo add [description]
- Pick up a task: pick from /r-todo list
- Mark task done: /r-done
EOF
fi

# ── .context/ BOOTSTRAP ─────────────────────────────────

print_step "Bootstrapping .context/ Files"

make_file ".context/MEMORY.md" << EOF
# Memory Index — $PROJECT_NAME
**Created:** $TODAY
**Purpose:** Navigation index for AI agents

## Documentation Files
[Add entries here as context files are created]

## Key Files Reference
[Add key project file paths here after /r-memory scan]

## Last Updated
$TODAY — Initial setup by setup-claude.sh
EOF

make_file ".context/SESSION-SUMMARY.md" << EOF
# Session Summary — $PROJECT_NAME

## Session: $TODAY — Initial Setup
**Status:** ✅ Complete
**What Was Done:** Ran setup-claude.sh — scaffolded .claude/ and .context/
**Next Steps:** Run /r-memory scan, then /r-cache warm, then /r-start
EOF

make_file ".context/CONVERSATION_HISTORY.md" << EOF
# Conversation History — $PROJECT_NAME

## Session: $TODAY — Initial Setup
**Type:** Project scaffold
**Work Done:** Ran setup-claude.sh — created .claude/ structure
**Next:** Open Claude Code → /r-memory scan → /r-cache warm → /r-start
EOF

# ── .claude/memory/ FILES ───────────────────────────────

print_step "Creating Memory Files"

make_file ".claude/memory/context.md" << EOF
# Project Context
> Run /r-memory scan to auto-fill from codebase.

- **Product Name**: $PROJECT_NAME
- **Purpose**: [to be filled]
- **Target Users**: [to be filled]
- **Current Phase**: [to be filled]
- **What Success Looks Like**: [to be filled]
- **What Must Never Break**: [to be filled]
- **Known Technical Debt**: [to be filled]
EOF

make_file ".claude/memory/architecture.md" << 'EOF'
# Architecture
> Run /r-memory scan to auto-fill from codebase.

## Stack
[to be filled]

## Folder Structure
[to be filled]

## System Layers
[to be filled]

## Data Flow
[to be filled]

## Auth Flow
[to be filled]

## External Services
[to be filled]

## Environment Differences
[to be filled]

## Key Design Decisions
[to be filled]
EOF

make_file ".claude/memory/rules.md" << 'EOF'
# Rules — Non Negotiable
> Run /r-memory scan to auto-fill from codebase.

## Naming Conventions
✅ DO: [to be filled]
❌ DON'T: [to be filled]

## Import Rules
✅ DO: [to be filled]
❌ DON'T: [to be filled]

## Function Rules
✅ DO: [to be filled]
❌ DON'T: [to be filled]

## Error Handling
✅ DO: [to be filled]
❌ DON'T: [to be filled]

## Testing Rules
✅ DO: [to be filled]
❌ DON'T: [to be filled]

## Forbidden Patterns
❌ NEVER: [to be filled]

## Environment Variables
✅ DO: [to be filled]
❌ DON'T: [to be filled]
EOF

make_file ".claude/memory/patterns.md" << 'EOF'
# Established Patterns
> Run /r-memory scan to auto-fill from codebase.

[Patterns will be added here as they are discovered]

## Template
#### [Pattern Name]
- **When to use**:
- **Example**: [file path + snippet]
- **Anti-pattern**:
EOF

make_file ".claude/memory/decisions.md" << EOF
# Architecture Decisions

[Decisions will be logged here as they are made]

## Template
#### [date] — [Title]
- **Problem**:
- **Options Considered**:
- **Decision**:
- **Reason**:
- **Tradeoffs**:
- **Revisit If**:

---

#### $TODAY — Initial Setup
- **Problem**: Need a structured AI-assisted development system
- **Decision**: Claude Code with .claude/ memory system + existing .context/ folder
- **Reason**: Project-scoped, cache-first, works with existing .context/ convention
- **Tradeoffs**: Requires Claude Code installation
- **Revisit If**: Team grows beyond 10 developers
EOF

make_file ".claude/memory/gotchas.md" << 'EOF'
# Gotchas
> Run /r-memory scan to auto-fill from codebase.

[Gotchas will be added here as they are discovered]

## Template
#### [Module] — [Title]
- **What Happens**:
- **Why**:
- **How to Avoid**:
- **Discovered**:
EOF

make_file ".claude/memory/dependencies.md" << 'EOF'
# Module Dependencies
> Run /r-memory scan to auto-fill from codebase.

## Module Dependency Map
[to be filled]

## Shared Utilities
[files used across 3+ modules]

## High Risk Modules
[most depended on — highest blast radius]

## External Package Usage
[which packages used where and why]

## Circular Dependencies
[any detected circular imports]
EOF

make_file ".claude/memory/pre-task-checklist.md" << EOF
# Pre Task Checklist
> Run every item before starting any task.

- [ ] Load cache: .claude/skills/_base.md + _stack.md + _modules-index.md
- [ ] Read .context/SESSION-SUMMARY.md
- [ ] Read .claude/modules/[relevant].md
- [ ] Read .claude/memory/gotchas.md for this area
- [ ] Read .claude/memory/dependencies.md
- [ ] Fetch ${API_URL}/docs-json if touching API
- [ ] State complete plan before writing any code
- [ ] List all files that will change
- [ ] Check blast radius
- [ ] Confirm plan follows .claude/memory/rules.md
- [ ] Confirm plan uses patterns from .claude/memory/patterns.md
EOF

make_file ".claude/memory/post-task-checklist.md" << 'EOF'
# Post Task Checklist
> Complete every item after finishing any task.

- [ ] All rules from .claude/memory/rules.md followed
- [ ] Existing patterns used correctly
- [ ] Errors handled correctly
- [ ] .context/SESSION-SUMMARY.md updated
- [ ] .context/CONVERSATION_HISTORY.md appended
- [ ] .claude/modules/[affected].md updated
- [ ] Changelog appended in module file
- [ ] New gotchas logged to .claude/memory/gotchas.md
- [ ] New patterns logged to .claude/memory/patterns.md
- [ ] New decisions logged to .claude/memory/decisions.md
- [ ] CLAUDE.md updated if needed
- [ ] Task log saved to .claude/tasks/logs/YYYY-MM-DD-[title].md
- [ ] Memory confidence flags set on updated modules
- [ ] .claude/skills/_modules-index.md updated if modules changed
- [ ] .claude/skills/_base.md updated if new rules/patterns/gotchas added
- [ ] If many changes: run /r-cache warm to fully rebuild skill cache
EOF

make_file ".claude/memory/INDEX.md" << 'EOF'
# Memory System Index

## Directory Structure
.claude/
├── skills/              → LOCAL CACHE (read first every session)
│   ├── _base.md         → condensed rules + patterns + gotchas
│   ├── _stack.md        → stack-specific guidance
│   └── _modules-index.md → lightweight module name→file map
├── memory/              → source of truth memory files
├── modules/             → per module memory files
├── tasks/
│   ├── todo/            → tasks waiting to be picked up
│   ├── inprogress/      → tasks being worked on
│   ├── done/            → completed tasks
│   ├── plans/           → feature plans before coding
│   ├── logs/            → completed task logs
│   └── eod/             → personal EOD (gitignored)
└── commands/
    ├── system/          → built-in r- commands
    └── custom/          → your custom r- commands

.context/                → project memory (existing convention)
├── MEMORY.md            → context folder index
├── SESSION-SUMMARY.md
├── CONVERSATION_HISTORY.md
└── [feature].md         → feature-specific docs

## Cache-First Quick Reference
| Situation | Command | Cache used |
|---|---|---|
| Start session | /r-start | _base + _stack + _modules-index |
| Execute a task | /r-task [desc] | _base + _stack |
| Find/impact anything | /r-find [thing] | _modules-index |
| Fix a bug | /r-fix [desc] | _base (gotchas) |
| Plan a feature | /r-plan [feature] | _base + _stack |
| List/add/pick tasks | /r-todo | (no cache needed) |
| Mark done + review | /r-done | _base |
| Log knowledge | /r-log decision/gotcha/pattern | (writes to memory) |
| Memory maintenance | /r-memory scan/update/status | (reads/writes memory) |
| Refresh cache | /r-cache warm | rewrites all skills/ |
| End session | /r-end | (no cache needed) |

## Core Memory Files
| File | Purpose |
|---|---|
| CLAUDE.md | Auto-loaded every session |
| skills/_base.md | Fast-load: rules, patterns, gotchas condensed |
| skills/_stack.md | Fast-load: stack-specific guidance |
| skills/_modules-index.md | Fast-load: module name→file map |
| memory/context.md | Product purpose and priorities |
| memory/architecture.md | System design and data flow |
| memory/rules.md | Non-negotiable coding rules |
| memory/patterns.md | Established code patterns |
| memory/decisions.md | Architecture decision log |
| memory/gotchas.md | Known traps and footguns |
| memory/dependencies.md | Module dependency map |
| memory/pre-task-checklist.md | Run before every task |
| memory/post-task-checklist.md | Run after every task |
EOF

make_file ".claude/memory/VERSION" << EOF
Memory System Version: 1.0.0
Created: $TODAY
Project: $PROJECT_NAME
API URL: $API_URL
Memory Root: .claude/memory/
Modules Root: .claude/modules/
Skills Root: .claude/skills/
Tasks Root: .claude/tasks/
Commands Root: .claude/commands/
Context Root: .context/
Last Full Scan: pending — run /r-memory scan
Last Cache Warm: pending — run /r-cache warm
Generated By: setup-claude.sh
EOF

# ── .claude/skills/ CACHE ───────────────────────────────

print_step "Creating Local Skill Cache"

make_file ".claude/skills/README.md" << 'EOF'
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
EOF

make_file ".claude/skills/_base.md" << EOF
# Base Skill Cache — $PROJECT_NAME
# Generated: $TODAY | Refresh with /r-cache warm

## Project
- Name: $PROJECT_NAME
- Stack: $STACK
- API: ${API_URL}/v1
- Context root: .context/
- Memory root: .claude/memory/

## Quick Rules (from memory/rules.md)
[Run /r-cache warm to populate from memory/rules.md]

## Key Patterns (from memory/patterns.md)
[Run /r-cache warm to populate from memory/patterns.md]

## Top Gotchas (from memory/gotchas.md)
[Run /r-cache warm to populate from memory/gotchas.md]

## Cache Status
🔴 Cold — run /r-cache warm to fill this file with live project data.
EOF

make_file ".claude/skills/_stack.md" << EOF
# Stack Skill Cache — $PROJECT_NAME
# Generated: $TODAY | Refresh with /r-cache warm

## Detected Stack: $STACK
## Source Folders: $SRC_FOLDERS
## API: ${API_URL}/v1
## API Docs: ${API_URL}/docs-json

## Stack-Specific Rules
[Run /r-cache warm to populate from memory/rules.md + codebase scan]

## Dev Commands
- Install: npm install
- Dev server: npx expo start --clear
- Android: npx expo run:android
- Clean build: npx expo prebuild --clean
- Release: .\\build-release.ps1

## Cache Status
🔴 Cold — run /r-cache warm to fill this file.
EOF

make_file ".claude/skills/_modules-index.md" << 'EOF'
# Module Index Cache
# Lightweight map: module name → file path → confidence
# Refresh with /r-cache warm

| Module | File | Confidence | Last Updated |
|---|---|---|---|
[Run /r-cache warm to auto-fill from .claude/modules/]

## Cache Status
🔴 Cold — run /r-cache warm to scan modules/ and fill this index.
EOF

print_ok "Skill cache files created (cold — run /r-cache warm after /r-memory scan)"

# ── TASK FOLDER READMEs ─────────────────────────────────

print_step "Creating Task Folder READMEs"

make_file ".claude/tasks/todo/README.md" << EOF
# 📋 Todo Tasks

## How to add
Run: /r-todo add [description]
Or create: .claude/tasks/todo/$TODAY-[title].md

## Task template
---
# Task: [title]
**Date Added**: $TODAY
**Priority**: 🔴 High / 🟡 Medium / 🟢 Low
**Estimated Effort**: Small / Medium / Large
**Assigned To**: unassigned

## Description
[what needs to be done and why]

## Acceptance Criteria
- [ ] [what done looks like]

## Notes
[context, gotchas, links]

## Related Files
[relevant file paths]
---
EOF

make_file ".claude/tasks/inprogress/README.md" << 'EOF'
# 🔄 In Progress
Tasks currently being worked on. Move here from todo/ when you start.
EOF

make_file ".claude/tasks/done/README.md" << 'EOF'
# ✅ Done
Completed tasks. Read these to understand project history.
EOF

make_file ".claude/tasks/plans/README.md" << 'EOF'
# 📐 Plans
Feature plans created before coding. Run: /r-plan [feature name]
EOF

make_file ".claude/tasks/logs/README.md" << 'EOF'
# 📝 Task Logs
Logs of completed tasks. Auto-created by /r-task and /r-done.
EOF

# ── SYSTEM COMMANDS ─────────────────────────────────────

print_step "Creating System Commands"

make_file ".claude/commands/system/r-start.md" << EOF
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
EOF

make_file ".claude/commands/system/r-end.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Save to .claude/tasks/eod/ and update .context/ only.

## Session wrap-up

1. List all tasks completed this session
2. List all files changed
3. List all .context/ and .claude/memory/ files updated
4. List anything unfinished or still in progress
5. Suggest what to pick up first next session
6. Check if CLAUDE.md or AGENTS.md needs updating

## Update context

7. Ensure .context/SESSION-SUMMARY.md is up to date
8. Ensure .context/CONVERSATION_HISTORY.md has this session appended

## Save EOD summary

Save to .claude/tasks/eod/YYYY-MM-DD-EOD-summary.md
Confirm saved. This file is personal and gitignored.
EOF

make_file ".claude/commands/system/r-task.md" << 'EOF'
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
EOF

make_file ".claude/commands/system/r-plan.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Save to .claude/tasks/plans/ only.
> Do NOT write any code yet.

## Local Cache First

1. Read .claude/skills/_base.md
2. Read .claude/skills/_stack.md
3. Read .claude/skills/_modules-index.md
Only go deeper into memory/ or modules/ if cache is cold.

## Plan the feature

4. Read all relevant .claude/modules/ files
5. Fetch live API docs if this feature touches the backend
6. List all files to create / change / delete
7. List API endpoints involved (verify against live docs)
8. List patterns to follow
9. List rules that apply
10. Map blast radius
11. List risks and gotchas
12. Write step-by-step execution order

Save to .claude/tasks/plans/YYYY-MM-DD-[feature]-PLAN.md
Confirm saved. Wait for explicit approval before coding.
EOF

make_file ".claude/commands/system/r-fix.md" << 'EOF'
> ⚠️ PROJECT SCOPED: All reads and updates stay in .context/ and .claude/ only.

## Local Cache First

1. Read .claude/skills/_base.md           ← includes top gotchas
2. Read .claude/skills/_modules-index.md  ← find the affected module fast
Only read full .claude/memory/gotchas.md or .claude/modules/ if cache is cold.

## Diagnose and fix

3. Read .claude/memory/gotchas.md if not covered by cache
4. Read .claude/modules/[relevant].md
5. Trace actual root cause — never guess
6. Explain what is broken and exactly why
7. Propose fix with clear reasoning
8. Apply the fix
9. Verify fix works

## After fix

10. New gotcha? Add to .claude/memory/gotchas.md AND .claude/skills/_base.md
11. Update .claude/modules/[relevant].md gotchas section + changelog
12. Update .context/SESSION-SUMMARY.md
13. Save log to .claude/tasks/logs/YYYY-MM-DD-fix-[title].md
EOF

make_file ".claude/commands/system/r-done.md" << 'EOF'
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
EOF

make_file ".claude/commands/system/r-todo.md" << 'EOF'
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
EOF

make_file ".claude/commands/system/r-memory.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Read and write .claude/ and .context/ only.
> SAFE MODE always active: NEVER delete or overwrite existing content. Only append or add missing.

Handles all memory maintenance. Behaviour depends on argument.

## /r-memory scan  — full project rescan (use after big changes)

1. Read every file in the project source (app/, modules/, shared/, interfaces/)
2. Read all existing .context/ files
3. For each file in .claude/memory/: read first, ADD missing sections, APPEND new findings
4. For each .claude/modules/ file: read first, append new findings; create if missing
5. Update .context/MEMORY.md with links to any new context files found
6. Update CLAUDE.md missing sections only — never overwrite filled sections
7. Bump .claude/memory/VERSION minor version

Report: ✅ updated / ✅ created / ⏭️ skipped / ⚠️ nothing deleted / ⚠️ nothing overwritten

## /r-memory update  — incremental sync (use after a task)

1. Read changed files since last task log
2. Compare against .claude/memory/ and .claude/modules/
3. ADD missing info only, APPEND new findings, flag outdated fields:
   <!-- previous: old value here -->
4. Set confidence: 🟢 High / 🟡 Medium / 🔴 Stale
5. Bump VERSION minor version

Report all changes made with file paths.

## /r-memory status  — health check (read-only)

Read all .claude/modules/ files and .claude/memory/VERSION.
Report:
| Module | Confidence | Last Updated | Notes |
|---|---|---|---|
Then: list all 🔴 Stale with fix action, overall health score.
Suggest: run /r-memory scan if 3+ modules are 🔴 Stale.

## /r-memory  (no argument) — defaults to status
EOF

make_file ".claude/commands/system/r-find.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Read from .claude/ and .context/ only.

Find where something lives AND its blast radius — both in one pass.

## Local Cache First

1. Read .claude/skills/_modules-index.md ← check index before anything else
Cache hit: module listed with path → go directly to that file.
Cache miss: fall through to full search.

## Find location

2. Read .claude/memory/dependencies.md if needed
3. Read relevant .claude/modules/ files
4. Search actual codebase

## Blast radius

5. Trace direct and indirect dependencies from the located thing

## Report

### Location
- Exact file paths and line numbers
- Which module owns it
- What imports it / what it exports to

### Impact if changed
- Risk: 🟢 Low / 🟡 Medium / 🔴 High
- Direct impact (files + paths)
- Indirect impact (files + paths)
- Tests to check
- Recommendation
EOF

make_file ".claude/commands/system/r-log.md" << 'EOF'
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
EOF

make_file ".claude/commands/system/r-cache.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Read/write .claude/skills/ only.

Manages the local skill cache. Behaviour depends on argument.

## /r-cache warm  — rebuild all cache files from memory

1. Read .claude/memory/context.md, rules.md, patterns.md, gotchas.md, dependencies.md
2. Read ALL files in .claude/modules/
3. Read .context/MEMORY.md and .context/SESSION-SUMMARY.md

Rebuild _base.md with: project name + stack, top 10 rules, top 5 patterns, top 10 gotchas, timestamp.
Rebuild _stack.md with: stack + source folders, stack-specific rules, dev commands, timestamp.
Rebuild _modules-index.md with: one row per module (name | file | confidence | last updated), timestamp.

Report: ✅ _base.md / ✅ _stack.md / ✅ _modules-index.md rebuilt.
⚡ Cache is WARM — future commands load skills/ first.
Remind: commit .claude/skills/ so teammates benefit.

## /r-cache status  — check cache health (read-only)

Read all three cache files.
Report:
| File | Status | Generated | Size |
|---|---|---|---|
| _base.md | 🟢 Warm / 🔴 Cold | [timestamp] | [lines] lines |
| _stack.md | 🟢 Warm / 🔴 Cold | [timestamp] | [lines] lines |
| _modules-index.md | 🟢 Warm / 🔴 Cold | [timestamp] | [X] modules |
Overall: 🟢 All warm / 🟡 Partial / 🔴 All cold
Suggest /r-cache warm if any file is 🔴 Cold.

## /r-cache  (no argument) — defaults to status
EOF

make_file ".claude/commands/system/r-tokens.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Read-only, no files written.

Estimate current token usage for this session based on:
- All memory and context files loaded
- All project files read
- Full conversation length so far
- All responses generated

Display:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 TOKEN USAGE — Current Session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Used:      [fill bar with █ and ░]  ~XX%  (~XXk / 200k)
Remaining: [fill bar with █ and ░]  ~XX%  (~XXk tokens)
Status:    🟢 Safe / 🟡 Medium / 🔴 Critical
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 Safe      0–60%  → keep working
🟡 Medium   60–80%  → wrap up task, run /r-end soon
🔴 Critical  80%+   → run /r-end NOW before cutoff
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Bar is 20 chars: █ = 5% used, ░ = 5% remaining.
Run /r-end before hitting 85% to save session safely.
EOF

make_file ".claude/commands/system/r-help.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Read from .claude/commands/ only.

Read .claude/commands/system/ and .claude/commands/custom/ and display all commands.

## System Commands (12)
| Command | Description |
|---|---|
| /r-start | Load session — skills cache first, then full memory |
| /r-end | End session — EOD summary + context update |
| /r-task [desc] | Execute a task with full cache-first context |
| /r-plan [feature] | Plan a feature before writing any code |
| /r-fix [desc] | Diagnose and fix — cache-first gotcha check |
| /r-todo | List tasks / add [desc] / pick from list to start |
| /r-done | Mark task done + auto quality review |
| /r-find [thing] | Location + blast radius in one pass |
| /r-log [type] [desc] | Log a decision / gotcha / pattern |
| /r-memory [scan\|update\|status] | Memory maintenance |
| /r-cache [warm\|status] | Skill cache maintenance |
| /r-tokens | Token usage meter |

## Custom Commands
[list any found in .claude/commands/custom/]
[if empty: No custom commands yet — see .claude/commands/custom/README.md]
EOF

make_file ".claude/commands/custom/README.md" << 'EOF'
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
EOF

# ── .gitignore ──────────────────────────────────────────

print_step "Updating .gitignore"

GITIGNORE_BLOCK="
# ─────────────────────────────────────────────────────
# Claude AI Memory System
# Shared with team: everything in .claude/ except below
# ─────────────────────────────────────────────────────
.claude/settings.local.json
.claude/tasks/eod/
"

if [ -f ".gitignore" ]; then
  if grep -q "Claude AI Memory System" .gitignore; then
    print_skip ".gitignore (Claude section already present)"
  else
    echo "$GITIGNORE_BLOCK" >> .gitignore
    print_ok "Appended to existing .gitignore"
  fi
else
  echo "$GITIGNORE_BLOCK" > .gitignore
  print_ok "Created .gitignore"
fi

# ── DEVELOPER NAME ──────────────────────────────────────

print_step "Developer Setup"

echo ""
echo -e "${CYAN}What is your name?${NC}"
echo -e "  Saved to ${YELLOW}.claude/settings.local.json${NC} so Claude knows who you are."
echo -e "  ${YELLOW}(Press Enter to skip)${NC}"
echo ""
read -r -p "  Your name: " DEV_NAME
echo ""

if [ -n "$DEV_NAME" ]; then
  if command -v python3 > /dev/null 2>&1; then
    python3 - "$DEV_NAME" << 'PYEOF'
import json, sys
path = ".claude/settings.local.json"
try:
    with open(path, "r") as f:
        data = json.load(f)
    data["developerName"] = sys.argv[1]
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
        f.write("\n")
except Exception as e:
    sys.exit(1)
PYEOF
    if [ $? -eq 0 ]; then
      print_ok "Name \"$DEV_NAME\" saved to .claude/settings.local.json"
    else
      print_warn "python3 write failed — trying sed fallback"
      sed -i "s/\"developerName\": \"\"/\"developerName\": \"$DEV_NAME\"/" .claude/settings.local.json \
        && print_ok "Name \"$DEV_NAME\" saved" \
        || print_warn "Failed — add your name manually to .claude/settings.local.json"
    fi
  else
    sed -i "s/\"developerName\": \"\"/\"developerName\": \"$DEV_NAME\"/" .claude/settings.local.json \
      && print_ok "Name \"$DEV_NAME\" saved" \
      || print_warn "Failed — add your name manually to .claude/settings.local.json"
  fi
else
  print_warn "Skipped — add your name later in .claude/settings.local.json"
fi

# ── DONE ────────────────────────────────────────────────

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Claude AI Development System Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Project:${NC} $PROJECT_NAME"
echo -e "${CYAN}Stack:${NC}   $STACK"
echo -e "${CYAN}API:${NC}     ${API_URL}/v1"
echo -e "${CYAN}Date:${NC}    $TODAY"
echo ""

echo -e "${YELLOW}What was created / kept:${NC}"
echo "  ✅ .claude/settings.json       ← permissions (sensitive files blocked)"
echo "  ✅ .claude/settings.local.json ← personal (gitignored)"
echo "  ✅ .claude/memory/             ← 10 source-of-truth memory files"
echo "  ✅ .claude/skills/             ← local cache (🔴 cold — run /r-cache warm)"
echo "  ✅ .claude/modules/            ← populated by /r-memory scan"
echo "  ✅ .claude/tasks/              ← todo/inprogress/done/plans/logs/eod"
echo "  ✅ .claude/commands/system/    ← all 12 /r-* commands"
[ "$HAS_AGENTS" = true ] && \
echo "  ⏭️  AGENTS.md                  ← kept your existing file" || \
echo "  ✅ AGENTS.md                   ← created"
[ "$HAS_CLAUDE" = true ] && \
echo "  ⏭️  CLAUDE.md                  ← kept your existing file" || \
echo "  ✅ CLAUDE.md                   ← created"
[ "$HAS_CONTEXT" = true ] && \
echo "  ⏭️  .context/                  ← kept + bootstrapped missing files" || \
echo "  ✅ .context/                   ← bootstrapped"
echo ""

if [ -z "$DEV_NAME" ]; then
  echo -e "${YELLOW}One manual step:${NC}"
  echo '  Add your name to .claude/settings.local.json:'
  echo '    { "developerName": "Your Name" }'
  echo ""
fi

echo -e "${YELLOW}Open Claude Code and run in order:${NC}"
echo ""
echo -e "  ${CYAN}1.${NC} /r-memory scan   ← scans codebase, builds all memory files (1–3 min)"
echo -e "  ${CYAN}2.${NC} /r-cache warm    ← compiles skills/ cache from memory (fast)"
echo -e "  ${CYAN}3.${NC} /r-start         ← load full session with warm cache"
echo ""
echo -e "${YELLOW}Daily workflow:${NC}"
echo "  /r-start  → load memory + task board"
echo "  /r-todo   → see / add / pick tasks"
echo "  /r-task   → do the work"
echo "  /r-done   → finish + auto review"
echo "  /r-end    → end of day summary"
echo ""
echo -e "${YELLOW}All 12 commands:${NC}"
echo "  /r-start  /r-end    /r-task  /r-plan   /r-fix"
echo "  /r-todo   /r-done   /r-find  /r-log"
echo "  /r-memory /r-cache  /r-tokens"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""