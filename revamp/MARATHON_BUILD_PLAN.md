# 🏗️ Jeffy Marathon Build Plan

> Structured build to close the gaps between the **business plan**, the **locked model** (`JEFFY_PROGRAM.md` §3), and the **live platform**.
> Created 3 June 2026. Execution: **Claude writes code + migrations → you review, run migrations on Supabase, deploy.**
>
> **BUILD STATUS (3 June 2026):** Phases 0–7 code-complete and type-checked clean (`tsc --noEmit`, 0 errors). Workstreams B (compliance tracker) and C (doc sync) done. **You do next:** run migrations `004_payouts_and_dedupe.sql` + `005_rls_policies.sql` in Supabase → set wholesale prices at `/admin/wholesale` → enable PayFast Split + capture seller merchant IDs → `npm run build` on the Mac → verify per `FEATURE_VERIFICATION_PLAN.md`.

---

## 0. Locked decisions (drive everything below)

| Decision | Choice | Implication |
|---|---|---|
| **Collection** | Central, on jeffy.co.za, as the seller's **disclosed payment agent** | Jeffy collects retail; keeps its wholesale cut; seller gets the margin |
| **Payout mechanism** | **Real-time PayFast Split Payments** (primary) + **ledger-credit fallback** | Seller's margin splits to their PayFast merchant account in real time; if a seller isn't PayFast-enabled yet, margin accrues as a withdrawable ledger credit |
| **Wish List** | **Demand signal + weekly random draw** | Keep votes/"agrees" as the internal sourcing signal; run a public weekly random draw as the giveaway (CPA s36 compliant) |
| **Scope** | Code + compliance tracker + plan/doc sync | Three workstreams (A/B/C below) |
| **VAT** | Build behind a `VAT_REGISTERED` flag | Activates 15% output-VAT handling the day Jeffy registers |

**Reconciliation notes found in the docs (must action):**
- `HOW_JEFFY_WORKS.md` is **stale** (old zone-partner 50% profit-share, schools, "first requester free"). Archive/rewrite.
- The PayFast webhook still calls the old `/api/orders/auto-assign` (zone-partner) on **every** paid order, alongside the new distributor settlement. **Both models fire at once — remove the old path.**
- The live webhook settles the seller's *debt* (`balance_owed -= wholesale`) but **never pays the seller's margin**. That missing half is Phase 1.

---

## 1. How the money flows (target design)

```
Seller holds stock ON CREDIT  →  balance_owed += wholesale (ledger: stock_dispatch)
Customer orders on jeffy.co.za, pays retail R
        │
        ├─ PayFast SPLIT: seller_margin (R − wholesale) → seller's PayFast merchant   [real time]
        │                  remainder (wholesale)        → Jeffy
        │
        └─ Webhook on COMPLETE:
             • balance_owed -= wholesale        (ledger: sale)  ← seller's debt for that unit cleared
             • distributor_stock -= qty
             • record split_to_merchant_id / split_amount on the order
Fallback (seller has no PayFast merchant id): margin accrues as margin_payable_cents (withdrawable / offsets next stock order)
```

Net effect = the seller keeps their retail margin and their stock debt is cleared by the sale — exactly the locked buy-sell model, executed in real time.

---

## 2. Workstream A — Platform code (phased)

Each phase ends with `npm run build` clean. ☐ = to build · 🧑 = needs you.

### Phase 0 — De-conflict & foundations *(do first; pure correctness)*
- ☐ Stop the webhook calling `/api/orders/auto-assign`; remove zone-partner branch from the paid-order path.
- ☐ Checkout writes **only** `distributor_id` (drop `franchise_id` / `zone_id` writes).
- ☐ Retire old model: `/partner*`, `/zone-partner(s)`, `/api/partner`, `/api/zone-partners`, `/admin/partners`, the 50/50 earnings logic, the duplicate PayFast impl + fake Ozow (flagged in `JEFFY_PROGRAM.md` §6 E).
- ☐ **Migration 004** (additive): `distributors.payfast_merchant_id`, `distributors.margin_payable_cents`; `orders.split_to_merchant_id`, `orders.split_amount_cents`; guard fields for wholesale validation.
- ☐ Wholesale-price guard: a product can't be sold without `wholesale_price_cents`; add an admin bulk-set/validate screen.
- 🧑 Run migration 004 in Supabase; confirm old partner routes are unused by the frontend before deletion.
- **Done when:** only the distributor model runs end-to-end; no order touches zone-partner code; every sellable product has a wholesale price.

### Phase 1 — The money model (PayFast Split + credit integrity)
- ☐ Configure **PayFast Split Payments** at checkout: route `seller_margin_cents` → routed seller's `payfast_merchant_id`, remainder → Jeffy; store the split on the order.
- ☐ **Fallback:** no merchant id → accrue `margin_payable_cents` (ledger credit) + flag seller for PayFast onboarding.
- ☐ Keep/confirm webhook debt-settlement (already built) — scope it to the distributor model only.
- ☐ **Enforce credit limit** at routing/checkout for `consignment`-phase sellers: block/reroute if the dispatch would exceed `available_credit`.
- 🧑 Create a PayFast split/marketplace integration + passphrase; seed 1–2 test seller merchant IDs.
- **Done when:** a sandbox order splits the margin to the seller in real time, clears their debt, and respects their credit limit.

### Phase 2 — Stock-aware routing
- ☐ `findNearestDistributor`: require **stock on hand** for each line + `active` + within coverage; fallback chain: next-nearest-with-stock → Jeffy-direct/hold → admin queue; return a reason when none.
- **Done when:** orders never route to an out-of-stock or out-of-area seller; unroutable orders queue cleanly.

### Phase 3 — Seller dashboard frontend
- ☐ Build the React page over the existing `/api/distributors/dashboard`: summary cards (units on hand, balance owed, available credit, margin earned/payable), stock table, ledger, today's deliveries; PayFast-link status; low-stock / over-credit flags.
- **Done when:** a seller can log in (magic link) and see stock, money, and history without support.

### Phase 4 — Wish List weekly draw + rules
- ☐ `/api/cron/wishlist-draw`: auditable random pick from eligible wants → insert `wishlist_grants` → notify winner → mark public. Keep votes/"agrees" feeding `wishlist_rank` (sourcing signal).
- ☐ Public **Wish List Rules** page (CPA s36: no purchase, published rules, record-keeping).
- ☐ Remove any "first requester gets it free" logic (superseded by the draw).
- 🧑 Decide draw cadence/day; lodge competition rules with the National Consumer Commission.
- **Done when:** a weekly winner is drawn automatically, recorded, announced, and the rules are published.

### Phase 5 — VAT correctness *(behind `VAT_REGISTERED` flag)*
- ☐ Checkout computes 15% output VAT, stores price VAT-consistently, shows the line; distinguishes B2C sale vs B2B seller restock; finance dashboard reflects VAT.
- 🧑 Register Jeffy for VAT; flip the flag on registration.
- **Done when:** with the flag on, every invoice and the finance dashboard are VAT-correct.

### Phase 6 — Returns (reseller flow)
- ☐ Return request → admin approval → ledger `return` entry (reverse the split: reclaim margin/credit, restore stock, adjust balances), on the existing `return_requests` schema.
- **Done when:** a returned order correctly unwinds money + stock for both Jeffy and the seller.

### Phase 7 — Verify & harden
- ☐ Link orders to a real customer record (remove the guest `user_id` placeholder) — repeat-purchase + POPIA.
- ☐ Enable **RLS** + policies on the new tables (deferred from the data-model phase).
- ☐ `npm run build` clean; run `revamp/FEATURE_VERIFICATION_PLAN.md`; smoke-test the split in PayFast sandbox.
- **Done when:** the full buy-sell flow passes end-to-end and the build is clean.

---

## 3. Workstream B — Compliance tracker *(for your attorney / accountant / broker)*

| Item | Owner | Why | Platform link |
|---|---|---|---|
| Reseller agreement (buy-sell independence, retention of title, non-exclusive, **non-circumvention**, disclosed-agent collection, storage/security duties) | Attorney | Holds the buy-sell structure; prevents mis-classification & disintermediation | `distributors.agreement_signed_at` |
| Disclosed-agent + VAT treatment of central collection | Accountant | Confirms Jeffy isn't the retailer (VAT on R249) and may hold split funds | Phase 1 / Phase 5 |
| POPIA: consent + operator agreements + privacy policy + data-minimisation to sellers | Attorney | Sharing customer data with independent sellers | Phase 7 (customer records) |
| Wish List competition rules (CPA s36) + NCC lodging | Attorney | A weekly prize draw is a regulated promotional competition | Phase 4 rules page |
| Insurance: stock-at-various-premises + goods-in-transit + product liability | Broker | Stock lives at sellers' homes; importer CPA s61 exposure | Per-seller credit cap = loss cap |
| VAT registration | Accountant | Whole unit-economics assume recovered import VAT | Phase 5 flag |
| Zoning guidance for sellers (home-occupation limits) | You / town planner | Sellers store & dispatch from home | Seller onboarding checklist |
| PayFast merchant onboarding for sellers (bank + KYC) | You | Required for real-time split payout | Phase 1 fallback covers gaps |

---

## 4. Workstream C — Plan & internal-doc sync
- ☐ Business plan PDFs (EN + ZH): "PayFast splits in real time" is now **accurate** — keep; confirm disclosed-agent + VAT wording is consistent. (Stock/insurance + visa already added.)
- ☐ Rewrite/replace stale `HOW_JEFFY_WORKS.md` to the current buy-sell model.
- ☐ Keep `JEFFY_PROGRAM.md` §6 build-status table updated as phases complete.

---

## 5. Suggested marathon order
**0 → 1 → 2 → 3 → 4 → 5 → 6 → 7**, with Workstream B handed to advisors in parallel and Workstream C done as the code lands. Phases 0–3 are the go-live core; 4–7 complete the model.

*Keep this file current at the end of each block.*
