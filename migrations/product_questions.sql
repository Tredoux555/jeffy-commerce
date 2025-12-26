-- Product Questions Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, answered, published
  answered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_questions_product ON product_questions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_questions_status ON product_questions(status);

ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create questions" ON product_questions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access" ON product_questions
  FOR ALL USING (true) WITH CHECK (true);
