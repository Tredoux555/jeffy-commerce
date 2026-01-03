# LIFE OPERATING SYSTEM (LIFE OS)
## Technical Specification v1.0

**Document Version:** 1.0.0  
**Created:** January 3, 2026  
**Author:** Claude (Opus) in collaboration with Tredoux  
**Status:** Draft for Audit  
**Classification:** Private - Supabase Only (No Git)

---

# TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [System Philosophy & Principles](#2-system-philosophy--principles)
3. [Architecture Overview](#3-architecture-overview)
4. [Data Models](#4-data-models)
5. [API Specification](#5-api-specification)
6. [User Interface Requirements](#6-user-interface-requirements)
7. [Intelligence Layer (Claude Integration)](#7-intelligence-layer-claude-integration)
8. [Self-Evolution System](#8-self-evolution-system)
9. [Security & Privacy](#9-security--privacy)
10. [Printable Outputs](#10-printable-outputs)
11. [Integration Points](#11-integration-points)
12. [Implementation Phases](#12-implementation-phases)
13. [Audit Checklist](#13-audit-checklist)
14. [Open Questions & Future Evolution](#14-open-questions--future-evolution)
15. [Appendices](#15-appendices)

---

# 1. EXECUTIVE SUMMARY

## 1.1 What This Is

Life OS is a personal strategic operating system designed for a single user (Tredoux) to:

- Track goals across multiple life domains with weighted priority (Jeffy 85%, Family 8%, Career 5%, Personal 2%)
- Log daily actions and measure their impact against stated goals
- Archive all research and knowledge from Claude sessions permanently
- Generate printable monthly plans with concrete action items
- Receive AI-powered monthly audits that analyze progress, research new strategies, and generate actionable advice
- Evolve its own structure based on what actually works

## 1.2 What This Is Not

- Not a generic productivity app
- Not a team collaboration tool
- Not a public-facing product
- Not an autonomous AI agent (yet) - Claude is the intelligence, invoked through conversation

## 1.3 Core Innovation

The system "learns" through disciplined documentation:
- Every recommendation is tracked for outcome
- Every system feature is evaluated for usefulness
- Patterns emerge from accumulated data
- The system structure itself evolves based on retrospectives

## 1.4 Primary Use Cases

1. **Daily:** Quick-add actions, check priorities, log progress
2. **Weekly:** Review progress, adjust priorities, product curation sessions
3. **Monthly:** Deep audit with Claude, research synthesis, generate next month's plan
4. **Ad-hoc:** Research sessions with Claude that get archived, quick lookups of past knowledge

## 1.5 Technical Foundation

- **Database:** Supabase (PostgreSQL) - sole source of truth
- **Frontend:** Next.js (integrated into existing Jeffy admin)
- **Intelligence:** Claude (Opus) via conversation, reading/writing to database
- **Deployment:** Railway (existing Jeffy infrastructure)
- **Storage:** Supabase Storage for document attachments

---

# 2. SYSTEM PHILOSOPHY & PRINCIPLES

## 2.1 Core Principles

### 2.1.1 Single Source of Truth
All data lives in Supabase. No critical information in local files, git, or external services. This ensures:
- Privacy (not in version control)
- Persistence (survives machine changes)
- Accessibility (from any device)
- Queryability (SQL for analysis)

### 2.1.2 Human + AI Partnership
Claude is not autonomous. The model is:
- Human initiates (conversation, UI interaction)
- AI processes (analyzes, synthesizes, recommends)
- Human decides (final authority on all actions)
- System records (outcomes, effectiveness)

### 2.1.3 Evolutionary Design
The system assumes it will change. Every component is designed to:
- Be versioned
- Record its own effectiveness
- Accept modification without breaking history
- Document why changes were made

### 2.1.4 Mission Alignment
Every feature traces back to the ultimate mission: building sustainable education infrastructure in South Africa. Features that don't serve this (even indirectly) are out of scope.

### 2.1.5 Honest Tracking
The system only works if fed truth. It must:
- Make honest input easy
- Never judge or moralize about missed targets
- Distinguish between bad strategy and bad execution
- Surface uncomfortable patterns without blame

## 2.2 Design Constraints

| Constraint | Rationale |
|------------|-----------|
| Single user only | Simplicity, privacy, no auth complexity |
| Supabase-only storage | Privacy, existing infrastructure |
| No autonomous execution | Current AI limitations, safety |
| Integrated into Jeffy | Jeffy is 85% focus, reduces context-switching |
| Printable outputs required | Physical plans aid focus when digital is distracting |
| Mobile-friendly UI | Quick capture during teaching day |

## 2.3 Success Metrics for the System Itself

How do we know Life OS is working?

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily log consistency | >80% of days have entries | Automated count |
| Goal progress visibility | Always know status within 10 seconds | UX testing |
| Monthly audit completion | 12/12 months completed | Simple count |
| Advice effectiveness | >60% of recommendations marked "worked" | Outcome tracking |
| System evolution | >1 meaningful improvement per quarter | Evolution log |
| Research retrieval | Find past research in <30 seconds | UX testing |

---

# 3. ARCHITECTURE OVERVIEW

## 3.1 System Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Jeffy      │  │  Printable  │  │  Mobile-Responsive     │ │
│  │  Admin UI   │  │  PDF/MD     │  │  Quick Capture         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Goals      │  │  Daily Log  │  │  Research Archive       │ │
│  │  CRUD       │  │  CRUD       │  │  CRUD + Search          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Calendar   │  │  Actions    │  │  Evolution              │ │
│  │  Events     │  │  Queue      │  │  Tracking               │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Monthly    │  │  Pattern    │  │  Export /               │ │
│  │  Audit      │  │  Analysis   │  │  Print                  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   INTELLIGENCE LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    CLAUDE (OPUS)                          │  │
│  │  - Reads system state at session start                    │  │
│  │  - Analyzes progress, spots patterns                      │  │
│  │  - Conducts research (web search)                         │  │
│  │  - Generates recommendations                              │  │
│  │  - Writes updates back to database                        │  │
│  │  - Produces monthly audit reports                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER (SUPABASE)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  goals      │  │  daily_logs │  │  research_entries       │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  calendar   │  │  action     │  │  monthly_audits         │ │
│  │  _events    │  │  _queue     │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  evolution  │  │  advice     │  │  system_config          │ │
│  │  _log       │  │  _outcomes  │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐                              │
│  │  pattern    │  │  attachments│                              │
│  │  _insights  │  │  (Storage)  │                              │
│  └─────────────┘  └─────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

## 3.2 Data Flow Patterns

### 3.2.1 Daily Interaction Flow
```
User Action → API → Supabase → (Optional) Trigger pattern analysis
```

### 3.2.2 Claude Session Flow
```
Session Start:
  Claude reads → goals, recent_logs, action_queue, pending_research
  
During Session:
  Work happens → Claude suggests updates → User confirms → API writes
  
Session End:
  Claude writes → daily_log entries, goal progress, new research, updated actions
```

### 3.2.3 Monthly Audit Flow
```
Audit Trigger (last day of month or manual):
  1. Claude reads entire system state
  2. Claude analyzes all month's data
  3. Claude conducts web research on relevant topics
  4. Claude generates audit report
  5. Report written to monthly_audits table
  6. Next month's plan generated
  7. Evolution log updated with system observations
```

## 3.3 Component Responsibilities

| Component | Responsibility | Does NOT Do |
|-----------|----------------|-------------|
| Supabase | Store all data, enforce schema, provide queries | Business logic, AI processing |
| Next.js API | CRUD operations, validation, authorization | Complex analysis, AI calls |
| Next.js UI | Display data, capture input, navigation | Data persistence, heavy computation |
| Claude | Analysis, synthesis, recommendations, research | Autonomous actions, real-time monitoring |
| Printable Outputs | Physical reference documents | Interactive features |

---

# 4. DATA MODELS

## 4.1 Entity Relationship Overview

```
┌─────────────┐       ┌─────────────┐       ┌─────────────────┐
│   goals     │──────<│ milestones  │       │ daily_logs      │
└─────────────┘       └─────────────┘       └─────────────────┘
      │                                            │
      │                                            │
      ▼                                            ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────────┐
│goal_progress│       │action_queue │──────>│ advice_outcomes │
│  _snapshots │       └─────────────┘       └─────────────────┘
└─────────────┘              │
                             │
┌─────────────┐              │
│ calendar    │<─────────────┘
│ _events     │
└─────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│research_entries │    │ monthly_audits  │    │ evolution_log   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                      │                      │
        ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ research_tags   │    │ audit_insights  │    │system_config    │
└─────────────────┘    └─────────────────┘    └─────────────────┘

┌─────────────────┐
│ pattern_insights│
└─────────────────┘
```

## 4.2 Detailed Table Schemas

### 4.2.1 `goals`

Primary table for tracking objectives across all life domains.

```sql
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('jeffy', 'family', 'career', 'personal')),
  
  -- Measurement
  target_value DECIMAL(12,2) NOT NULL,
  minimum_value DECIMAL(12,2),
  current_value DECIMAL(12,2) DEFAULT 0,
  unit VARCHAR(50) NOT NULL, -- 'partners', 'ZAR', 'wants', 'portfolio', etc.
  
  -- Timeline
  deadline DATE NOT NULL,
  started_at DATE DEFAULT CURRENT_DATE,
  completed_at DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
    'planning',    -- Not yet started
    'active',      -- In progress
    'waiting',     -- Blocked/waiting on external factor
    'paused',      -- Intentionally on hold
    'completed',   -- Successfully finished
    'abandoned',   -- Stopped, not achieved
    'future'       -- Scheduled for later
  )),
  
  -- Priority
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10), -- 1 = highest
  
  -- Context
  notes TEXT,
  why_this_matters TEXT, -- Connection to mission
  success_criteria TEXT, -- How do we know it's truly done?
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Self-evolution tracking
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  retrospective_notes TEXT -- What we learned from this goal
);

-- Indexes
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_deadline ON goals(deadline);
CREATE INDEX idx_goals_priority ON goals(priority);
```

### 4.2.2 `milestones`

Sub-goals within a larger goal.

```sql
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  
  -- Definition
  value DECIMAL(12,2) NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Status
  reached BOOLEAN DEFAULT FALSE,
  reached_at DATE,
  
  -- Order
  sequence INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_milestones_goal ON milestones(goal_id);
```

### 4.2.3 `goal_progress_snapshots`

Historical record of goal progress over time.

```sql
CREATE TABLE goal_progress_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  
  -- Snapshot data
  value DECIMAL(12,2) NOT NULL,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Context
  source VARCHAR(50), -- 'manual', 'automated', 'claude_session'
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(goal_id, snapshot_date)
);

CREATE INDEX idx_progress_goal_date ON goal_progress_snapshots(goal_id, snapshot_date);
```

### 4.2.4 `daily_logs`

Record of actions taken each day.

```sql
CREATE TABLE daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Timing
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Content
  category VARCHAR(50) NOT NULL CHECK (category IN ('jeffy', 'family', 'career', 'personal', 'system')),
  action TEXT NOT NULL,
  
  -- Assessment
  impact VARCHAR(20) CHECK (impact IN ('high', 'medium', 'low', 'unknown')),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5), -- 1=exhausted, 5=energized
  time_spent_minutes INTEGER,
  
  -- Linking
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  action_item_id UUID, -- References action_queue if this was a planned action
  
  -- Context
  notes TEXT,
  blockers TEXT, -- What got in the way?
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source VARCHAR(50) DEFAULT 'manual' -- 'manual', 'claude_session', 'automated'
);

CREATE INDEX idx_daily_logs_date ON daily_logs(log_date DESC);
CREATE INDEX idx_daily_logs_category ON daily_logs(category);
CREATE INDEX idx_daily_logs_goal ON daily_logs(goal_id);
```

### 4.2.5 `action_queue`

Prioritized list of things to do.

```sql
CREATE TABLE action_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Definition
  task TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('jeffy', 'family', 'career', 'personal', 'system')),
  
  -- Priority & Timeline
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  deadline DATE,
  estimated_minutes INTEGER,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending',     -- Not started
    'in_progress', -- Working on it
    'waiting',     -- Blocked on something
    'completed',   -- Done
    'deferred',    -- Pushed to later
    'cancelled'    -- Not doing this
  )),
  
  -- Linking
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  
  -- Context
  notes TEXT,
  why_deferred TEXT, -- If status = deferred, why?
  completion_notes TEXT, -- What happened when completed?
  
  -- Source tracking
  source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'claude_recommendation', 'monthly_audit'
  source_audit_id UUID, -- If from audit, which one
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_action_queue_status ON action_queue(status);
CREATE INDEX idx_action_queue_priority ON action_queue(priority);
CREATE INDEX idx_action_queue_deadline ON action_queue(deadline);
CREATE INDEX idx_action_queue_category ON action_queue(category);
```

### 4.2.6 `advice_outcomes`

Track whether Claude's recommendations actually worked.

```sql
CREATE TABLE advice_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The advice
  advice_text TEXT NOT NULL,
  advice_category VARCHAR(50),
  advice_date DATE NOT NULL,
  
  -- Source
  source_type VARCHAR(50) NOT NULL, -- 'monthly_audit', 'session', 'action_item'
  source_id UUID, -- ID of the audit, action item, etc.
  
  -- Outcome tracking
  was_followed BOOLEAN,
  outcome VARCHAR(50) CHECK (outcome IN (
    'pending',     -- Not yet evaluated
    'worked',      -- Advice was good, helped
    'partial',     -- Somewhat helpful
    'didnt_work',  -- Followed but didn't help
    'not_followed', -- Didn't follow the advice
    'irrelevant'   -- Circumstances changed, advice became moot
  )),
  
  -- Learning
  outcome_notes TEXT,
  what_we_learned TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  evaluated_at TIMESTAMPTZ
);

CREATE INDEX idx_advice_outcomes_outcome ON advice_outcomes(outcome);
CREATE INDEX idx_advice_outcomes_date ON advice_outcomes(advice_date DESC);
```

### 4.2.7 `calendar_events`

Events, deadlines, and reminders.

```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Timing
  event_date DATE NOT NULL,
  event_time TIME, -- NULL for all-day events
  end_date DATE, -- For multi-day events
  
  -- Type
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'deadline',    -- Something due
    'milestone',   -- Goal milestone date
    'reminder',    -- Just a reminder
    'event',       -- Actual event (meeting, etc.)
    'audit',       -- Monthly audit
    'review'       -- Weekly/periodic review
  )),
  
  -- Category
  category VARCHAR(50) CHECK (category IN ('jeffy', 'family', 'career', 'personal', 'system')),
  
  -- Linking
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  action_item_id UUID REFERENCES action_queue(id) ON DELETE SET NULL,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'yearly'
  recurrence_end DATE,
  
  -- Status
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  
  -- Priority
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_calendar_date ON calendar_events(event_date);
CREATE INDEX idx_calendar_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_category ON calendar_events(category);
```

### 4.2.8 `research_entries`

Permanent archive of all research and knowledge.

```sql
CREATE TABLE research_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE, -- URL-friendly identifier
  
  -- Classification
  category VARCHAR(100) NOT NULL, -- More flexible than enum
  
  -- Content
  summary TEXT,
  content JSONB, -- Structured content, flexible format
  raw_notes TEXT, -- Unstructured notes
  
  -- Status
  status VARCHAR(50) DEFAULT 'to_research' CHECK (status IN (
    'to_research',   -- Queued for research
    'in_progress',   -- Currently researching
    'documented',    -- Research complete
    'needs_update',  -- Info may be outdated
    'archived'       -- No longer relevant
  )),
  
  -- Dates
  date_requested DATE,
  date_researched DATE,
  date_last_verified DATE,
  
  -- Sources
  sources JSONB, -- Array of source objects with URL, title, date
  
  -- Linking
  related_goals UUID[], -- Array of goal IDs
  
  -- Search
  search_vector tsvector, -- Full-text search
  
  -- Attachments
  attachment_paths TEXT[], -- Paths in Supabase Storage
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(50) DEFAULT 'claude' -- 'claude', 'manual'
);

-- Full-text search index
CREATE INDEX idx_research_search ON research_entries USING gin(search_vector);
CREATE INDEX idx_research_category ON research_entries(category);
CREATE INDEX idx_research_status ON research_entries(status);

-- Trigger to update search vector
CREATE OR REPLACE FUNCTION update_research_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.raw_notes, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER research_search_update
  BEFORE INSERT OR UPDATE ON research_entries
  FOR EACH ROW EXECUTE FUNCTION update_research_search_vector();
```

### 4.2.9 `research_tags`

Flexible tagging for research entries.

```sql
CREATE TABLE research_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id UUID NOT NULL REFERENCES research_entries(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  
  UNIQUE(research_id, tag)
);

CREATE INDEX idx_research_tags_tag ON research_tags(tag);
CREATE INDEX idx_research_tags_research ON research_tags(research_id);
```

### 4.2.10 `monthly_audits`

Record of each monthly audit.

```sql
CREATE TABLE monthly_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Period
  audit_month DATE NOT NULL, -- First day of month being audited
  
  -- Content (all stored as JSONB for flexibility)
  goals_summary JSONB, -- Snapshot of all goals at audit time
  progress_analysis JSONB, -- What progressed, what didn't
  actions_review JSONB, -- What was done vs planned
  advice_effectiveness JSONB, -- Review of previous advice
  external_research JSONB, -- New tools, strategies, news discovered
  pattern_observations JSONB, -- Patterns noticed this month
  system_observations JSONB, -- Observations about Life OS itself
  
  -- Outputs
  recommendations JSONB, -- Specific recommendations for next month
  next_month_priorities JSONB, -- Ordered list of priorities
  printable_plan_path TEXT, -- Path to generated PDF/MD
  
  -- Raw audit document
  full_audit_text TEXT, -- Complete audit in markdown
  
  -- Meta
  conducted_at TIMESTAMPTZ DEFAULT NOW(),
  duration_minutes INTEGER, -- How long the audit took
  
  UNIQUE(audit_month)
);

CREATE INDEX idx_audits_month ON monthly_audits(audit_month DESC);
```

### 4.2.11 `evolution_log`

Track how the system itself changes.

```sql
CREATE TABLE evolution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What changed
  change_type VARCHAR(50) NOT NULL CHECK (change_type IN (
    'schema_change',     -- Database structure changed
    'feature_added',     -- New capability added
    'feature_removed',   -- Capability removed
    'feature_modified',  -- Existing feature changed
    'process_change',    -- How we use the system changed
    'protocol_update',   -- Claude protocol updated
    'insight',           -- Learning about the system
    'bug_fix',           -- Something was broken, now fixed
    'optimization'       -- Made something better
  )),
  
  -- Description
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  rationale TEXT, -- Why this change was made
  
  -- Impact
  affected_components TEXT[], -- Which parts of system affected
  breaking_change BOOLEAN DEFAULT FALSE,
  
  -- Evaluation
  expected_benefit TEXT,
  actual_benefit TEXT, -- Filled in later
  effectiveness VARCHAR(50) CHECK (effectiveness IN (
    'pending',      -- Not yet evaluated
    'very_helpful', 
    'somewhat_helpful',
    'neutral',
    'not_helpful',
    'harmful'       -- Made things worse
  )),
  evaluation_notes TEXT,
  
  -- Version tracking
  system_version VARCHAR(20), -- e.g., "1.0.0", "1.1.0"
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  evaluated_at TIMESTAMPTZ,
  source_audit_id UUID REFERENCES monthly_audits(id) ON DELETE SET NULL
);

CREATE INDEX idx_evolution_type ON evolution_log(change_type);
CREATE INDEX idx_evolution_date ON evolution_log(created_at DESC);
```

### 4.2.12 `pattern_insights`

Patterns discovered through analysis.

```sql
CREATE TABLE pattern_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The pattern
  pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN (
    'timing',        -- When things happen/don't happen
    'productivity',  -- Output patterns
    'blocking',      -- What blocks progress
    'success',       -- What leads to success
    'failure',       -- What leads to failure
    'preference',    -- User preferences discovered
    'correlation',   -- Things that correlate
    'anomaly'        -- Unusual observations
  )),
  
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Evidence
  evidence JSONB, -- Data supporting this pattern
  confidence VARCHAR(20) CHECK (confidence IN ('low', 'medium', 'high', 'confirmed')),
  first_observed DATE,
  times_observed INTEGER DEFAULT 1,
  
  -- Action
  suggested_action TEXT,
  action_taken TEXT,
  action_effective BOOLEAN,
  
  -- Status
  status VARCHAR(50) DEFAULT 'observed' CHECK (status IN (
    'observed',    -- Just noticed
    'confirmed',   -- Seen multiple times
    'actionable',  -- Can do something about it
    'addressed',   -- Action taken
    'dismissed'    -- Not actually a pattern
  )),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  discovered_by VARCHAR(50) DEFAULT 'claude' -- 'claude', 'manual'
);

CREATE INDEX idx_patterns_type ON pattern_insights(pattern_type);
CREATE INDEX idx_patterns_status ON pattern_insights(status);
```

### 4.2.13 `system_config`

Configuration and preferences for the system.

```sql
CREATE TABLE system_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial configuration
INSERT INTO system_config (key, value, description) VALUES
  ('focus_allocation', '{"jeffy": 85, "family": 8, "career": 5, "personal": 2}', 'Percentage focus allocation by category'),
  ('system_version', '"1.0.0"', 'Current Life OS version'),
  ('timezone', '"Asia/Shanghai"', 'User timezone'),
  ('audit_day', '{"type": "last", "day": null}', 'When to run monthly audit (last day of month)'),
  ('claude_protocol_version', '"1.0.0"', 'Version of Claude interaction protocol'),
  ('daily_reminder_time', '"09:00"', 'Time for daily check reminder'),
  ('weekly_review_day', '"saturday"', 'Day for weekly review'),
  ('inactive_goal_threshold_days', '14', 'Days without progress before goal flagged as stalled'),
  ('research_stale_threshold_days', '180', 'Days before research marked as possibly outdated');
```

## 4.3 Database Views

### 4.3.1 `v_active_goals`

```sql
CREATE VIEW v_active_goals AS
SELECT 
  g.*,
  ROUND((g.current_value / g.target_value) * 100, 1) as progress_percent,
  g.deadline - CURRENT_DATE as days_until_deadline,
  CASE 
    WHEN g.current_value >= g.target_value THEN 'achieved'
    WHEN g.current_value >= COALESCE(g.minimum_value, 0) THEN 'minimum_met'
    ELSE 'in_progress'
  END as achievement_status
FROM goals g
WHERE g.status IN ('active', 'waiting')
ORDER BY g.priority, g.deadline;
```

### 4.3.2 `v_upcoming_deadlines`

```sql
CREATE VIEW v_upcoming_deadlines AS
SELECT 
  ce.*,
  g.name as goal_name,
  ce.event_date - CURRENT_DATE as days_until
FROM calendar_events ce
LEFT JOIN goals g ON ce.goal_id = g.id
WHERE ce.event_date >= CURRENT_DATE
  AND ce.completed = FALSE
ORDER BY ce.event_date, ce.priority DESC;
```

### 4.3.3 `v_stalled_goals`

```sql
CREATE VIEW v_stalled_goals AS
SELECT 
  g.*,
  MAX(gps.snapshot_date) as last_progress_date,
  CURRENT_DATE - MAX(gps.snapshot_date) as days_since_progress
FROM goals g
LEFT JOIN goal_progress_snapshots gps ON g.id = gps.goal_id
WHERE g.status = 'active'
GROUP BY g.id
HAVING CURRENT_DATE - MAX(gps.snapshot_date) > (
  SELECT (value::text)::integer 
  FROM system_config 
  WHERE key = 'inactive_goal_threshold_days'
)
OR MAX(gps.snapshot_date) IS NULL;
```

### 4.3.4 `v_monthly_summary`

```sql
CREATE VIEW v_monthly_summary AS
SELECT 
  DATE_TRUNC('month', log_date) as month,
  category,
  COUNT(*) as total_actions,
  COUNT(*) FILTER (WHERE impact = 'high') as high_impact_actions,
  COUNT(DISTINCT goal_id) as goals_worked_on,
  AVG(energy_level) as avg_energy,
  SUM(time_spent_minutes) as total_minutes
FROM daily_logs
GROUP BY DATE_TRUNC('month', log_date), category
ORDER BY month DESC, category;
```

---

# 5. API SPECIFICATION

## 5.1 API Design Principles

- RESTful where it makes sense
- All responses in JSON
- Consistent error format
- No authentication (single user, local/private network assumed)
- All endpoints prefixed with `/api/life-os/`

## 5.2 Standard Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-03T10:30:00Z",
    "count": 10
  }
}
```

### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

## 5.3 Endpoints

### 5.3.1 Goals

#### `GET /api/life-os/goals`
List all goals with optional filtering.

**Query Parameters:**
- `category` - Filter by category (jeffy, family, career, personal)
- `status` - Filter by status
- `include_completed` - Include completed goals (default: false)

**Response:**
```json
{
  "success": true,
  "data": {
    "goals": [...],
    "summary": {
      "total": 10,
      "by_category": { "jeffy": 5, "family": 2, ... },
      "by_status": { "active": 6, "waiting": 2, ... }
    }
  }
}
```

#### `GET /api/life-os/goals/:id`
Get single goal with milestones and recent progress.

#### `POST /api/life-os/goals`
Create new goal.

**Request Body:**
```json
{
  "name": "Zone Partner Recruitment",
  "category": "jeffy",
  "target_value": 20,
  "minimum_value": 5,
  "unit": "partners",
  "deadline": "2026-06-01",
  "priority": 1,
  "notes": "Quality over speed",
  "milestones": [
    { "value": 5, "label": "Minimum viable network" },
    { "value": 10, "label": "Proof of concept" }
  ]
}
```

#### `PATCH /api/life-os/goals/:id`
Update goal. Also records progress snapshot if `current_value` changed.

#### `POST /api/life-os/goals/:id/progress`
Record progress update.

**Request Body:**
```json
{
  "value": 5,
  "notes": "5 applications received this week",
  "source": "manual"
}
```

#### `DELETE /api/life-os/goals/:id`
Soft delete (sets status to 'abandoned').

---

### 5.3.2 Daily Logs

#### `GET /api/life-os/daily-logs`
List logs with date range filtering.

**Query Parameters:**
- `from` - Start date (YYYY-MM-DD)
- `to` - End date (YYYY-MM-DD)
- `category` - Filter by category
- `limit` - Max results (default: 50)

#### `GET /api/life-os/daily-logs/:date`
Get all logs for a specific date.

#### `POST /api/life-os/daily-logs`
Create log entry.

**Request Body:**
```json
{
  "log_date": "2026-01-03",
  "category": "jeffy",
  "action": "Sent follow-up emails to influencers",
  "impact": "medium",
  "energy_level": 4,
  "time_spent_minutes": 45,
  "goal_id": "uuid-here",
  "notes": "3 opened, 1 replied"
}
```

#### `POST /api/life-os/daily-logs/quick`
Quick add - minimal fields.

**Request Body:**
```json
{
  "action": "Called mom",
  "category": "family"
}
```

---

### 5.3.3 Action Queue

#### `GET /api/life-os/actions`
List action items.

**Query Parameters:**
- `status` - Filter by status (default: pending,in_progress,waiting)
- `category` - Filter by category
- `sort` - Sort field (default: priority,deadline)

#### `POST /api/life-os/actions`
Create action item.

#### `PATCH /api/life-os/actions/:id`
Update action item.

#### `POST /api/life-os/actions/:id/complete`
Mark action as completed with notes.

**Request Body:**
```json
{
  "completion_notes": "Done - sent 10 emails"
}
```

#### `POST /api/life-os/actions/:id/defer`
Defer action to later.

**Request Body:**
```json
{
  "new_deadline": "2026-02-01",
  "why_deferred": "Waiting on supplier response first"
}
```

---

### 5.3.4 Calendar

#### `GET /api/life-os/calendar`
Get calendar events for date range.

**Query Parameters:**
- `from` - Start date
- `to` - End date
- `include_recurring` - Expand recurring events (default: true)

#### `POST /api/life-os/calendar`
Create event.

#### `PATCH /api/life-os/calendar/:id`
Update event.

#### `POST /api/life-os/calendar/:id/complete`
Mark event as completed.

---

### 5.3.5 Research

#### `GET /api/life-os/research`
List research entries with search.

**Query Parameters:**
- `q` - Full-text search query
- `category` - Filter by category
- `status` - Filter by status
- `tags` - Filter by tags (comma-separated)

#### `GET /api/life-os/research/:id`
Get single research entry with all details.

#### `POST /api/life-os/research`
Create research entry.

**Request Body:**
```json
{
  "title": "Lip Balm Formulation & Sourcing",
  "category": "products",
  "summary": "Research on lip balm manufacturing and 1688 sourcing",
  "status": "to_research",
  "tags": ["cosmetics", "sourcing", "1688"],
  "related_goals": ["uuid-of-wants-goal"]
}
```

#### `PATCH /api/life-os/research/:id`
Update research entry (add content, change status, etc.)

#### `GET /api/life-os/research/tags`
List all unique tags with counts.

---

### 5.3.6 Monthly Audits

#### `GET /api/life-os/audits`
List all audits.

#### `GET /api/life-os/audits/:month`
Get audit for specific month (format: YYYY-MM).

#### `POST /api/life-os/audits`
Create/trigger monthly audit.

**Request Body:**
```json
{
  "audit_month": "2026-01",
  "full_audit_text": "...",
  "goals_summary": { ... },
  "recommendations": [ ... ],
  ...
}
```

#### `GET /api/life-os/audits/:month/print`
Get printable version of audit (PDF or Markdown).

---

### 5.3.7 Evolution Log

#### `GET /api/life-os/evolution`
List evolution entries.

#### `POST /api/life-os/evolution`
Log a system change.

**Request Body:**
```json
{
  "change_type": "feature_added",
  "title": "Added stalled goals view",
  "description": "New view shows goals without progress in 14+ days",
  "rationale": "Noticed goals going stale without visibility",
  "affected_components": ["database", "api", "ui"],
  "expected_benefit": "Earlier intervention on stalled goals"
}
```

#### `PATCH /api/life-os/evolution/:id`
Update evaluation of a change.

---

### 5.3.8 Patterns

#### `GET /api/life-os/patterns`
List pattern insights.

#### `POST /api/life-os/patterns`
Record new pattern.

#### `PATCH /api/life-os/patterns/:id`
Update pattern (confirm, address, dismiss).

---

### 5.3.9 Dashboard / Summary

#### `GET /api/life-os/dashboard`
Get complete dashboard data in one call.

**Response:**
```json
{
  "success": true,
  "data": {
    "today": {
      "logs": [...],
      "pending_actions": [...],
      "events": [...]
    },
    "goals_summary": {
      "by_category": { ... },
      "stalled": [...],
      "near_deadline": [...]
    },
    "recent_research": [...],
    "focus_allocation": { ... },
    "last_audit": { ... },
    "next_audit_date": "2026-01-31",
    "active_patterns": [...]
  }
}
```

---

### 5.3.10 System

#### `GET /api/life-os/config`
Get all configuration.

#### `PATCH /api/life-os/config/:key`
Update configuration value.

#### `GET /api/life-os/export`
Export all data as JSON (backup).

#### `POST /api/life-os/import`
Import data from backup.

---

### 5.3.11 Claude Integration

#### `GET /api/life-os/claude/context`
Get complete context for Claude session start.

**Response:**
```json
{
  "success": true,
  "data": {
    "config": { ... },
    "active_goals": [...],
    "stalled_goals": [...],
    "pending_actions": [...],
    "recent_logs": [...],
    "upcoming_events": [...],
    "pending_research": [...],
    "unreviewed_advice": [...],
    "active_patterns": [...],
    "last_audit_summary": { ... },
    "days_until_next_audit": 28
  }
}
```

#### `POST /api/life-os/claude/session-update`
Bulk update after Claude session.

**Request Body:**
```json
{
  "logs": [...],
  "goal_updates": [...],
  "new_actions": [...],
  "completed_actions": [...],
  "new_research": [...],
  "updated_research": [...],
  "new_patterns": [...],
  "advice_given": [...]
}
```

---

# 6. USER INTERFACE REQUIREMENTS

## 6.1 Overall UI Principles

1. **Speed** - Dashboard loads in <1 second, quick-add takes <3 taps
2. **Clarity** - Status visible at a glance, no hunting for info
3. **Mobile-first** - Must work on phone during teaching day
4. **Focus-aligned** - UI should reinforce priority order (Jeffy first)
5. **Print-ready** - Monthly plans export cleanly

## 6.2 Navigation Integration

Add to Jeffy admin sidebar under new section "MISSION CONTROL":

```
MISSION CONTROL
├── Dashboard
├── Goals
├── Calendar
├── Actions
├── Research Archive
├── Monthly Audits
└── System
```

## 6.3 Page Specifications

### 6.3.1 Dashboard (`/admin/life-os`)

**Purpose:** Single view of everything that matters today.

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│  LIFE OS DASHBOARD                              [Quick Add] [⚙] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │ FOCUS TODAY         │  │ UPCOMING                        │  │
│  │                     │  │                                 │  │
│  │ 🔥 Jeffy (85%)     │  │ Jan 15 - Influencer follow-up   │  │
│  │ • Wait for replies  │  │ Jan 15 - Portfolio research due │  │
│  │ • Product curation  │  │ Jan 31 - MONTHLY AUDIT          │  │
│  │                     │  │                                 │  │
│  │ 👨‍👩‍👧 Family (8%)      │  │ ─────────────────────────────── │  │
│  │ • Portfolio research│  │ STALLED (no progress 14+ days)  │  │
│  │                     │  │ ⚠️ None - good!                 │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ GOAL PROGRESS                                               ││
│  │                                                             ││
│  │ Zone Partners     ████░░░░░░░░░░░░░░░░  0/20 (0%)         ││
│  │ Wants Collected   ████░░░░░░░░░░░░░░░░  0/500 (0%)        ││
│  │ Influencer Resp.  ████░░░░░░░░░░░░░░░░  0/5 (0%)          ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │ TODAY'S LOG         │  │ RECENT PATTERNS                 │  │
│  │                     │  │                                 │  │
│  │ (entries here)      │  │ 📊 No patterns yet              │  │
│  │                     │  │ (System learning...)            │  │
│  │ [+ Add Entry]       │  │                                 │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- Quick Add button → modal for fast entry
- Click goal → goes to goal detail
- Click date → goes to calendar
- Tap pattern → shows detail

---

### 6.3.2 Goals Page (`/admin/life-os/goals`)

**Purpose:** Full view and management of all goals.

**Features:**
- Grouped by category with expand/collapse
- Category headers show focus % and goal count
- Progress bars for each goal
- Status filters
- Click to expand → milestones, notes, history
- Add/edit goal forms

---

### 6.3.3 Calendar Page (`/admin/life-os/calendar`)

**Purpose:** Time-based view of deadlines and events.

**Features:**
- Monthly view with day cells
- Color-coded by category
- Click day → see details, add events
- Deadline warnings (red for overdue, orange for <7 days)
- Toggle to show/hide recurring items
- Export month to PDF

---

### 6.3.4 Actions Page (`/admin/life-os/actions`)

**Purpose:** Manage the action queue.

**Features:**
- Sortable by priority, deadline, category
- Quick complete (swipe or checkbox)
- Defer button with reason capture
- Group by status tabs: Active | Waiting | Completed
- Source indicator (manual, Claude, audit)

---

### 6.3.5 Research Archive (`/admin/life-os/research`)

**Purpose:** Search and browse all research.

**Features:**
- Full-text search bar (prominent)
- Category filter sidebar
- Tag cloud or filter
- Status filter (documented, to-research, etc.)
- Click entry → full detail with structured content
- "Request Research" button → adds to queue for Claude

---

### 6.3.6 Monthly Audits (`/admin/life-os/audits`)

**Purpose:** View past audits, trigger new ones.

**Features:**
- List of past audits by month
- Click → full audit view with all sections
- Print/export button
- "Start Audit" button (for manual trigger)
- Comparison view (month over month)

---

### 6.3.7 System Page (`/admin/life-os/system`)

**Purpose:** Configuration and system management.

**Features:**
- Configuration editor
- Evolution log viewer
- Pattern insights manager
- Export/import data
- System health indicators

---

### 6.4 Mobile Considerations

**Critical Mobile Flows:**

1. **Quick Log Entry**
   - Accessible from home screen (PWA)
   - Maximum 3 taps to log an action
   - Auto-selects today's date
   - Category picker, action text, done

2. **Check Priorities**
   - Dashboard loads first
   - Top 3 actions visible without scroll
   - No heavy graphics/animations

3. **Add to Research Queue**
   - "Save for later" quick action
   - Just title and optional note
   - Claude fills in details later

---

## 6.5 Print Specifications

### 6.5.1 Monthly Plan PDF

**Sections:**
1. Month header with dates
2. Focus allocation pie chart
3. Top priorities (numbered list)
4. Goal tracking table with progress bars
5. Key dates calendar grid
6. Daily checklist template
7. Action queue table
8. Research to-do
9. Notes section (blank space)
10. Mission statement footer

**Format:**
- A4 portrait
- Max 2 pages
- Readable without color (grayscale-friendly)
- Punch-hole margin option

### 6.5.2 Audit Report PDF

**Sections:**
1. Executive summary (1 paragraph)
2. Goals progress vs last month
3. What worked / what didn't
4. Key insights
5. Recommendations for next month
6. Research findings
7. System evolution notes
8. Raw data appendix (optional)

**Format:**
- Variable length (3-10 pages typical)
- Section headers for scanning
- Charts for progress visualization

---

# 7. INTELLIGENCE LAYER (CLAUDE INTEGRATION)

## 7.1 The Claude Protocol

### 7.1.1 Session Start Procedure

When a session with Tredoux begins that may involve Life OS:

```
1. DETECT RELEVANCE
   - Is this conversation about Jeffy, life planning, goals, or research?
   - If yes, proceed. If clearly not (e.g., quick technical question), skip.

2. LOAD CONTEXT
   - Call GET /api/life-os/claude/context
   - Parse response into working memory

3. SURFACE CRITICAL ITEMS (if relevant to conversation)
   - Overdue deadlines
   - Stalled goals
   - Waiting actions that may have unblocked
   - Days until next audit
   
4. PROCEED WITH CONVERSATION
   - Reference context naturally, don't dump data
   - Note items to update as conversation progresses
```

### 7.1.2 During Session

```
WHEN PROGRESS HAPPENS:
- Note goal progress to record
- Note actions completed
- Note new research discovered

WHEN GIVING ADVICE:
- Record advice in pending list
- Be specific and actionable
- Connect to goals where relevant

WHEN RESEARCHING:
- Use web search for current information
- Structure findings for archive
- Note sources

WHEN PATTERNS EMERGE:
- Document pattern observations
- Suggest actions if appropriate
```

### 7.1.3 Session End Procedure

```
BEFORE CONVERSATION ENDS (if Life OS was involved):

1. COMPILE UPDATES
   - Daily log entries from this session
   - Goal progress changes
   - Completed actions
   - New actions identified
   - Research findings
   - Advice given
   - Pattern observations

2. WRITE UPDATES
   - Call POST /api/life-os/claude/session-update
   - Or write individual endpoints if bulk fails

3. CONFIRM TO USER
   - "I've updated Life OS with today's progress"
   - Mention key items recorded
```

## 7.2 Monthly Audit Procedure

### 7.2.1 Trigger Conditions

- Last day of month, OR
- User requests audit, OR
- First conversation after month end

### 7.2.2 Audit Steps

```
PHASE 1: DATA GATHERING (5-10 min)
├── Pull all goals with progress history
├── Pull all daily logs for the month
├── Pull all action items (completed and pending)
├── Pull all advice outcomes
├── Pull all research added this month
├── Pull evolution log entries
└── Pull previous month's audit for comparison

PHASE 2: ANALYSIS (10-15 min)
├── Calculate goal progress percentages
├── Identify goals on track / behind / ahead
├── Identify stalled goals
├── Calculate action completion rate
├── Identify high-impact vs low-impact actions
├── Review advice effectiveness
├── Identify patterns in data
│   ├── Timing patterns (productive days/times)
│   ├── Blocking patterns (what prevents progress)
│   ├── Success patterns (what correlates with progress)
│   └── Category balance (actual vs intended focus)
└── Compare to previous month

PHASE 3: EXTERNAL RESEARCH (15-30 min)
├── Search for new AI tools relevant to projects
├── Search for SA e-commerce / Zone Partner news
├── Search for education / school funding news
├── Search topics in research queue
└── Note anything that changes strategy

PHASE 4: SYNTHESIS (10-15 min)
├── What worked this month?
├── What didn't work?
├── What should change?
├── What new opportunities exist?
├── What risks emerged?
└── What does the system itself need?

PHASE 5: OUTPUT GENERATION (10 min)
├── Generate full audit document (markdown)
├── Generate next month's priorities
├── Generate printable monthly plan
├── Generate specific recommendations
└── Note system evolution observations

PHASE 6: STORAGE
├── POST audit to /api/life-os/audits
├── Record new patterns to /api/life-os/patterns
├── Record evolution observations
├── Update advice_outcomes with evaluations
└── Generate and store PDF/MD files
```

### 7.2.3 Audit Output Format

```markdown
# LIFE OS MONTHLY AUDIT - [MONTH YEAR]

## EXECUTIVE SUMMARY
[2-3 sentence overview]

## GOAL PROGRESS

### Jeffy (85% Focus)
| Goal | Start | End | Change | Status |
|------|-------|-----|--------|--------|
| Zone Partners | 0 | 3 | +3 | 🟡 Behind |
...

### Family (8% Focus)
...

## WHAT WORKED
- [Specific thing that worked and why]
- ...

## WHAT DIDN'T WORK
- [Specific thing that didn't work and why]
- ...

## KEY PATTERNS OBSERVED
- [Pattern with evidence]
- ...

## EXTERNAL RESEARCH FINDINGS
### New Tools/Opportunities
- [Finding with source]

### Relevant News
- [News item with implications]

## RECOMMENDATIONS FOR [NEXT MONTH]
1. [Specific, actionable recommendation]
2. ...

## SYSTEM EVOLUTION NOTES
- [Observations about Life OS itself]
- [Suggested improvements]

## NEXT MONTH PRIORITIES
1. ...
2. ...
3. ...

---
Generated: [timestamp]
Audit Duration: [X] minutes
```

## 7.3 Advice Tracking Protocol

### 7.3.1 When Giving Advice

```
1. Be specific
   BAD: "You should focus more on outreach"
   GOOD: "Send 5 personalized LinkedIn messages to SA retail entrepreneurs this week"

2. Connect to goals
   "This supports the Zone Partner goal"

3. Set evaluation criteria
   "We'll know this worked if you get 2+ responses"

4. Record the advice
   - advice_text: the specific recommendation
   - advice_category: what area it relates to
   - source_type: 'session' or 'monthly_audit'
```

### 7.3.2 Evaluating Past Advice

During each audit or when naturally relevant:

```
1. Pull unreviewed advice (outcome = 'pending')
2. For each:
   - Was it followed?
   - If followed, what happened?
   - If not followed, why?
3. Mark outcome: worked / partial / didnt_work / not_followed / irrelevant
4. Record what_we_learned
```

### 7.3.3 Learning from Advice Outcomes

Over time, patterns emerge:
- What types of advice does Tredoux actually follow?
- What types of advice actually work?
- What's the gap between followed and effective?

These inform future recommendations.

---

# 8. SELF-EVOLUTION SYSTEM

## 8.1 Philosophy

The system improves through disciplined observation, not magic. Every component is designed to:

1. **Record its own usage** - Is this feature being used?
2. **Measure its effectiveness** - Is it helping?
3. **Enable modification** - Can we change it easily?
4. **Document changes** - Why did we change it?
5. **Evaluate changes** - Did the change help?

## 8.2 Evolution Mechanisms

### 8.2.1 Feature Usage Tracking

Implicitly tracked through data:
- Goals: count, categories, completion rates
- Daily logs: frequency, categories, depth
- Actions: completion rates, deferral rates
- Research: queries, retrievals, staleness
- Audits: completion, printout downloads

### 8.2.2 Effectiveness Signals

**Positive signals:**
- Goals progress consistently
- Actions complete on time
- Research gets retrieved and used
- Advice marked as "worked"
- User logs daily (system is sticky)

**Negative signals:**
- Goals stall frequently
- Actions accumulate, never complete
- Research never retrieved
- Advice marked "didn't work" or "not followed"
- Long gaps between logs (abandonment risk)

### 8.2.3 Evolution Log Entries

When changes are made, record:

```json
{
  "change_type": "feature_modified",
  "title": "Simplified daily log entry",
  "description": "Reduced required fields from 5 to 2",
  "rationale": "Pattern showed most entries had only action and category filled",
  "expected_benefit": "Higher logging consistency",
  "affected_components": ["api", "ui"],
  "system_version": "1.1.0"
}
```

### 8.2.4 Evolution Review (Quarterly)

Every 3 months, review:
- All evolution log entries
- Which changes helped vs didn't
- What friction points remain
- What capabilities are missing
- Update system version

### 8.3 Pattern Recognition System

### 8.3.1 Automatic Pattern Detection

Queries to run periodically (during audits):

**Timing Patterns:**
```sql
-- When are high-impact actions logged?
SELECT 
  EXTRACT(DOW FROM log_date) as day_of_week,
  COUNT(*) FILTER (WHERE impact = 'high') as high_impact_count
FROM daily_logs
GROUP BY day_of_week
ORDER BY high_impact_count DESC;
```

**Blocking Patterns:**
```sql
-- What gets deferred most?
SELECT 
  category,
  COUNT(*) as deferred_count
FROM action_queue
WHERE status = 'deferred'
GROUP BY category
ORDER BY deferred_count DESC;
```

**Success Patterns:**
```sql
-- What predicts goal progress?
SELECT 
  dl.category,
  COUNT(*) as action_count,
  AVG(g.current_value / g.target_value) as avg_progress
FROM daily_logs dl
JOIN goals g ON dl.goal_id = g.id
GROUP BY dl.category;
```

### 8.3.2 Manual Pattern Recognition

Claude observes patterns during sessions:
- "You've mentioned being tired 3 times this week"
- "Jeffy tasks keep getting bumped by family emergencies"
- "Research requests pile up but don't get actioned"

These get recorded as pattern_insights with confidence levels.

### 8.3.3 Acting on Patterns

When a pattern is confirmed:
1. Surface to user explicitly
2. Discuss possible responses
3. If action taken, record in pattern entry
4. Evaluate if action helped

## 8.4 System Improvement Queue

A living list maintained in system_config:

```json
{
  "improvement_queue": [
    {
      "id": "imp-001",
      "suggestion": "Add energy level to quick-add form",
      "rationale": "Energy data could reveal productivity patterns",
      "priority": "medium",
      "status": "proposed",
      "proposed_date": "2026-01-03"
    },
    ...
  ]
}
```

Reviewed during quarterly evolution assessment.

---

# 9. SECURITY & PRIVACY

## 9.1 Threat Model

### 9.1.1 Who Might Want Access?

| Actor | Motivation | Risk Level |
|-------|------------|------------|
| Competitors | Business intelligence | Medium |
| Bad actors | Personal data exploitation | Low (single user) |
| Government | Various | Varies by jurisdiction |
| Hackers | Data theft, ransomware | Medium |
| Anthropic/OpenAI | Training data | Policy-controlled |

### 9.1.2 What's at Risk?

| Data Type | Sensitivity | Impact if Leaked |
|-----------|-------------|------------------|
| Goals & plans | High | Competitive disadvantage |
| Research archive | Medium-High | IP exposure |
| Daily logs | Medium | Personal exposure |
| Family info | High | Privacy violation |
| Financial targets | High | Business risk |

## 9.2 Security Measures

### 9.2.1 Data Storage

**Supabase Configuration:**
- Row Level Security (RLS) enabled
- No public access to tables
- Service role key for API only (never exposed to client)
- Database in region with strong data protection laws

**RLS Policies:**
```sql
-- All tables get restrictive policy
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Only service role can access (no user auth needed for single user)
CREATE POLICY "service_role_only" ON goals
  FOR ALL
  USING (auth.role() = 'service_role');
```

### 9.2.2 API Security

- API routes check for valid internal request (not externally accessible)
- No sensitive data in URLs (use POST bodies)
- Rate limiting on all endpoints
- Request logging for audit trail

### 9.2.3 Network Security

- HTTPS only (Railway provides this)
- Consider VPN for admin access if public
- Optional: IP whitelist for admin routes

### 9.2.4 No Git Storage

Life OS data files NEVER go in git:
- All data in Supabase
- Add to .gitignore: `/src/data/life-os/` (if any local cache)
- Environment variables for all keys

### 9.2.5 Backup Strategy

```
Daily: Supabase automatic backups
Weekly: Export via /api/life-os/export → store encrypted copy
Monthly: Verify backup restoration works
```

### 9.2.6 Claude Session Security

- No sensitive data (passwords, keys) in Life OS
- Be cautious about specifics that could identify people
- Research archive may contain public info only
- Monthly audit summary okay; raw logs stay in DB

## 9.3 Privacy Considerations

### 9.3.1 What Claude Sees

In our conversations, Claude has access to:
- Everything in the Life OS database
- Context about goals, family, plans
- Research we've done together

### 9.3.2 What Claude Stores (Training)

Per Anthropic's policy:
- Conversations may be reviewed for safety
- Opted-out conversations not used for training
- Check current policy at time of deployment

### 9.3.3 Family Member Privacy

- Son/daughter mentioned by role, not name in stored data
- No photos or identifying details in research archive
- Family goals keep details minimal

### 9.3.4 Right to Delete

User can:
- Delete any record via UI
- Export all data
- Request complete database wipe
- Remove from Supabase entirely

---

# 10. PRINTABLE OUTPUTS

## 10.1 Document Types

### 10.1.1 Monthly Plan (Primary)

**Frequency:** Generated with each monthly audit  
**Format:** PDF (A4) and Markdown  
**Length:** 2 pages max  
**Purpose:** Physical reference for the month

**Content:**
1. Month/Year header
2. Focus allocation summary
3. Top 5 priorities (numbered)
4. Goal progress snapshot (visual bars)
5. Key dates mini-calendar
6. Weekly checklist template
7. Action queue (priority order)
8. Research to-do
9. Blank notes section
10. Mission reminder footer

### 10.1.2 Weekly Plan (Optional)

**Frequency:** On demand  
**Format:** Single page PDF  
**Purpose:** Shorter focus period

**Content:**
1. Week dates
2. Top 3 priorities
3. Each day's key task
4. Deadlines this week
5. Checkbox list

### 10.1.3 Audit Report

**Frequency:** Monthly  
**Format:** PDF and Markdown  
**Length:** 3-10 pages  
**Purpose:** Complete record of audit

**Content:** Full audit output (see Section 7.2.3)

### 10.1.4 Research Document

**Frequency:** On demand  
**Format:** PDF  
**Purpose:** Export specific research for reference

**Content:** Single research entry with all content, sources, tags

## 10.2 Print Styling

### 10.2.1 Design Requirements

- Works in grayscale (no color dependency)
- Readable at reduced size (80%)
- Clear hierarchy (headers, sections)
- Consistent margins for binder punch
- Footer with generation date

### 10.2.2 Technical Implementation

**Option A: Server-side PDF Generation**
- Use: Puppeteer or similar
- Template: HTML/CSS rendered to PDF
- Pros: Consistent output
- Cons: Server resource usage

**Option B: Client-side PDF**
- Use: react-pdf or jspdf
- Pros: No server load
- Cons: Browser variations

**Option C: Markdown Export**
- Use: Built-in markdown
- User prints via their preferred method
- Pros: Simple, flexible
- Cons: Less control over layout

**Recommendation:** Markdown primary, PDF as enhancement.

## 10.3 Export API

### `GET /api/life-os/print/monthly-plan/:month`

**Query Parameters:**
- `format`: 'pdf' | 'md' | 'html'

**Response:**
- PDF: Binary stream with content-disposition
- MD: Raw markdown text
- HTML: Rendered HTML for browser print

### `GET /api/life-os/print/audit/:month`

Same pattern as above.

### `GET /api/life-os/print/research/:id`

Export single research entry.

---

# 11. INTEGRATION POINTS

## 11.1 Jeffy Platform Integration

### 11.1.1 Data Connections

| Jeffy Data | Life OS Use |
|------------|-------------|
| Zone Partner count | Auto-update goal progress |
| Wants count | Auto-update goal progress |
| Order volume | Auto-update revenue metrics |
| Partner applications | Trigger action items |

### 11.1.2 Implementation

```sql
-- Trigger to sync Zone Partner count to goal
CREATE OR REPLACE FUNCTION sync_partner_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE goals 
  SET current_value = (
    SELECT COUNT(*) FROM zone_partners WHERE status = 'active'
  )
  WHERE id = 'zone-partners-goal-uuid';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER zone_partner_sync
  AFTER INSERT OR UPDATE ON zone_partners
  FOR EACH ROW EXECUTE FUNCTION sync_partner_count();
```

### 11.1.3 UI Integration

- Life OS link in admin sidebar
- Badge showing pending actions count
- Dashboard widget on Jeffy admin home (optional)

## 11.2 Calendar Integration (Future)

### 11.2.1 Export Options

- iCal feed for external calendar apps
- Google Calendar sync (if privacy acceptable)

### 11.2.2 Implementation

```
GET /api/life-os/calendar.ics
```

Returns standard iCal format for subscription.

## 11.3 Mobile Integration (Future)

### 11.3.1 PWA Capabilities

- Home screen installation
- Offline basic functionality
- Push notifications for deadlines

### 11.3.2 Native App (Far Future)

- React Native wrapper
- Background sync
- Quick-add widget

## 11.4 Claude API Integration (Future Evolution)

When ready to move beyond conversation-based interaction:

### 11.4.1 Scheduled Jobs

```
Daily 09:00: Claude reviews overnight and surfaces priorities
Weekly Sunday: Claude generates week preview
Monthly last day: Claude runs full audit
```

### 11.4.2 Implementation Options

**Option A: Railway Cron + Claude API**
- Scheduled jobs call Claude API
- Results written to database
- User notified via email/notification

**Option B: External Orchestrator**
- Service like Make.com or n8n
- Triggers Claude API on schedule
- More flexibility, less control

**Option C: Supabase Edge Functions**
- Scheduled functions
- Call Claude API directly
- Stays within existing stack

### 11.4.3 Cost Consideration

Claude API costs per audit:
- Input tokens: ~50k (full context)
- Output tokens: ~10k (audit report)
- Estimated: $1-3 per monthly audit
- Annual cost: ~$15-40 (acceptable)

---

# 12. IMPLEMENTATION PHASES

## 12.1 Phase 0: Foundation (Current Session)

**Deliverables:**
- ✅ Technical specification (this document)
- ✅ Data model design
- ✅ API specification

**Duration:** 1 session

## 12.2 Phase 1: Database & Core API

**Deliverables:**
- Supabase tables created
- Core API routes (goals, logs, actions)
- Basic validation

**Tasks:**
1. Create all tables in Supabase
2. Set up RLS policies
3. Implement goal CRUD API
4. Implement daily log API
5. Implement action queue API
6. Test all endpoints

**Duration:** 1-2 sessions

## 12.3 Phase 2: Essential UI

**Deliverables:**
- Dashboard page
- Goals page
- Actions page
- Quick-add component

**Tasks:**
1. Add Life OS section to admin navigation
2. Build dashboard with core widgets
3. Build goals list and detail views
4. Build action queue interface
5. Implement quick-add modal
6. Mobile responsive testing

**Duration:** 2-3 sessions

## 12.4 Phase 3: Research & Calendar

**Deliverables:**
- Research archive page
- Calendar page
- Full-text search

**Tasks:**
1. Implement research archive API with search
2. Build research archive UI
3. Implement calendar API
4. Build calendar UI
5. Test search performance

**Duration:** 1-2 sessions

## 12.5 Phase 4: Claude Integration

**Deliverables:**
- Claude context endpoint
- Session update endpoint
- Claude protocol documentation

**Tasks:**
1. Build /claude/context endpoint
2. Build /claude/session-update endpoint
3. Document Claude protocol in codebase
4. Test full session flow

**Duration:** 1 session

## 12.6 Phase 5: Monthly Audit System

**Deliverables:**
- Audit storage
- Audit generation capability
- Print export

**Tasks:**
1. Implement audit storage API
2. Build audit viewer UI
3. Implement print/export functionality
4. Run first real audit
5. Iterate on format

**Duration:** 1-2 sessions

## 12.7 Phase 6: Self-Evolution Features

**Deliverables:**
- Evolution log
- Pattern tracking
- Advice outcome tracking

**Tasks:**
1. Implement evolution log
2. Implement pattern insights
3. Implement advice outcomes
4. Build evolution dashboard
5. Create quarterly review process

**Duration:** 1-2 sessions

## 12.8 Phase 7: Polish & Automation

**Deliverables:**
- Jeffy data sync
- Automated progress updates
- Notification system

**Tasks:**
1. Create Jeffy sync triggers
2. Implement automated snapshots
3. Add deadline notifications
4. Performance optimization
5. Documentation cleanup

**Duration:** 1-2 sessions

## 12.9 Total Timeline Estimate

| Phase | Sessions | Calendar Time |
|-------|----------|---------------|
| Phase 0 | 1 | Done |
| Phase 1 | 1-2 | Week 1 |
| Phase 2 | 2-3 | Week 1-2 |
| Phase 3 | 1-2 | Week 2 |
| Phase 4 | 1 | Week 2 |
| Phase 5 | 1-2 | Week 3 |
| Phase 6 | 1-2 | Week 3-4 |
| Phase 7 | 1-2 | Week 4 |

**Total:** 10-15 sessions over 3-4 weeks for full implementation.

**MVP (Phases 1-4):** 5-8 sessions over 1-2 weeks.

---

# 13. AUDIT CHECKLIST

Use this checklist to audit the specification with another AI or reviewer.

## 13.1 Completeness

- [ ] Does the spec cover all stated requirements?
- [ ] Are all data relationships defined?
- [ ] Are all user flows documented?
- [ ] Is security adequately addressed?
- [ ] Is the self-evolution mechanism clear?

## 13.2 Consistency

- [ ] Do data models match API contracts?
- [ ] Do UI requirements align with API capabilities?
- [ ] Is terminology consistent throughout?
- [ ] Do phases build logically on each other?

## 13.3 Feasibility

- [ ] Can this be built with stated technologies?
- [ ] Are timeline estimates realistic?
- [ ] Are there hidden dependencies?
- [ ] Is the Claude integration practical?

## 13.4 Scalability

- [ ] Will this work with years of data?
- [ ] Are queries optimized with proper indexes?
- [ ] Is the architecture extensible?

## 13.5 Privacy & Security

- [ ] Is sensitive data properly protected?
- [ ] Is the no-git rule enforceable?
- [ ] Are backup/restore procedures adequate?
- [ ] Is the threat model realistic?

## 13.6 Usability

- [ ] Is quick-add actually quick?
- [ ] Is mobile experience adequate?
- [ ] Are printable outputs useful?
- [ ] Is the daily workflow sustainable?

## 13.7 Evolution

- [ ] Can the system track its own effectiveness?
- [ ] Is the evolution log sufficient?
- [ ] Can patterns actually be detected?
- [ ] Is the improvement mechanism practical?

## 13.8 Questions for Auditor

1. What's missing from this spec?
2. What's over-engineered?
3. What will break first?
4. What should be built first vs deferred?
5. What alternative approaches should be considered?

---

# 14. OPEN QUESTIONS & FUTURE EVOLUTION

## 14.1 Current Open Questions

### 14.1.1 Technical

- Should we use Supabase Realtime for live dashboard updates?
- Is PostgreSQL full-text search sufficient or need external search?
- What's the right backup frequency?

### 14.1.2 Process

- How much should Claude proactively surface vs wait to be asked?
- What's the right depth for monthly audits?
- Should weekly reviews be formalized?

### 14.1.3 Scope

- Should family members ever get their own access?
- When (if ever) does this become a product for others?
- How does this relate to Whale platform?

## 14.2 Future Evolution Paths

### 14.2.1 Short Term (3-6 months)

- Mobile PWA optimization
- Email digest option
- Calendar export

### 14.2.2 Medium Term (6-12 months)

- Scheduled Claude API calls
- Automated progress detection
- Voice input for logging

### 14.2.3 Long Term (12+ months)

- Full autonomous monitoring
- Predictive recommendations
- Integration with other life systems
- Possible productization

## 14.3 Dependencies on External Factors

| Factor | Impact | Mitigation |
|--------|--------|------------|
| Claude API pricing | Affects automation viability | Manual audit fallback |
| Supabase reliability | Single point of failure | Regular exports |
| Jeffy success | Priorities may shift | System is life-wide |
| Qingdao move | Development disruption | System helps with transition |

---

# 15. APPENDICES

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| Life OS | This entire system |
| Goal | A measurable objective with target and deadline |
| Milestone | A checkpoint within a goal |
| Daily Log | Record of actions taken on a given day |
| Action Queue | Prioritized list of tasks to do |
| Research Entry | Documented knowledge on a topic |
| Monthly Audit | Comprehensive monthly review |
| Evolution Log | Record of system changes |
| Pattern Insight | Observed behavioral or outcome pattern |
| Claude Protocol | Rules for how Claude interacts with Life OS |

## Appendix B: Category Definitions

| Category | Focus % | Includes |
|----------|---------|----------|
| Jeffy | 85% | Zone Partners, wants, products, marketing, platform |
| Family | 8% | Son, daughter, spouse, extended family |
| Career | 5% | Teaching job, Qingdao move, professional development |
| Personal | 2% | Health, hobbies, self-improvement |
| System | N/A | Life OS itself, not part of focus allocation |

## Appendix C: Status Definitions

### Goal Statuses
- **planning** - Not yet started
- **active** - Currently being worked on
- **waiting** - Blocked on external factor
- **paused** - Intentionally on hold
- **completed** - Successfully finished
- **abandoned** - Stopped, not achieved
- **future** - Scheduled for later

### Action Statuses
- **pending** - Not started
- **in_progress** - Working on it
- **waiting** - Blocked on something
- **completed** - Done
- **deferred** - Pushed to later
- **cancelled** - Not doing this

### Research Statuses
- **to_research** - Queued for research
- **in_progress** - Currently researching
- **documented** - Research complete
- **needs_update** - Info may be outdated
- **archived** - No longer relevant

## Appendix D: Sample Data

### Sample Goal
```json
{
  "id": "uuid-zone-partners",
  "name": "Zone Partner Recruitment",
  "description": "Recruit Zone Partners for Jeffy launch",
  "category": "jeffy",
  "target_value": 20,
  "minimum_value": 5,
  "current_value": 0,
  "unit": "partners",
  "deadline": "2026-06-01",
  "priority": 1,
  "status": "active",
  "notes": "Quality over speed. Each partner is a business owner.",
  "why_this_matters": "Zone Partners are the distribution network. No partners = no Jeffy.",
  "success_criteria": "20 active partners with signed agreements and completed training"
}
```

### Sample Daily Log Entry
```json
{
  "id": "uuid",
  "log_date": "2026-01-03",
  "category": "jeffy",
  "action": "Created Life OS technical specification",
  "impact": "high",
  "energy_level": 4,
  "time_spent_minutes": 180,
  "goal_id": null,
  "notes": "Comprehensive spec ready for audit"
}
```

### Sample Pattern Insight
```json
{
  "id": "uuid",
  "pattern_type": "timing",
  "title": "Saturday mornings are highest output",
  "description": "Most high-impact actions logged on Saturday 8-11am",
  "evidence": {
    "data_points": 12,
    "comparison": "3x higher impact than weekday mornings"
  },
  "confidence": "medium",
  "first_observed": "2026-02-01",
  "times_observed": 4,
  "suggested_action": "Protect Saturday mornings for deep work",
  "status": "confirmed"
}
```

---

# DOCUMENT END

**Specification Version:** 1.0.0  
**Total Length:** ~12,000 words  
**Tables Defined:** 13  
**API Endpoints:** 35+  
**Implementation Phases:** 7

**Next Action:** Submit to alternate AI for audit, then begin Phase 1 implementation.

---

*"The system that watches itself can improve itself."*
