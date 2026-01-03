-- =====================================================
-- Zone Partner Payment Tracking System
-- Run this in Supabase SQL Editor
-- =====================================================

-- Weekly stock deliveries to Zone Partners
CREATE TABLE IF NOT EXISTS zp_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES zone_partners(id) ON DELETE CASCADE,
  
  -- Delivery details
  delivery_date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_number INTEGER NOT NULL, -- Week of year
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  
  -- Financials (in cents to avoid float issues)
  wholesale_total_cents INTEGER NOT NULL, -- What ZP owes for this delivery
  
  -- Status
  status TEXT DEFAULT 'delivered' CHECK (status IN ('pending', 'delivered', 'cancelled')),
  notes TEXT,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Ensure one delivery per partner per week
  UNIQUE(partner_id, week_number, year)
);

-- Payments received from Zone Partners
CREATE TABLE IF NOT EXISTS zp_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES zone_partners(id) ON DELETE CASCADE,
  
  -- Payment details
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_cents INTEGER NOT NULL, -- Amount received
  
  -- Payment method
  method TEXT DEFAULT 'eft' CHECK (method IN ('eft', 'cash', 'card', 'other')),
  reference TEXT, -- Bank reference or receipt number
  
  -- Status
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'reversed')),
  notes TEXT,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_zp_deliveries_partner ON zp_deliveries(partner_id);
CREATE INDEX IF NOT EXISTS idx_zp_deliveries_date ON zp_deliveries(delivery_date DESC);
CREATE INDEX IF NOT EXISTS idx_zp_deliveries_week ON zp_deliveries(year, week_number);
CREATE INDEX IF NOT EXISTS idx_zp_payments_partner ON zp_payments(partner_id);
CREATE INDEX IF NOT EXISTS idx_zp_payments_date ON zp_payments(payment_date DESC);

-- View: Partner balances (what each ZP owes)
CREATE OR REPLACE VIEW zp_balances AS
SELECT 
  zp.id as partner_id,
  zp.full_name,
  zp.email,
  zp.phone,
  zp.zone_name,
  zp.is_active,
  COALESCE(d.total_delivered_cents, 0) as total_delivered_cents,
  COALESCE(p.total_paid_cents, 0) as total_paid_cents,
  COALESCE(d.total_delivered_cents, 0) - COALESCE(p.total_paid_cents, 0) as balance_cents,
  d.last_delivery_date,
  p.last_payment_date,
  d.delivery_count,
  p.payment_count
FROM zone_partners zp
LEFT JOIN (
  SELECT 
    partner_id,
    SUM(wholesale_total_cents) as total_delivered_cents,
    MAX(delivery_date) as last_delivery_date,
    COUNT(*) as delivery_count
  FROM zp_deliveries
  WHERE status = 'delivered'
  GROUP BY partner_id
) d ON d.partner_id = zp.id
LEFT JOIN (
  SELECT 
    partner_id,
    SUM(amount_cents) as total_paid_cents,
    MAX(payment_date) as last_payment_date,
    COUNT(*) as payment_count
  FROM zp_payments
  WHERE status = 'confirmed'
  GROUP BY partner_id
) p ON p.partner_id = zp.id
WHERE zp.status = 'approved' OR zp.is_active = true;

-- Grant permissions
GRANT ALL ON zp_deliveries TO service_role;
GRANT ALL ON zp_deliveries TO authenticated;
GRANT ALL ON zp_payments TO service_role;
GRANT ALL ON zp_payments TO authenticated;
GRANT SELECT ON zp_balances TO service_role;
GRANT SELECT ON zp_balances TO authenticated;

-- Enable RLS
ALTER TABLE zp_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE zp_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Service role has full access
CREATE POLICY "Service role full access on deliveries" ON zp_deliveries FOR ALL USING (true);
CREATE POLICY "Service role full access on payments" ON zp_payments FOR ALL USING (true);

-- =====================================================
-- Verify setup
-- =====================================================
SELECT 'zp_deliveries' as table_name, COUNT(*) as columns 
FROM information_schema.columns WHERE table_name = 'zp_deliveries'
UNION ALL
SELECT 'zp_payments', COUNT(*) 
FROM information_schema.columns WHERE table_name = 'zp_payments';
