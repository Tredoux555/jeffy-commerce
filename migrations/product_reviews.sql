-- Product Reviews Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  reviewer_name TEXT DEFAULT 'Anonymous',
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON product_reviews(status);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create reviews" ON product_reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read approved reviews" ON product_reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Service role can manage all reviews" ON product_reviews
  FOR ALL USING (true) WITH CHECK (true);

-- Add average rating to products (optional materialized view)
-- CREATE OR REPLACE VIEW product_ratings AS
-- SELECT 
--   product_id,
--   AVG(rating)::NUMERIC(2,1) as avg_rating,
--   COUNT(*) as review_count
-- FROM product_reviews
-- WHERE status = 'approved'
-- GROUP BY product_id;
