-- Product Pipeline & SA Trend Scoring Migration
-- Run in Supabase SQL Editor

-- Product candidates table (the pipeline)
CREATE TABLE IF NOT EXISTS product_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  name TEXT NOT NULL,
  chinese_keyword TEXT,
  chinese_keyword_alt TEXT,
  category TEXT,
  subcategory TEXT,
  
  -- Pricing (all in ZAR)
  estimated_retail_zar DECIMAL(10,2),
  estimated_1688_cost_zar DECIMAL(10,2),
  landed_cost_zar DECIMAL(10,2),  -- After shipping + duties
  margin_percent INTEGER,
  
  -- SA Trend Scoring (0-100 each)
  sa_trend_score INTEGER,  -- Composite score
  tiktok_velocity_score INTEGER,
  aliexpress_score INTEGER,
  price_competitiveness_score INTEGER,
  search_volume_score INTEGER,
  mobile_friendliness_score INTEGER,
  supplier_reliability_score INTEGER,
  category_adoption_score INTEGER,
  
  -- Trend Intelligence
  demand_signals TEXT[],
  competition_level TEXT CHECK (competition_level IN ('low', 'medium', 'high')),
  trend_lag_weeks INTEGER,  -- Estimated weeks until SA peak
  trend_source TEXT,  -- 'tiktok', 'aliexpress', 'amazon', 'manual'
  
  -- SA Market Factors
  price_tier TEXT CHECK (price_tier IN ('impulse', 'considered', 'premium')),  -- <R200, R200-500, >R500
  duty_category TEXT,  -- 'zero', 'standard', 'clothing_45'
  duty_percent INTEGER DEFAULT 0,
  mobile_friendly BOOLEAN DEFAULT true,
  
  -- Pipeline Status
  pipeline_status TEXT DEFAULT 'research' CHECK (pipeline_status IN (
    'research',      -- Just identified
    'validated',     -- Passes scoring threshold
    'sourcing',      -- Finding suppliers
    'sampling',      -- Samples ordered
    'approved',      -- Ready to import
    'importing',     -- Order placed
    'live',          -- On sale
    'discontinued'   -- No longer pursuing
  )),
  
  -- Sourcing Info
  factory_url TEXT,
  factory_name TEXT,
  factory_verified BOOLEAN DEFAULT false,
  moq_estimate TEXT,
  lead_time_days INTEGER,
  shipping_type TEXT CHECK (shipping_type IN ('air', 'sea', 'express')),
  
  -- 1688 Links
  search_url_primary TEXT,
  search_url_factory TEXT,
  search_url_oem TEXT,
  
  -- Source Research
  research_id UUID REFERENCES oem_research(id) ON DELETE SET NULL,
  ai_recommendation TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'ai_extraction'
);

-- Product notes/activity log
CREATE TABLE IF NOT EXISTS product_candidate_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES product_candidates(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN (
    'general', 'price_update', 'supplier', 'sample', 'quality', 'status_change'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'tredoux'
);

-- Supplier/Factory tracking
CREATE TABLE IF NOT EXISTS verified_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factory_name TEXT NOT NULL,
  factory_url TEXT,
  location TEXT,
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMPTZ,
  employee_count TEXT,
  years_in_business INTEGER,
  badges TEXT[],  -- '源头厂家', 'Trade Assurance', etc.
  
  -- Performance
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  delivery_rating INTEGER CHECK (delivery_rating BETWEEN 1 AND 5),
  
  -- Products
  product_categories TEXT[],
  oem_capable BOOLEAN DEFAULT false,
  min_moq INTEGER,
  
  -- Contact
  contact_method TEXT,
  wechat_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link suppliers to products
CREATE TABLE IF NOT EXISTS product_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES product_candidates(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES verified_suppliers(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  quoted_price_cny DECIMAL(10,2),
  quoted_moq INTEGER,
  sample_ordered BOOLEAN DEFAULT false,
  sample_approved BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_candidates_status ON product_candidates(pipeline_status);
CREATE INDEX IF NOT EXISTS idx_candidates_score ON product_candidates(sa_trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_candidates_category ON product_candidates(category);
CREATE INDEX IF NOT EXISTS idx_candidates_research ON product_candidates(research_id);
CREATE INDEX IF NOT EXISTS idx_candidate_notes_product ON product_candidate_notes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_suppliers_product ON product_suppliers(product_id);

-- Grant permissions
GRANT ALL ON product_candidates TO service_role, authenticated, anon;
GRANT ALL ON product_candidate_notes TO service_role, authenticated, anon;
GRANT ALL ON verified_suppliers TO service_role, authenticated, anon;
GRANT ALL ON product_suppliers TO service_role, authenticated, anon;

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_product_candidates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_candidates_updated_at ON product_candidates;
CREATE TRIGGER product_candidates_updated_at
  BEFORE UPDATE ON product_candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_product_candidates_updated_at();
