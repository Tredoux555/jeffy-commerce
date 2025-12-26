-- Abandoned Cart Recovery System

CREATE TABLE IF NOT EXISTS abandoned_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  phone TEXT,
  cart_data JSONB NOT NULL, -- items, quantities, prices
  cart_total_cents INTEGER NOT NULL,
  recovery_email_sent BOOLEAN DEFAULT FALSE,
  recovery_email_sent_at TIMESTAMP WITH TIME ZONE,
  recovery_sms_sent BOOLEAN DEFAULT FALSE,
  recovery_sms_sent_at TIMESTAMP WITH TIME ZONE,
  recovery_code TEXT, -- unique discount for recovery
  recovery_discount_percent INTEGER DEFAULT 10,
  is_recovered BOOLEAN DEFAULT FALSE,
  recovered_order_id UUID,
  recovered_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recovery email templates
CREATE TABLE IF NOT EXISTS cart_recovery_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  delay_hours INTEGER NOT NULL DEFAULT 1, -- hours after abandonment
  discount_percent INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  send_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default recovery email sequence
INSERT INTO cart_recovery_templates (name, subject, body_html, delay_hours, discount_percent, send_order) VALUES
('First Reminder', 'You left something behind! 🛒', '<p>Hey! You left items in your cart. Come back and complete your order!</p>', 1, 0, 1),
('Second Reminder', 'Still thinking about it? Here''s 10% off! 💰', '<p>We noticed you haven''t completed your order. Here''s 10% off to sweeten the deal!</p>', 24, 10, 2),
('Final Reminder', 'Last chance! Your cart is expiring soon ⏰', '<p>Your cart items won''t be reserved forever. Complete your order before they''re gone!</p>', 72, 15, 3)
ON CONFLICT DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_abandoned_session ON abandoned_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_abandoned_email ON abandoned_carts(email);
CREATE INDEX IF NOT EXISTS idx_abandoned_not_recovered ON abandoned_carts(is_recovered) WHERE is_recovered = FALSE;
