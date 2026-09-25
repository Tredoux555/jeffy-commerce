-- Migration 004: real-time PayFast Split payout + ledger margin-credit support
-- STATUS: PREPARED, NOT YET APPLIED. Additive + IF NOT EXISTS only — no data loss, non-breaking.
-- Apply in the Supabase SQL Editor after 001 + 003. Safe to run more than once.

-- 1. Distributors: PayFast merchant id (real-time split) + margin-payable fallback ----
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS payfast_merchant_id text;        -- seller's PayFast merchant id for real-time split
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS margin_payable_cents integer DEFAULT 0; -- margin owed to seller when not PayFast-enabled (withdrawable / offsets next stock)

-- 2. Orders: record the real-time split actually applied --------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS split_to_merchant_id text;   -- seller PayFast merchant the margin was split to (null = fallback used)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS split_amount_cents   integer; -- amount split to the seller (their margin)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS routing_status       text;    -- 'routed' | 'none_with_stock' | 'no_active_distributors' | 'no_location'
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vat_cents            integer; -- Jeffy output VAT on the wholesale leg (when VAT-registered)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS net_wholesale_cents  integer; -- wholesale leg net of VAT

-- 4. Orders: capture the customer identity (POPIA + repeat-purchase) -----------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone text;

-- 3. Ledger: allow margin-credit (Jeffy owes seller) + payout entry types ---------
ALTER TABLE distributor_ledger DROP CONSTRAINT IF EXISTS distributor_ledger_entry_type_check;
ALTER TABLE distributor_ledger ADD CONSTRAINT distributor_ledger_entry_type_check
  CHECK (entry_type IN ('stock_dispatch','sale','payment','adjustment','return','margin_credit','payout'));

-- NOTE: enable RLS + policies on the new columns/tables before going live (security phase).
