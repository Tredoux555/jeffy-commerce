-- Customer Segments System

CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6b7280',
  icon TEXT DEFAULT 'users',
  -- Automatic segment rules (JSON)
  rules JSONB,
  -- Manual or automatic
  is_automatic BOOLEAN DEFAULT TRUE,
  customer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer to segment mapping (for manual segments)
CREATE TABLE IF NOT EXISTS customer_segment_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by TEXT, -- admin who added
  UNIQUE(customer_email, segment_id)
);

-- Insert default segments
INSERT INTO customer_segments (name, description, color, icon, rules, is_automatic) VALUES
  ('VIP', 'Customers with 5+ orders or R5000+ lifetime spend', '#f59e0b', 'crown', '{"or": [{"orders_count": {"gte": 5}}, {"lifetime_spend": {"gte": 500000}}]}', true),
  ('New', 'Customers who joined in the last 30 days', '#22c55e', 'sparkles', '{"created_days_ago": {"lte": 30}}', true),
  ('At Risk', 'No orders in 60+ days', '#ef4444', 'alert-triangle', '{"last_order_days_ago": {"gte": 60}}', true),
  ('Loyal', 'Customers with 3+ orders', '#3b82f6', 'heart', '{"orders_count": {"gte": 3}}', true),
  ('Big Spenders', 'Single order of R2000+', '#8b5cf6', 'trending-up', '{"max_order_value": {"gte": 200000}}', true),
  ('Inactive', 'No orders in 90+ days', '#6b7280', 'moon', '{"last_order_days_ago": {"gte": 90}}', true)
ON CONFLICT DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_segment_members ON customer_segment_members(customer_email);
CREATE INDEX IF NOT EXISTS idx_segment_id ON customer_segment_members(segment_id);
