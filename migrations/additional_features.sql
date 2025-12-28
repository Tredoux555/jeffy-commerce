-- Price Alerts Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  target_price_cents INTEGER NOT NULL,
  current_price_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'active', -- active, triggered, cancelled
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_alerts_product ON price_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_status ON price_alerts(status);
CREATE INDEX IF NOT EXISTS idx_price_alerts_email ON price_alerts(email);

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create price alerts" ON price_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage price alerts" ON price_alerts
  FOR ALL USING (true) WITH CHECK (true);


-- Product Questions Table
CREATE TABLE IF NOT EXISTS product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  asker_name TEXT DEFAULT 'Anonymous',
  answer TEXT,
  answered_at TIMESTAMPTZ,
  answered_by UUID,
  helpful INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, answered, rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_product ON product_questions(product_id);
CREATE INDEX IF NOT EXISTS idx_questions_status ON product_questions(status);

ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create questions" ON product_questions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read answered questions" ON product_questions
  FOR SELECT USING (status = 'answered');

CREATE POLICY "Service role can manage questions" ON product_questions
  FOR ALL USING (true) WITH CHECK (true);

-- Function to increment helpful count
CREATE OR REPLACE FUNCTION increment_helpful(question_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE product_questions 
  SET helpful = helpful + 1 
  WHERE id = question_id;
END;
$$ LANGUAGE plpgsql;


-- Order Modification Requests Table
CREATE TABLE IF NOT EXISTS order_modification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  admin_response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_modification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage modification requests" ON order_modification_requests
  FOR ALL USING (true) WITH CHECK (true);


-- Add cancellation fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
