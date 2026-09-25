-- Migration 006: CLEAR ALL PRODUCTS (fresh start before Wish List sourcing)
-- ⚠️ DESTRUCTIVE. Run in the Supabase SQL Editor. BACK UP FIRST
--    (Supabase → Database → Backups, or export the products table).
--
-- WHY: you're resetting the catalogue so products come from real Wish List demand,
-- not the old 1688 test imports.
--
-- WHAT THIS CLEARS:
--   • every row in `products`
--   • everything that references a product via ON DELETE CASCADE — i.e. order_items,
--     distributor_stock, product reviews / Q&A / questions, bundles, flash sales,
--     inventory rows, restock + stock notifications, and wishlist→product links.
-- WHAT IT KEEPS:
--   • orders (the order shells remain; their line items are cleared)
--   • distributors / resellers, their ledger + balances
--   • wants / Wish List demand entries and votes, wishlist_grants (winners)
--   • categories, customers, settings

-- ── STEP 1: PREVIEW — run this first to see what you're about to remove ──────────
SELECT
  (SELECT count(*) FROM products)          AS products,
  (SELECT count(*) FROM order_items)       AS order_items,
  (SELECT count(*) FROM distributor_stock) AS distributor_stock;

-- ── STEP 2: THE WIPE — run this once you're happy with the preview ──────────────
-- TRUNCATE ... CASCADE removes products AND every row in any table that has a
-- foreign key to products, in one safe statement (no FK errors, no leftovers).
TRUNCATE TABLE products CASCADE;

-- ── STEP 3 (OPTIONAL): also clear the test ORDER shells left behind ─────────────
-- Uncomment if you want a totally clean order history too. Leaves customers intact.
-- TRUNCATE TABLE orders CASCADE;

-- ── STEP 4: VERIFY — should all be 0 ────────────────────────────────────────────
SELECT
  (SELECT count(*) FROM products)          AS products,
  (SELECT count(*) FROM order_items)       AS order_items,
  (SELECT count(*) FROM distributor_stock) AS distributor_stock;
