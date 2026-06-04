// Distributor (buy-sell) network model types.
// Mirrors revamp/phase2-data-model/003_distributor_model.sql.
// Standalone module (additive) — does not modify the generated database.ts.

export type DistributorStatus = 'pending' | 'active' | 'suspended' | 'terminated';
export type DistributorPhase = 'consignment' | 'buy_upfront';

export interface Distributor {
  id: string;
  user_id: string | null;
  business_name: string | null;
  owner_name: string;
  phone: string;
  email: string | null;
  sole_prop_registered: boolean;
  tax_number: string | null;
  agreement_signed_at: string | null;
  address: string | null;
  suburb: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  coverage_area: string | null;
  status: DistributorStatus;
  phase: DistributorPhase;
  credit_limit_cents: number;
  balance_owed_cents: number;
  payfast_merchant_id: string | null;   // seller's PayFast merchant id (real-time split)
  margin_payable_cents: number;          // margin owed to seller when not PayFast-enabled
  created_at: string;
  updated_at: string;
}

export interface DistributorStock {
  id: string;
  distributor_id: string;
  product_id: string;
  qty_on_hand: number;
  qty_dispatched_total: number;
  qty_sold_total: number;
  unit_wholesale_cents: number;
  updated_at: string;
}

export type LedgerEntryType =
  | 'stock_dispatch'
  | 'sale'
  | 'payment'
  | 'adjustment'
  | 'return';

export interface DistributorLedgerEntry {
  id: string;
  distributor_id: string;
  entry_type: LedgerEntryType;
  product_id: string | null;
  order_id: string | null;
  quantity: number;
  amount_cents: number;
  balance_after_cents: number | null;
  note: string | null;
  created_at: string;
}

export type BuyFrequency = 'once' | 'monthly' | 'weekly';

// Structured Wish List fields layered onto the existing `wants` row.
export interface WishlistFields {
  price_willing_cents: number | null;
  buy_frequency: BuyFrequency | null;
  latitude: number | null;
  longitude: number | null;
  suburb: string | null;
  wishlist_rank: number | null;
}

export interface WishlistGrant {
  id: string;
  want_id: string | null;
  user_id: string | null;
  prize_note: string | null;
  is_public: boolean;
  granted_at: string;
}

// Helper: compute the two-tier split for an order line.
export function computeSplit(retailCents: number, wholesaleCents: number) {
  const jeffyWholesaleCents = Math.min(wholesaleCents, retailCents);
  const sellerMarginCents = Math.max(retailCents - wholesaleCents, 0);
  return { jeffyWholesaleCents, sellerMarginCents };
}
