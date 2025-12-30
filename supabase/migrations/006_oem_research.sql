-- OEM Research Database Migration
-- Run this in Supabase SQL Editor
-- This stores deep dive research on OEM factories and best-selling products

-- Main research entries table
CREATE TABLE IF NOT EXISTS oem_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product Information
  product_name TEXT NOT NULL,
  brand_name TEXT,
  product_category TEXT,
  
  -- Factory/OEM Information  
  factory_name TEXT,
  factory_location TEXT,
  factory_certifications TEXT[], -- Array of certs like ISO, FDA, etc.
  factory_moq INTEGER,
  factory_lead_time TEXT,
  
  -- Sourcing Links
  alibaba_link TEXT,
  link_1688 TEXT,
  factory_website TEXT,
  other_links JSONB DEFAULT '[]', -- Array of {url, description}
  
  -- Pricing Information
  retail_price_usd DECIMAL(10,2),
  oem_price_usd DECIMAL(10,2),
  oem_price_rmb DECIMAL(10,2),
  price_tier_info JSONB, -- {qty: price} pairs
  
  -- Research Content
  raw_research TEXT, -- Full unstructured research text for Claude to read
  key_findings TEXT[], -- Array of bullet points
  quality_notes TEXT,
  competition_analysis TEXT,
  market_demand_notes TEXT,
  
  -- Verification & Status
  verified BOOLEAN DEFAULT false,
  verification_notes TEXT,
  research_status TEXT DEFAULT 'draft' CHECK (research_status IN ('draft', 'verified', 'sourcing', 'rejected', 'active')),
  priority INTEGER DEFAULT 0, -- Higher = more important
  
  -- Media
  images JSONB DEFAULT '[]', -- Array of image URLs
  documents JSONB DEFAULT '[]', -- Array of {url, name, type}
  
  -- Metadata
  source TEXT, -- Where this research came from
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'tredoux'
);

-- Research notes table for ongoing updates/comments
CREATE TABLE IF NOT EXISTS oem_research_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id UUID NOT NULL REFERENCES oem_research(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'price_update', 'quality', 'communication', 'action_item')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT DEFAULT 'tredoux'
);

-- Research links to track all related URLs
CREATE TABLE IF NOT EXISTS oem_research_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id UUID NOT NULL REFERENCES oem_research(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  link_type TEXT DEFAULT 'reference' CHECK (link_type IN ('factory', '1688', 'alibaba', 'reference', 'competitor', 'video', 'document')),
  title TEXT,
  notes TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_oem_research_product ON oem_research(product_name);
CREATE INDEX IF NOT EXISTS idx_oem_research_brand ON oem_research(brand_name);
CREATE INDEX IF NOT EXISTS idx_oem_research_status ON oem_research(research_status);
CREATE INDEX IF NOT EXISTS idx_oem_research_priority ON oem_research(priority DESC);
CREATE INDEX IF NOT EXISTS idx_oem_research_created ON oem_research(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_oem_research_notes_research ON oem_research_notes(research_id);
CREATE INDEX IF NOT EXISTS idx_oem_research_links_research ON oem_research_links(research_id);

-- Full text search on research content
CREATE INDEX IF NOT EXISTS idx_oem_research_fts ON oem_research USING gin(
  to_tsvector('english', coalesce(product_name, '') || ' ' || 
              coalesce(brand_name, '') || ' ' || 
              coalesce(raw_research, '') || ' ' ||
              coalesce(key_findings::text, ''))
);

-- RLS Policies (admin only for now)
ALTER TABLE oem_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE oem_research_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE oem_research_links ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (admin)
CREATE POLICY "Allow all for authenticated" ON oem_research FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON oem_research_notes FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON oem_research_links FOR ALL USING (true);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_oem_research_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER oem_research_updated_at
  BEFORE UPDATE ON oem_research
  FOR EACH ROW
  EXECUTE FUNCTION update_oem_research_updated_at();

COMMENT ON TABLE oem_research IS 'Stores deep dive research on OEM factories and best-selling products for sourcing';
COMMENT ON TABLE oem_research_notes IS 'Ongoing notes and updates for OEM research entries';
COMMENT ON TABLE oem_research_links IS 'All URLs related to a research entry';
