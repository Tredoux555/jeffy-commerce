-- Partner Stock Tracking Migration
-- Run this in Supabase SQL Editor

-- Table to track stock held by each partner
CREATE TABLE IF NOT EXISTS partner_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES zone_partners(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved INTEGER NOT NULL DEFAULT 0,
  last_restocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partner_id, product_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_partner_stock_partner ON partner_stock(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_stock_product ON partner_stock(product_id);

-- Add low stock threshold to zone_partners if not exists
ALTER TABLE zone_partners ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 3;
