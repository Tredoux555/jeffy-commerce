-- ============================================================================
-- JEFFY COMMERCE: Viral Product Prediction Engine
-- Migration 004: Trend Prediction Tables
-- STATUS: FUTURE - DO NOT RUN UNTIL PHASE 2
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For fuzzy text search

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Tracked products from various sources (1688, AliExpress, TikTok Shop)
CREATE TABLE trend_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) NOT NULL,
  source VARCHAR(30) NOT NULL CHECK (source IN ('aliexpress', 'tiktok', '1688', 'temu', 'amazon')),
  name VARCHAR(500) NOT NULL,
  name_zh VARCHAR(500),
  description TEXT,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  source_url VARCHAR(1000),
  image_urls JSONB DEFAULT '[]',
  
  -- Pricing
  source_price_cny DECIMAL(12,2),
  source_price_usd DECIMAL(12,2),
  estimated_landed_cost_zar DECIMAL(12,2),
  retail_price_zar DECIMAL(12,2),
  margin_percentage DECIMAL(5,2),
  
  -- Product attributes
  variants JSONB DEFAULT '[]',
  moq INTEGER DEFAULT 1,
  weight_grams INTEGER,
  shipping_category VARCHAR(50),
  
  -- Duty calculations
  hs_code VARCHAR(20),
  duty_rate DECIMAL(5,2) DEFAULT 0,
  vat_rate DECIMAL(5,2) DEFAULT 15,
  
  -- Scoring
  current_score DECIMAL(8,4) DEFAULT 0,
  velocity_24h DECIMAL(10,2) DEFAULT 0,
  velocity_7d DECIMAL(10,2) DEFAULT 0,
  confidence DECIMAL(5,4) DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'tracking' CHECK (status IN ('tracking', 'approved', 'rejected', 'sourcing', 'listed', 'archived')),
  mobile_friendly BOOLEAN DEFAULT true,
  
  -- Metadata
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(external_id, source)
);

-- Time-series metrics for products
CREATE TABLE trend_metrics (
  id BIGSERIAL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  product_id UUID NOT NULL REFERENCES trend_products(id) ON DELETE CASCADE,
  source VARCHAR(30) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  value DECIMAL(20,4) NOT NULL,
  metadata JSONB DEFAULT '{}',
  
  PRIMARY KEY (id, recorded_at)
) PARTITION BY RANGE (recorded_at);

-- Create partitions for metrics (monthly)
CREATE TABLE trend_metrics_2025_01 PARTITION OF trend_metrics
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE trend_metrics_2025_02 PARTITION OF trend_metrics
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE trend_metrics_2025_03 PARTITION OF trend_metrics
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE trend_metrics_2025_04 PARTITION OF trend_metrics
  FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE trend_metrics_2025_05 PARTITION OF trend_metrics
  FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE trend_metrics_2025_06 PARTITION OF trend_metrics
  FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');

-- Default partition for future data
CREATE TABLE trend_metrics_default PARTITION OF trend_metrics DEFAULT;

-- Daily aggregated scores
CREATE TABLE trend_daily_scores (
  id BIGSERIAL PRIMARY KEY,
  date DATE NOT NULL,
  product_id UUID NOT NULL REFERENCES trend_products(id) ON DELETE CASCADE,
  avg_score DECIMAL(8,4),
  peak_velocity DECIMAL(12,2),
  total_mentions INTEGER DEFAULT 0,
  total_sales_signals INTEGER DEFAULT 0,
  tiktok_score DECIMAL(8,4) DEFAULT 0,
  aliexpress_score DECIMAL(8,4) DEFAULT 0,
  google_trends_score DECIMAL(8,4) DEFAULT 0,
  price_score DECIMAL(8,4) DEFAULT 0,
  supplier_score DECIMAL(8,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, product_id)
);

-- TikTok specific tracking
CREATE TABLE tiktok_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES trend_products(id) ON DELETE CASCADE,
  video_id VARCHAR(100),
  video_url VARCHAR(500),
  creator_handle VARCHAR(100),
  creator_followers INTEGER,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  hashtags JSONB DEFAULT '[]',
  has_shop_link BOOLEAN DEFAULT false,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Google Trends data
CREATE TABLE google_trends_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword VARCHAR(255) NOT NULL,
  product_id UUID REFERENCES trend_products(id) ON DELETE SET NULL,
  region VARCHAR(10) DEFAULT 'ZA',
  interest_value INTEGER,
  interest_change_7d DECIMAL(8,2),
  interest_change_30d DECIMAL(8,2),
  related_queries JSONB DEFAULT '[]',
  related_topics JSONB DEFAULT '[]',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supplier tracking
CREATE TABLE trend_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) NOT NULL,
  source VARCHAR(30) NOT NULL,
  name VARCHAR(255),
  rating DECIMAL(3,2),
  transaction_count INTEGER,
  response_rate DECIMAL(5,2),
  on_time_delivery_rate DECIMAL(5,2),
  reliability_score DECIMAL(5,2) DEFAULT 50,
  verified BOOLEAN DEFAULT false,
  gold_supplier BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(external_id, source)
);

-- Link products to suppliers
CREATE TABLE product_suppliers (
  product_id UUID REFERENCES trend_products(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES trend_suppliers(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  price_cny DECIMAL(12,2),
  moq INTEGER,
  lead_time_days INTEGER,
  PRIMARY KEY (product_id, supplier_id)
);

-- SA-specific category performance
CREATE TABLE sa_category_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  avg_adoption_lag_days INTEGER,
  success_rate DECIMAL(5,2),
  avg_margin DECIMAL(5,2),
  typical_duty_rate DECIMAL(5,2),
  typical_hs_code VARCHAR(20),
  seasonal_weights JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, subcategory)
);

-- Prediction jobs log
CREATE TABLE trend_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  products_scanned INTEGER DEFAULT 0,
  products_added INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI analysis results
CREATE TABLE trend_ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES trend_products(id) ON DELETE CASCADE,
  sa_viability_score DECIMAL(5,2),
  reasoning TEXT,
  target_demographic TEXT,
  marketing_angle TEXT,
  risks JSONB DEFAULT '[]',
  opportunities JSONB DEFAULT '[]',
  recommendation VARCHAR(20) CHECK (recommendation IN ('approve', 'reject', 'monitor', 'needs_review')),
  suggested_retail_price_zar DECIMAL(10,2),
  suggested_category VARCHAR(100),
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  model_version VARCHAR(50)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_trend_products_source ON trend_products(source);
CREATE INDEX idx_trend_products_status ON trend_products(status);
CREATE INDEX idx_trend_products_category ON trend_products(category);
CREATE INDEX idx_trend_products_score ON trend_products(current_score DESC);
CREATE INDEX idx_trend_products_velocity ON trend_products(velocity_24h DESC);
CREATE INDEX idx_trend_products_price ON trend_products(estimated_landed_cost_zar);
CREATE INDEX idx_trend_products_name_search ON trend_products USING gin(name gin_trgm_ops);

CREATE INDEX idx_trend_metrics_product ON trend_metrics(product_id);
CREATE INDEX idx_trend_metrics_type ON trend_metrics(metric_type);
CREATE INDEX idx_trend_metrics_time ON trend_metrics(recorded_at DESC);

CREATE INDEX idx_daily_scores_date ON trend_daily_scores(date DESC);
CREATE INDEX idx_daily_scores_score ON trend_daily_scores(avg_score DESC);

CREATE INDEX idx_tiktok_signals_product ON tiktok_signals(product_id);
CREATE INDEX idx_tiktok_signals_time ON tiktok_signals(recorded_at DESC);

CREATE INDEX idx_google_trends_keyword ON google_trends_signals(keyword);
CREATE INDEX idx_google_trends_time ON google_trends_signals(recorded_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Calculate landed cost in ZAR
CREATE OR REPLACE FUNCTION calculate_landed_cost(
  source_price_usd DECIMAL,
  weight_grams INTEGER,
  duty_rate DECIMAL,
  vat_rate DECIMAL DEFAULT 15
) RETURNS DECIMAL AS $$
DECLARE
  usd_to_zar CONSTANT DECIMAL := 18.50;
  shipping_per_kg CONSTANT DECIMAL := 80;
  product_cost_zar DECIMAL;
  shipping_cost_zar DECIMAL;
  total_before_duty DECIMAL;
  duty_amount DECIMAL;
  vat_amount DECIMAL;
BEGIN
  product_cost_zar := source_price_usd * usd_to_zar;
  shipping_cost_zar := (COALESCE(weight_grams, 500) / 1000.0) * shipping_per_kg;
  total_before_duty := product_cost_zar + shipping_cost_zar;
  duty_amount := total_before_duty * (COALESCE(duty_rate, 0) / 100);
  vat_amount := (total_before_duty + duty_amount) * (vat_rate / 100);
  
  RETURN ROUND(total_before_duty + duty_amount + vat_amount, 2);
END;
$$ LANGUAGE plpgsql;

-- Get price score (higher score for products under R500)
CREATE OR REPLACE FUNCTION get_price_score(landed_cost_zar DECIMAL) RETURNS DECIMAL AS $$
BEGIN
  IF landed_cost_zar IS NULL THEN RETURN 50; END IF;
  IF landed_cost_zar <= 100 THEN RETURN 100; END IF;
  IF landed_cost_zar <= 200 THEN RETURN 90; END IF;
  IF landed_cost_zar <= 300 THEN RETURN 80; END IF;
  IF landed_cost_zar <= 400 THEN RETURN 70; END IF;
  IF landed_cost_zar <= 500 THEN RETURN 60; END IF;
  IF landed_cost_zar <= 750 THEN RETURN 40; END IF;
  IF landed_cost_zar <= 1000 THEN RETURN 25; END IF;
  RETURN 10;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SEED DATA: SA Category Performance
-- ============================================================================

INSERT INTO sa_category_performance (category, subcategory, avg_adoption_lag_days, success_rate, avg_margin, typical_duty_rate, typical_hs_code) VALUES
  ('Electronics', 'Phone Accessories', 60, 0.65, 45, 0, '8544.42'),
  ('Electronics', 'Smart Gadgets', 75, 0.55, 50, 0, '8543.70'),
  ('Electronics', 'Power Solutions', 45, 0.80, 40, 0, '8507.60'),
  ('Beauty', 'Skincare', 90, 0.70, 60, 20, '3304.99'),
  ('Beauty', 'Makeup Tools', 90, 0.60, 55, 20, '9603.29'),
  ('Home', 'Kitchen Gadgets', 120, 0.50, 45, 20, '8509.80'),
  ('Home', 'Organization', 120, 0.55, 50, 20, '3924.90'),
  ('Fashion', 'Accessories', 90, 0.45, 55, 45, '6117.80'),
  ('Fashion', 'Bags', 90, 0.40, 50, 45, '4202.22'),
  ('Toys', 'Educational', 90, 0.60, 45, 20, '9503.00'),
  ('Fitness', 'Equipment', 75, 0.55, 40, 20, '9506.91'),
  ('Pet', 'Accessories', 90, 0.50, 50, 20, '4201.00')
ON CONFLICT (category, subcategory) DO NOTHING;
