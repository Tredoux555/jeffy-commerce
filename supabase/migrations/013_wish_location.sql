-- Approximate, privacy-light location for each wish, derived from the request IP
-- at submission time (city / region / country only — never the raw IP address).
-- The submission API (src/app/api/wants/public/route.ts) best-effort populates
-- these columns; until this migration is applied it simply skips them and the
-- wish is still saved. Run this once in the Supabase SQL editor to start capturing.

ALTER TABLE wants ADD COLUMN IF NOT EXISTS ip_country TEXT;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS ip_region  TEXT;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS ip_city    TEXT;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS ip_area    TEXT;  -- "City, Region" for convenience

CREATE INDEX IF NOT EXISTS idx_wants_ip_country ON wants(ip_country);
