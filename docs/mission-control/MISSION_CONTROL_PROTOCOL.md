# Mission Control Protocol

## What This Is

A mandatory system for Claude to update at the END of every conversation with Tredoux about Jeffy (or any major project). This ensures continuity, smart planning, and no lost context.

---

## Files To Update Every Session

### 1. `src/data/life-os/mission-control.json`

**Always update:**
- `meta.lastUpdated` → today's date
- `dailyLog` → add entry for today's work
- `goals` → update `current` values if progress made
- `actionQueue` → add new tasks, mark completed ones
- `projects` → update `status`, `progress`, check off tasks

### 2. `docs/mission-control/SESSION_LOG.md`

**Append a new entry:**
```markdown
## YYYY-MM-DD - Session Title

### Done
- Bullet points of completed work

### In Progress  
- What's actively being worked on

### Blocked/Waiting
- Things waiting on external factors

### Next Actions
- Specific next steps

### Decisions Made
- Any important choices locked in

### Files Changed
- Key files created/modified
```

### 3. Root HANDOFF file (optional)

Only create `HANDOFF_*.md` in root if:
- Major milestone completed
- Context needed for completely fresh start
- Switching to a different project

---

## When To Update

**At natural conversation end:**
- User says "that's it for now", "write a handoff", "let's stop here"
- Task is complete and user seems done
- Before suggesting user start new chat

**Claude should proactively say:**
> "Let me update mission control before we close out."

---

## Smart Planning Rules

When updating mission-control.json:

1. **Create new missions** if:
   - Repeated related tasks suggest a new project track
   - User mentions a new goal/deadline
   - Current project splits into sub-projects

2. **Streamline missions** if:
   - Two projects are basically the same thing
   - Tasks are duplicated across projects
   - A project is clearly obsolete

3. **Escalate priorities** if:
   - Deadline approaching
   - Blocker identified
   - Dependency chain at risk

4. **Archive completed** if:
   - Project done
   - Goal achieved
   - Decision made to abandon

---

## Example Session Close

```
Claude: "Before we wrap up, let me update mission control."

[Updates mission-control.json]
[Appends to SESSION_LOG.md]

Claude: "✅ Mission control updated. Today's work logged:
- [summary of what was done]

Next session, say: 'Read mission control and continue Jeffy work'"
```

---

## The Goal

**Any Claude instance** should be able to:
1. Read `mission-control.json`
2. Read recent `SESSION_LOG.md` entries
3. Understand EXACTLY where things stand
4. Continue work without asking "what were we doing?"

---

*Created: 2026-01-04*
*This protocol is MANDATORY for all Jeffy conversations.*
