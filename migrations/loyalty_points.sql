-- Loyalty Points System

-- Points ledger (tracks all point transactions)
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  user_phone TEXT,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'bonus', 'refund')),
  source TEXT, -- 'purchase', 'signup', 'referral', 'review', 'birthday', 'manual'
  reference_id UUID, -- order_id or other reference
  description TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Points balance view (calculated)
CREATE OR REPLACE VIEW loyalty_balances AS
SELECT 
  COALESCE(user_id::text, user_email, user_phone) as customer_id,
  user_id,
  user_email,
  user_phone,
  SUM(CASE WHEN transaction_type IN ('earn', 'bonus') THEN points ELSE 0 END) as total_earned,
  SUM(CASE WHEN transaction_type = 'redeem' THEN ABS(points) ELSE 0 END) as total_redeemed,
  SUM(CASE WHEN transaction_type = 'expire' THEN ABS(points) ELSE 0 END) as total_expired,
  SUM(points) as current_balance
FROM loyalty_points
GROUP BY user_id, user_email, user_phone;

-- Loyalty tiers
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  min_points INTEGER NOT NULL DEFAULT 0,
  points_multiplier DECIMAL(3,2) DEFAULT 1.0, -- e.g., 1.5x points for Gold
  discount_percent INTEGER DEFAULT 0,
  free_shipping BOOLEAN DEFAULT FALSE,
  icon TEXT,
  color TEXT,
  benefits JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO loyalty_tiers (name, min_points, points_multiplier, discount_percent, free_shipping, icon, color) VALUES
('Bronze', 0, 1.0, 0, false, '🥉', '#CD7F32'),
('Silver', 500, 1.25, 5, false, '🥈', '#C0C0C0'),
('Gold', 2000, 1.5, 10, true, '🥇', '#FFD700'),
('Platinum', 5000, 2.0, 15, true, '💎', '#E5E4E2')
ON CONFLICT DO NOTHING;

-- Loyalty settings
CREATE TABLE IF NOT EXISTS loyalty_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  points_per_rand INTEGER DEFAULT 1, -- 1 point per R1 spent
  points_value_cents INTEGER DEFAULT 10, -- 1 point = R0.10
  signup_bonus INTEGER DEFAULT 100,
  referral_bonus INTEGER DEFAULT 200,
  review_bonus INTEGER DEFAULT 50,
  birthday_bonus INTEGER DEFAULT 100,
  min_redeem_points INTEGER DEFAULT 100,
  points_expiry_days INTEGER DEFAULT 365,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO loyalty_settings (id, points_per_rand, points_value_cents, signup_bonus) 
VALUES ('00000000-0000-0000-0000-000000000001', 1, 10, 100)
ON CONFLICT (id) DO NOTHING;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_loyalty_user ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_email ON loyalty_points(user_email);
CREATE INDEX IF NOT EXISTS idx_loyalty_phone ON loyalty_points(user_phone);
