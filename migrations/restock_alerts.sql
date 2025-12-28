-- Restock Alerts Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS restock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending', -- pending, notified
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restock_alerts_product ON restock_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_restock_alerts_status ON restock_alerts(status);

ALTER TABLE restock_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create restock alerts" ON restock_alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage restock alerts" ON restock_alerts
  FOR ALL USING (true) WITH CHECK (true);
