-- Flash Sales System

CREATE TABLE IF NOT EXISTS flash_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  banner_image_url TEXT,
  badge_text TEXT DEFAULT 'FLASH SALE',
  badge_color TEXT DEFAULT '#ef4444',
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  show_countdown BOOLEAN DEFAULT TRUE,
  max_orders INTEGER, -- optional limit
  current_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flash sale items
CREATE TABLE IF NOT EXISTS flash_sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  flash_sale_id UUID NOT NULL REFERENCES flash_sales(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sale_price_cents INTEGER NOT NULL,
  original_price_cents INTEGER NOT NULL,
  quantity_limit INTEGER, -- per customer
  stock_allocated INTEGER DEFAULT 0,
  stock_sold INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(flash_sale_id, product_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_flash_active ON flash_sales(is_active, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_flash_items_sale ON flash_sale_items(flash_sale_id);
