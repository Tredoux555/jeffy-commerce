-- Referral Program System

CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_email TEXT NOT NULL,
  referrer_phone TEXT,
  referrer_name TEXT,
  referral_code TEXT NOT NULL UNIQUE,
  referred_email TEXT,
  referred_phone TEXT,
  referred_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'purchased', 'rewarded')),
  referrer_reward_cents INTEGER DEFAULT 5000, -- R50
  referred_reward_cents INTEGER DEFAULT 5000, -- R50
  referrer_rewarded BOOLEAN DEFAULT FALSE,
  referred_rewarded BOOLEAN DEFAULT FALSE,
  referred_order_id UUID,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Referral settings
CREATE TABLE IF NOT EXISTS referral_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_reward_cents INTEGER DEFAULT 5000,
  referred_reward_cents INTEGER DEFAULT 5000,
  min_order_cents INTEGER DEFAULT 20000, -- R200 minimum order
  reward_type TEXT DEFAULT 'credit' CHECK (reward_type IN ('credit', 'discount', 'points')),
  max_referrals_per_user INTEGER DEFAULT 50,
  expiry_days INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO referral_settings (id, referrer_reward_cents, referred_reward_cents) 
VALUES ('00000000-0000-0000-0000-000000000001', 5000, 5000)
ON CONFLICT (id) DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_referral_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_referrer ON referrals(referrer_email);
