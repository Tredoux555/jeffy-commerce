-- Customer Segments System

CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6b7280', -- for UI badges
  icon TEXT, -- emoji or icon name
  criteria JSONB, -- rules for auto-assignment
  is_auto BOOLEAN DEFAULT FALSE, -- auto-assign based on criteria
  priority INTEGER DEFAULT 0, -- higher = shown first
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_segment_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by TEXT, -- admin email or 'system'
  UNIQUE(customer_email, segment_id)
);

-- Default segments
INSERT INTO customer_segments (name, slug, description, color, icon, is_auto, priority) VALUES
  ('VIP', 'vip', 'Top spending customers', '#eab308', '👑', false, 100),
  ('New Customer', 'new', 'Signed up in last 30 days', '#22c55e', '🆕', true, 50),
  ('At Risk', 'at-risk', 'No purchase in 60+ days', '#ef4444', '⚠️', true, 80),
  ('Loyal', 'loyal', '5+ orders completed', '#3b82f6', '💙', true, 70),
  ('Wholesale', 'wholesale', 'Bulk buyers and resellers', '#8b5cf6', '📦', false, 90)
ON CONFLICT (slug) DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_segment_members ON customer_segment_members(customer_email);
CREATE INDEX IF NOT EXISTS idx_segment_id ON customer_segment_members(segment_id);
