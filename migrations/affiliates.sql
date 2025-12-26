-- Affiliate Program System

CREATE TABLE IF NOT EXISTS affiliates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  code TEXT NOT NULL UNIQUE, -- affiliate code (e.g., JOHN20)
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  payment_method TEXT DEFAULT 'bank', -- bank, paypal, crypto
  payment_details JSONB, -- bank account, paypal email, etc.
  commission_percent INTEGER DEFAULT 10, -- default 10%
  cookie_days INTEGER DEFAULT 30, -- attribution window
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'banned')),
  total_clicks INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  total_commission_cents INTEGER DEFAULT 0,
  pending_commission_cents INTEGER DEFAULT 0,
  paid_commission_cents INTEGER DEFAULT 0,
  min_payout_cents INTEGER DEFAULT 50000, -- R500 minimum
  last_payout_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate clicks/visits
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  referrer_url TEXT,
  landing_page TEXT,
  session_id TEXT,
  converted BOOLEAN DEFAULT FALSE,
  order_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate commissions
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  order_id UUID NOT NULL,
  order_total_cents INTEGER NOT NULL,
  commission_percent INTEGER NOT NULL,
  commission_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  paid_at TIMESTAMP WITH TIME ZONE,
  payout_id UUID, -- reference to payout batch
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliate payouts
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT, -- bank ref, paypal transaction, etc.
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_code ON affiliates(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_status ON affiliates(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_aff ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commission_aff ON affiliate_commissions(affiliate_id);
