-- LIFE OS MVP SCHEMA
-- Run this in Supabase SQL Editor
-- 5 tables, simplified from audit recommendations

-- ============================================
-- TABLE 1: life_goals
-- ============================================
CREATE TABLE life_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('jeffy', 'family', 'career', 'personal')),
  
  -- Measurement
  target_value DECIMAL(12,2) NOT NULL,
  current_value DECIMAL(12,2) DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  
  -- Timeline
  deadline DATE NOT NULL,
  started_at DATE DEFAULT CURRENT_DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN (
    'active', 'paused', 'completed', 'abandoned'
  )),
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  
  -- Milestones as JSONB (not separate table)
  milestones JSONB DEFAULT '[]',
  
  -- Context
  why_this_matters TEXT,
  notes TEXT,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_life_goals_category ON life_goals(category);
CREATE INDEX idx_life_goals_status ON life_goals(status);
CREATE INDEX idx_life_goals_priority ON life_goals(priority);

-- ============================================
-- TABLE 2: life_logs
-- ============================================
CREATE TABLE life_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Timing
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  log_time TIME,
  
  -- Content (only 2 required for quick-add)
  category VARCHAR(50) NOT NULL CHECK (category IN ('jeffy', 'family', 'career', 'personal', 'system')),
  action TEXT NOT NULL,
  
  -- Optional
  impact VARCHAR(20) DEFAULT 'medium' CHECK (impact IN ('high', 'medium', 'low')),
  time_spent_minutes INTEGER,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  notes TEXT,
  
  -- Linking
  goal_id UUID REFERENCES life_goals(id) ON DELETE SET NULL,
  
  -- Meta
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_life_logs_date ON life_logs(log_date DESC);
CREATE INDEX idx_life_logs_category ON life_logs(category);
CREATE INDEX idx_life_logs_goal ON life_logs(goal_id);

-- ============================================
-- TABLE 3: life_tasks
-- ============================================
CREATE TABLE life_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN ('jeffy', 'family', 'career', 'personal', 'system')),
  
  -- Timing
  due_date DATE,
  scheduled_date DATE,
  scheduled_time TIME,
  
  -- Priority & Status
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'waiting', 'completed', 'deferred', 'cancelled'
  )),
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(50),
  
  -- Linking
  goal_id UUID REFERENCES life_goals(id) ON DELETE SET NULL,
  
  -- Context
  notes TEXT,
  blocked_by TEXT,
  completion_notes TEXT,
  
  -- Meta
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_life_tasks_status ON life_tasks(status);
CREATE INDEX idx_life_tasks_due ON life_tasks(due_date);
CREATE INDEX idx_life_tasks_priority ON life_tasks(priority);
CREATE INDEX idx_life_tasks_category ON life_tasks(category);

-- ============================================
-- TABLE 4: life_knowledge
-- ============================================
CREATE TABLE life_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  
  -- Classification
  category VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Content
  summary TEXT,
  content TEXT,
  raw_notes TEXT,
  
  -- Sources as JSONB
  sources JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(50) DEFAULT 'documented' CHECK (status IN (
    'to_research', 'in_progress', 'documented', 'needs_update', 'archived'
  )),
  
  -- Dates
  researched_at DATE,
  last_verified_at DATE,
  
  -- Linking
  related_goals UUID[],
  
  -- Search
  search_vector tsvector,
  
  -- Meta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_life_knowledge_search ON life_knowledge USING gin(search_vector);
CREATE INDEX idx_life_knowledge_category ON life_knowledge(category);
CREATE INDEX idx_life_knowledge_tags ON life_knowledge USING gin(tags);
CREATE INDEX idx_life_knowledge_status ON life_knowledge(status);

-- Search vector trigger
CREATE OR REPLACE FUNCTION update_knowledge_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.raw_notes, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER knowledge_search_update
  BEFORE INSERT OR UPDATE ON life_knowledge
  FOR EACH ROW EXECUTE FUNCTION update_knowledge_search_vector();

-- ============================================
-- TABLE 5: life_config
-- ============================================
CREATE TABLE life_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial config
INSERT INTO life_config (key, value, description) VALUES
  ('focus_allocation', '{"jeffy": 85, "family": 8, "career": 5, "personal": 2}', 'Target percentage allocation by category'),
  ('system_version', '"1.0.0"', 'Current Life OS version'),
  ('timezone', '"Asia/Shanghai"', 'User timezone'),
  ('quick_add_defaults', '{"impact": "medium", "category": "jeffy"}', 'Defaults for quick-add form'),
  ('stalled_threshold_days', '14', 'Days without progress before goal flagged');

-- ============================================
-- USEFUL VIEWS
-- ============================================

-- Active goals with progress
CREATE VIEW v_active_goals AS
SELECT 
  g.*,
  ROUND((g.current_value / NULLIF(g.target_value, 0)) * 100, 1) as progress_percent,
  g.deadline - CURRENT_DATE as days_remaining
FROM life_goals g
WHERE g.status = 'active'
ORDER BY g.priority, g.deadline;

-- Today's summary
CREATE VIEW v_today AS
SELECT 
  (SELECT COUNT(*) FROM life_logs WHERE log_date = CURRENT_DATE) as logs_today,
  (SELECT COUNT(*) FROM life_tasks WHERE status = 'pending') as pending_tasks,
  (SELECT COUNT(*) FROM life_tasks WHERE due_date = CURRENT_DATE AND status != 'completed') as due_today,
  (SELECT COUNT(*) FROM life_tasks WHERE due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled')) as overdue,
  (SELECT COUNT(*) FROM life_goals WHERE status = 'active') as active_goals;

-- Pending tasks ordered
CREATE VIEW v_pending_tasks AS
SELECT 
  t.*,
  g.name as goal_name
FROM life_tasks t
LEFT JOIN life_goals g ON t.goal_id = g.id
WHERE t.status IN ('pending', 'in_progress', 'waiting')
ORDER BY 
  CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END,
  t.due_date,
  t.priority;

-- ============================================
-- DONE
-- ============================================
