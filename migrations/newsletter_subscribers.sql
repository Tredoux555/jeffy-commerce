-- Newsletter Subscribers Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'footer', -- footer, popup, checkout
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  discount_code TEXT,
  discount_used BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage subscribers" ON newsletter_subscribers
  FOR ALL USING (true) WITH CHECK (true);

-- Function to generate discount code on signup
CREATE OR REPLACE FUNCTION generate_newsletter_discount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.discount_code := 'WELCOME' || UPPER(SUBSTRING(MD5(NEW.email) FROM 1 FOR 6));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER newsletter_discount_trigger
  BEFORE INSERT ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION generate_newsletter_discount();
