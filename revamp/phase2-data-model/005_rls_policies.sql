-- Migration 005: enable Row Level Security on the buy-sell tables.
-- STATUS: PREPARED, NOT YET APPLIED. Apply in Supabase after 003 + 004.
--
-- The app talks to Supabase with the SERVICE-ROLE key, which bypasses RLS, so enabling
-- RLS here does not break the server routes — it locks these tables against the public
-- anon/auth keys (defence in depth). Public Wish List winners stay readable.

ALTER TABLE distributors       ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_stock  ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_grants    ENABLE ROW LEVEL SECURITY;

-- No permissive policies on the distributor tables → only the service role can touch them.

-- Public winners (is_public) are readable by anyone (for the public "wish granted" page).
DROP POLICY IF EXISTS wishlist_grants_public_read ON wishlist_grants;
CREATE POLICY wishlist_grants_public_read ON wishlist_grants
  FOR SELECT USING (is_public = true);
