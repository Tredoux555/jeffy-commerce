# Phase 2 — Profit calculation fix

## Done now (safe, forward-compatible)
`src/app/api/checkout/route.ts` now computes order cost from **`landed_cost_cents` with a fallback** to the legacy `cost_price_cents`:
```ts
const unitCost = product.landed_cost_cents ?? product.cost_price_cents ?? 0;
```
- Safe before the migration: if the column doesn't exist on the row, it's `undefined` and the old value is used. No runtime error.
- After migration + backfill: profit automatically reflects true landed COGS.

## Pending (apply AFTER 001 migration is live)
Add the landed snapshot to the `order_items` insert (currently NOT added, because inserting an unknown column would fail):
```ts
// in orderItems.push({ ... }) add:
landed_unit_cost_cents: product.landed_cost_cents ?? null,
```

## Still fictional until backfilled
Every product's `landed_cost_cents` is null until you enter real numbers (HS code, duty, freight, FX) via `Jeffy_Financial_Model.xlsx` and run the backfill UPDATEs. Until then, profit figures fall back to the old (understated-cost, overstated-profit) basis. **Treat profit as provisional until backfill is complete.**

## Note for Phase 6
The 50/50 `franchise_share_cents` / `platform_share_cents` split is a leftover from the zone-partner model being retired. Once single-operator is confirmed, simplify: drop the split, keep a single `profit_cents`.
