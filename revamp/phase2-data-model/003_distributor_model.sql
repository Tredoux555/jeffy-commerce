-- Phase B migration: buy-sell distributor network model
-- STATUS: PREPARED, NOT YET APPLIED. Additive + IF NOT EXISTS only — no data loss, non-breaking.
-- Apply in Supabase SQL Editor after the service-role key is rotated. Safe to run more than once.

-- 1. Products: wholesale price (retail = existing selling_price_cents) --------
ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesale_price_cents integer; -- price Jeffy charges a distributor

-- 2. Distributors: independent sole-proprietor resellers ---------------------
CREATE TABLE IF NOT EXISTS distributors (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid REFERENCES users(id) ON DELETE SET NULL,
  business_name      text,
  owner_name         text NOT NULL,
  phone              text NOT NULL,
  email              text,
  -- independence / tax (they are their own business)
  sole_prop_registered boolean DEFAULT false,
  tax_number         text,
  agreement_signed_at  timestamptz,
  -- location & coverage (one town / one suburb)
  address            text,
  suburb             text,
  city               text,
  province           text,
  postal_code        text,
  latitude           numeric,
  longitude          numeric,
  coverage_area      text,
  -- commercial terms
  status             text DEFAULT 'pending'      CHECK (status IN ('pending','active','suspended','terminated')),
  phase              text DEFAULT 'consignment'  CHECK (phase IN ('consignment','buy_upfront')),
  credit_limit_cents   integer DEFAULT 0,
  balance_owed_cents   integer DEFAULT 0,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_distributors_status   ON distributors(status);
CREATE INDEX IF NOT EXISTS idx_distributors_location ON distributors(latitude, longitude);

-- 3. Distributor stock-on-hand (per product) --------------------------------
CREATE TABLE IF NOT EXISTS distributor_stock (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id       uuid NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  product_id           uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty_on_hand          integer DEFAULT 0,
  qty_dispatched_total integer DEFAULT 0,
  qty_sold_total       integer DEFAULT 0,
  unit_wholesale_cents integer NOT NULL,         -- amount owed to Jeffy per unit held
  updated_at           timestamptz DEFAULT now(),
  UNIQUE (distributor_id, product_id)
);

-- 4. Distributor ledger (money + stock audit trail) -------------------------
CREATE TABLE IF NOT EXISTS distributor_ledger (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id     uuid NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  entry_type         text NOT NULL CHECK (entry_type IN ('stock_dispatch','sale','payment','adjustment','return')),
  product_id         uuid REFERENCES products(id) ON DELETE SET NULL,
  order_id           uuid REFERENCES orders(id) ON DELETE SET NULL,
  quantity           integer DEFAULT 0,
  amount_cents       integer NOT NULL DEFAULT 0,  -- +increases owed (dispatch); -reduces owed (sale settlement / payment)
  balance_after_cents integer,                    -- running balance owed after this entry
  note               text,
  created_at         timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dist_ledger_distributor ON distributor_ledger(distributor_id);
CREATE INDEX IF NOT EXISTS idx_dist_ledger_order       ON distributor_ledger(order_id);

-- 5. Orders: route to a distributor + the split ------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS distributor_id        uuid REFERENCES distributors(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS jeffy_wholesale_cents integer; -- Jeffy's share (settles stock owed)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_margin_cents   integer; -- distributor's margin

-- 6. Wish List: structured demand capture on the existing wants table --------
ALTER TABLE wants ADD COLUMN IF NOT EXISTS price_willing_cents integer; -- what the requester would pay
ALTER TABLE wants ADD COLUMN IF NOT EXISTS buy_frequency       text;    -- 'once' | 'monthly' | 'weekly'
ALTER TABLE wants ADD COLUMN IF NOT EXISTS latitude            numeric;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS longitude           numeric;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS suburb              text;
ALTER TABLE wants ADD COLUMN IF NOT EXISTS wishlist_rank       integer; -- computed demand rank

-- 7. Wish List weekly winners ------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlist_grants (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  want_id     uuid REFERENCES wants(id) ON DELETE SET NULL,
  user_id     uuid REFERENCES users(id) ON DELETE SET NULL,
  prize_note  text,
  is_public   boolean DEFAULT true,
  granted_at  timestamptz DEFAULT now()
);

-- NOTE: enable RLS + policies on the new tables before going live (deliberate, in the security phase).
