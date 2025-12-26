-- Customer Segments

CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT '👤',
  criteria JSONB, -- { minOrders: 5, minSpent: 100000, lastOrderDays: 30 }
  auto_update BOOLEAN DEFAULT TRUE, -- auto-assign based on criteria
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer-segment assignments
CREATE TABLE IF NOT EXISTS customer_segment_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(segment_id, customer_email)
);

-- Insert default segments
INSERT INTO customer_segments (name, slug, description, color, icon, criteria) VALUES
('VIP', 'vip', 'High-value customers with 5+ orders or R1000+ spent', '#fbbf24', '👑', '{"minOrders": 5, "minSpentCents": 100000}'),
('New Customers', 'new', 'First-time buyers in the last 30 days', '#22c55e', '🌟', '{"maxOrders": 1, "lastOrderDays": 30}'),
('At Risk', 'at-risk', 'Haven''t ordered in 60+ days', '#ef4444', '⚠️', '{"minOrders": 1, "noOrderDays": 60}'),
('Loyal', 'loyal', 'Ordered 3+ times', '#8b5cf6', '💜', '{"minOrders": 3}'),
('Big Spenders', 'big-spenders', 'Spent R2000+ total', '#f97316', '💰', '{"minSpentCents": 200000}')
ON CONFLICT (slug) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_segment_members ON customer_segment_members(segment_id);
CREATE INDEX IF NOT EXISTS idx_segment_email ON customer_segment_members(customer_email);
