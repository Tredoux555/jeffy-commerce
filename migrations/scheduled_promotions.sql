-- Scheduled Sales / Promotions System

CREATE TABLE IF NOT EXISTS scheduled_promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  promotion_type TEXT NOT NULL CHECK (promotion_type IN ('percentage', 'fixed', 'buy_x_get_y', 'free_shipping')),
  discount_value INTEGER, -- percent or cents
  buy_quantity INTEGER, -- for buy X get Y
  get_quantity INTEGER,
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'category', 'product', 'collection')),
  target_ids UUID[], -- category/product IDs if applies_to != 'all'
  min_order_cents INTEGER DEFAULT 0,
  max_discount_cents INTEGER, -- cap on discount
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  auto_apply BOOLEAN DEFAULT FALSE, -- automatically apply at checkout
  show_banner BOOLEAN DEFAULT TRUE,
  banner_text TEXT,
  banner_color TEXT DEFAULT '#ff6b35',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for active promotions lookup
CREATE INDEX IF NOT EXISTS idx_promo_active_dates ON scheduled_promotions(is_active, starts_at, ends_at);

-- Function to get currently active promotions
CREATE OR REPLACE FUNCTION get_active_promotions()
RETURNS SETOF scheduled_promotions AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM scheduled_promotions
  WHERE is_active = TRUE
    AND starts_at <= NOW()
    AND ends_at >= NOW()
    AND (usage_limit IS NULL OR usage_count < usage_limit)
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;
