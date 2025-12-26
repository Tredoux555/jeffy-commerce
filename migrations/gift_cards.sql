-- Gift Cards System

CREATE TABLE IF NOT EXISTS gift_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  initial_value_cents INTEGER NOT NULL,
  current_balance_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'ZAR',
  purchaser_email TEXT,
  purchaser_name TEXT,
  recipient_email TEXT,
  recipient_name TEXT,
  message TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_redeemed BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift card transactions
CREATE TABLE IF NOT EXISTS gift_card_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_card_id UUID NOT NULL REFERENCES gift_cards(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL, -- negative for usage, positive for refunds
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'redeem', 'refund')),
  order_id UUID,
  balance_after_cents INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gift card templates (for purchase UI)
CREATE TABLE IF NOT EXISTS gift_card_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value_cents INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default templates
INSERT INTO gift_card_templates (name, value_cents, sort_order) VALUES
('R50 Gift Card', 5000, 1),
('R100 Gift Card', 10000, 2),
('R250 Gift Card', 25000, 3),
('R500 Gift Card', 50000, 4),
('R1000 Gift Card', 100000, 5)
ON CONFLICT DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_gift_card_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_card_active ON gift_cards(is_active) WHERE is_active = TRUE;
