# LIFE OS - CLAUDE PROTOCOL

**Purpose:** Instructions for Claude on how to maintain and use the Life Operating System.

---

## EVERY SESSION PROTOCOL

### 1. Read First (If Relevant to Session)
When working on Jeffy or life planning topics, read these files first:
```
/src/data/life-os/mission-control.json   # Current goals, progress, action queue
/src/data/life-os/calendar.json          # Upcoming deadlines and events
/src/data/life-os/research-archive.json  # Past research (if topic-relevant)
```

### 2. Update During Session
After completing any significant work:
- Add entry to `dailyLog` in mission-control.json
- Update `current` values on any goals that progressed
- Add new research to research-archive.json if we researched something
- Add new action items to `actionQueue`

### 3. Proactive Awareness
If you notice:
- A deadline approaching → mention it
- A goal falling behind → suggest course correction
- An opportunity from recent news/AI → add to research queue

---

## MONTHLY AUDIT PROTOCOL

**Trigger:** Last day of each month (or when Tredoux requests)

### Steps:
1. **Progress Review**
   - Compare all goal targets vs current values
   - Calculate percentage progress
   - Identify goals ahead/behind schedule

2. **Action Analysis**
   - Review dailyLog entries for the month
   - What actions had highest impact?
   - What was promised but not done?

3. **External Research** (Web Search)
   - New AI tools relevant to Jeffy/education
   - South Africa e-commerce trends
   - Zone Partner / gig economy news
   - Any topic from `toResearch` queue

4. **Generate Next Month Plan**
   - Create new `/monthly-plans/YYYY-MM.md`
   - Concrete priorities based on analysis
   - Updated action queue
   - Key dates and deadlines

5. **Archive Audit**
   - Add audit summary to `monthlyAudits` array in mission-control.json
   - Include: progress summary, key insights, AI recommendations

---

## FILE UPDATE FORMATS

### Adding to dailyLog:
```json
{
  "date": "YYYY-MM-DD",
  "entries": [
    {
      "category": "jeffy|family|career|personal",
      "action": "What was done",
      "impact": "high|medium|low",
      "goalId": "related-goal-id or null"
    }
  ]
}
```

### Adding research:
```json
{
  "id": "research-XXX",
  "title": "Topic Name",
  "category": "category",
  "dateAdded": "YYYY-MM-DD",
  "dateResearched": "YYYY-MM-DD or null",
  "status": "to-research|in-progress|documented",
  "tags": ["tag1", "tag2"],
  "summary": "Brief description",
  "content": { "structured": "research content" },
  "sources": ["source1", "source2"],
  "relatedGoals": ["goal-id"],
  "notes": "Additional context"
}
```

---

## TONE & APPROACH

- Tredoux works behind the scenes, prefers substance over ceremony
- Mission-focused: everything ties back to SA schools
- Practical: concrete actions over vague advice
- Honest: if something isn't working, say so
- Research-backed: use web search for current strategies

---

## KEY CONTEXT TO REMEMBER

- **Jeffy is 85% focus** - but not the only thing
- **Pre-launch phase** - 12-month strategy, don't rush
- **Quality > Speed** in Zone Partners and products
- **The mission** - Schools, land, dignity for SA's next generation
- **Location** - Beijing now, Qingdao goal
- **Family** - 2.5yr daughter, son needs portfolio

---

## QUICK REFERENCE

| File | Purpose |
|------|---------|
| mission-control.json | Goals, progress, actions, audits |
| calendar.json | Events, deadlines, reminders |
| research-archive.json | Permanent knowledge base |
| monthly-plans/YYYY-MM.md | Printable monthly plans |
| CLAUDE_PROTOCOL.md | This file |

---

*This protocol evolves. Update it when patterns emerge.*
