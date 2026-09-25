-- Phase 2 migration: real landed-cost decomposition
-- STATUS: PREPARED, NOT YET APPLIED. Review before running on production.
-- Safe/additive: all columns nullable with IF NOT EXISTS — no data loss, non-breaking.
-- Apply via Supabase SQL Editor after the service-role key has been rotated.

-- 1. Landed-cost fields on products -------------------------------------------
ALTER TABLE products ADD COLUMN IF NOT EXISTS hs_code            text;     -- SARS tariff code (drives duty rate)
ALTER TABLE products ADD COLUMN IF NOT EXISTS cny_unit_cost      numeric;  -- supplier price in yuan
ALTER TABLE products ADD COLUMN IF NOT EXISTS fx_rate            numeric;  -- ZAR per CNY actually paid
ALTER TABLE products ADD COLUMN IF NOT EXISTS freight_cents      integer;  -- inbound freight allocated per unit
ALTER TABLE products ADD COLUMN IF NOT EXISTS insurance_cents    integer;  -- marine insurance per unit
ALTER TABLE products ADD COLUMN IF NOT EXISTS duty_cents         integer;  -- customs duty per unit
ALTER TABLE products ADD COLUMN IF NOT EXISTS import_vat_cents   integer;  -- 15% import VAT per unit (sunk while unregistered)
ALTER TABLE products ADD COLUMN IF NOT EXISTS clearing_cents     integer;  -- clearing/forwarding per unit
ALTER TABLE products ADD COLUMN IF NOT EXISTS landed_cost_cents  integer;  -- TRUE COGS per unit (sum of above)
ALTER TABLE products ADD COLUMN IF NOT EXISTS landed_cost_updated_at timestamptz;

COMMENT ON COLUMN products.cost_price_cents IS 'LEGACY: raw 1688 unit price, NOT true cost. Use landed_cost_cents for COGS/profit.';
COMMENT ON COLUMN products.landed_cost_cents IS 'True per-unit COGS = supplier(CNY*FX) + freight + insurance + duty + import_vat + clearing.';

-- 2. Snapshot landed cost onto order lines at time of sale --------------------
-- order_items already has unit_cost_cents; ensure a landed snapshot exists.
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS landed_unit_cost_cents integer;

-- 3. Backfill guidance (run manually, per-product, from the financial model):
--    UPDATE products SET landed_cost_cents = <value>, landed_cost_updated_at = now() WHERE id = '<uuid>';
--    Until landed_cost_cents is populated, treat profit reporting as unavailable for that product.
