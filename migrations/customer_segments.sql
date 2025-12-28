-- Customer Segments System

CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6b7280', -- for UI badges
  criteria JSONB, -- auto-segment rules
  is_auto BOOLEAN DEFAULT FALSE, -- auto-assign based on criteria
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer to segment mapping
CREATE TABLE IF NOT EXISTS customer_segment_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by TEXT, -- 'auto' or admin email
  UNIQUE(customer_email, segment_id)
);

-- Insert default segments
INSERT INTO customer_segments (name, slug, description, color, is_auto, criteria) VALUES
('VIP', 'vip', 'High-value customers with 5+ orders or R5000+ spent', '#eab308', TRUE, '{"min_orders": 5, "min_spent_cents": 500000}'),
('New', 'new', 'Customers who signed up in the last 30 days', '#22c55e', TRUE, '{"days_since_signup": 30}'),
('At Risk', 'at-risk', 'Haven''t ordered in 60+ days', '#ef4444', TRUE, '{"days_since_order": 60}'),
('Loyal', 'loyal', 'Ordered 3+ times', '#3b82f6', TRUE, '{"min_orders": 3}'),
('Big Spender', 'big-spender', 'Average order over R1000', '#8b5cf6', TRUE, '{"min_avg_order_cents": 100000}'),
('Wholesale', 'wholesale', 'Business/bulk buyers', '#f97316', FALSE, NULL)
ON CONFLICT (slug) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_segment_members_email ON customer_segment_members(customer_email);
CREATE INDEX IF NOT EXISTS idx_segment_members_segment ON customer_segment_members(segment_id);
