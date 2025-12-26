-- Discount codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL, -- percentage (0-100) or cents
  min_order_cents INTEGER DEFAULT 0,
  max_uses INTEGER, -- null = unlimited
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some launch codes
INSERT INTO discount_codes (code, description, discount_type, discount_value, min_order_cents, max_uses) VALUES
('LAUNCH20', 'Launch discount - 20% off', 'percentage', 20, 10000, 100),
('WELCOME10', 'Welcome discount - 10% off first order', 'percentage', 10, 0, null),
('SAVE50', 'R50 off orders over R500', 'fixed', 5000, 50000, 50);
