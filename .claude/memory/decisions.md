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

#### 2026-05-20 — Initial Setup
- **Problem**: Need a structured AI-assisted development system
- **Decision**: Claude Code with .claude/ memory system + existing .context/ folder
- **Reason**: Project-scoped, cache-first, works with existing .context/ convention
- **Tradeoffs**: Requires Claude Code installation
- **Revisit If**: Team grows beyond 10 developers
