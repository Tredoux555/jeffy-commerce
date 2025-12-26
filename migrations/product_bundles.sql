-- Product Bundles System

CREATE TABLE IF NOT EXISTS product_bundles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  bundle_price_cents INTEGER NOT NULL,
  compare_price_cents INTEGER, -- sum of individual prices
  savings_percent INTEGER GENERATED ALWAYS AS (
    CASE WHEN compare_price_cents > 0 
    THEN ROUND(((compare_price_cents - bundle_price_cents)::numeric / compare_price_cents) * 100)
    ELSE 0 END
  ) STORED,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 0,
  max_per_order INTEGER DEFAULT 5,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bundle items (products in the bundle)
CREATE TABLE IF NOT EXISTS bundle_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES product_bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  variant_id UUID, -- optional specific variant
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(bundle_id, product_id, variant_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_active ON product_bundles(is_active) WHERE is_active = TRUE;
