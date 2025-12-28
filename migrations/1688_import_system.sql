-- 1688 Import System
-- Adds columns to products table for tracking imported products

-- Add source tracking columns to products (if they don't exist)
DO $$ 
BEGIN
  -- Add source column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'source') THEN
    ALTER TABLE products ADD COLUMN source VARCHAR(50) DEFAULT 'manual';
  END IF;

  -- Add source product ID
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'source_product_id') THEN
    ALTER TABLE products ADD COLUMN source_product_id VARCHAR(100);
  END IF;

  -- Add source URL
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'source_url') THEN
    ALTER TABLE products ADD COLUMN source_url TEXT;
  END IF;

  -- Add source data JSON (stores original Chinese title, description, etc.)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'source_data') THEN
    ALTER TABLE products ADD COLUMN source_data JSONB DEFAULT '{}';
  END IF;

  -- Add main_image column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'main_image') THEN
    ALTER TABLE products ADD COLUMN main_image TEXT;
  END IF;

  -- Add cost_price column if not exists (in cents)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cost_price') THEN
    ALTER TABLE products ADD COLUMN cost_price INTEGER DEFAULT 0;
  END IF;

  -- Add status column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'status') THEN
    ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
  END IF;

  -- Add compare_at_price column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'compare_at_price') THEN
    ALTER TABLE products ADD COLUMN compare_at_price INTEGER;
  END IF;

  -- Add short_description column if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'short_description') THEN
    ALTER TABLE products ADD COLUMN short_description TEXT;
  END IF;
END $$;

-- Create index on source_product_id for quick lookups
CREATE INDEX IF NOT EXISTS idx_products_source_product_id ON products(source_product_id);
CREATE INDEX IF NOT EXISTS idx_products_source ON products(source);

-- Import logs table
CREATE TABLE IF NOT EXISTS import_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source VARCHAR(50) NOT NULL DEFAULT '1688',
  source_product_id VARCHAR(100),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  data JSONB DEFAULT '{}',
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for import logs
CREATE INDEX IF NOT EXISTS idx_import_logs_source ON import_logs(source);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_created ON import_logs(created_at DESC);

-- Exchange rates table (for dynamic pricing)
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(10, 4) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_currency, to_currency)
);

-- Insert default CNY to ZAR rate
INSERT INTO exchange_rates (from_currency, to_currency, rate)
VALUES ('CNY', 'ZAR', 3.20)
ON CONFLICT (from_currency, to_currency) 
DO UPDATE SET rate = EXCLUDED.rate, updated_at = NOW();

-- Pricing rules table
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  source VARCHAR(50) DEFAULT '1688',
  markup_percentage DECIMAL(5, 2) DEFAULT 150.00,
  shipping_per_kg DECIMAL(10, 2) DEFAULT 150.00,
  default_weight_kg DECIMAL(10, 3) DEFAULT 0.500,
  round_to INTEGER DEFAULT 500, -- round to nearest 500 cents (R5)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default pricing rule
INSERT INTO pricing_rules (name, source, markup_percentage, shipping_per_kg, default_weight_kg, round_to)
VALUES ('Default 1688', '1688', 150.00, 150.00, 0.500, 500)
ON CONFLICT DO NOTHING;
