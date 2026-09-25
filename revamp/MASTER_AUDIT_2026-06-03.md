# 🔍 Master Audit — Platform vs Business Plan (3 June 2026)

Audited against `investor-pack/Jeffy_Business_Plan_2026.pdf` (12-page version) after the marathon build.
Type-check: `tsc --noEmit` → **0 errors** at every phase. Full `next build` to be run on the Mac.

## Plan promise → platform status

| # | Business-plan promise | Platform status | Evidence / notes |
|---|------------------------|-----------------|------------------|
| 1 | Import direct under SARS customs code | ✓ business identity in place | not a platform feature |
| 2 | Wholesale to resellers; **two-tier margin** | ✅ Built | `computeSplit`, `jeffy_wholesale_cents`/`seller_margin_cents`; `/admin/wholesale` guard; credit-checked `/api/admin/distributors/dispatch` |
| 3 | Resellers deliver; **PayFast splits each sale in real time** | ✅ Built (+ fallback) | `setup.split_payment` in `/api/checkout`; ledger-credit fallback in webhook. **Needs:** enable PayFast Split + capture `payfast_merchant_id` per seller |
| 4 | **Wish List** guides sourcing + **weekly random draw** | ✅ Built | votes = sourcing signal; `/api/cron/wishlist-draw` (auditable random); `/wish-list-rules` (CPA s36). **Needs:** cron schedule + NCC lodging |
| 5 | **Credit + graduation** (retention of title) | ✅ Built | credit limit enforced at dispatch; `phase` consignment/buy_upfront; dashboard shows balance/credit. Auto-graduation = admin action (minor) |
| 6 | Geo-routing to nearest reseller | ✅ Built + improved | `routeOrder` now **stock-aware** with fallback chain + `routing_status` |
| 7 | Finance dashboard (revenue, landed COGS, margin, AOV, reseller balances) | ✅ Built | `/admin/finance` (live) + VAT line added |
| 8 | **VAT** registration; ends at wholesale leg | ✅ Built behind flag | `src/lib/vat.ts` + `VAT_REGISTERED`; output VAT recorded on wholesale leg. **Needs:** register + flip flag |
| 9 | Stock / insurance / zoning / product liability | ◐ Compliance tracker | `revamp/COMPLIANCE_TRACKER.md`; per-reseller credit cap = loss cap |
| 10 | **One seller model** — franchise retired | ✅ Live path clean | webhook auto-assign removed; checkout writes only `distributor_id`. Old route **files** still present (disconnected) — physical delete is a hygiene pass |
| 11 | Customer identity / POPIA | ✅ Built | order `customer_email/name/phone`; best-effort user link |
| 12 | Returns / reverse logistics | ✅ Built | `/api/admin/returns/process` reverses stock + debt + margin, writes ledger 'return' + RMA |
| 13 | Security (RLS) | ◐ Migration ready | `005_rls_policies.sql` — apply in Supabase |

## What YOU must do to go live (in order)
1. Run migrations `004_payouts_and_dedupe.sql` then `005_rls_policies.sql` in Supabase.
2. Set wholesale prices at `/admin/wholesale` (banner shows any missing).
3. Enable PayFast **Split Payments** on the merchant account; capture each seller's `payfast_merchant_id`.
4. Register for VAT → set `VAT_REGISTERED=true`. Add `CRON_SECRET` + schedule the weekly draw.
5. `npm run build` on the Mac → deploy → verify per `FEATURE_VERIFICATION_PLAN.md` (incl. a PayFast **sandbox** split test).
6. Clear the compliance tracker items 1–3 with attorney + accountant before signing resellers.

## Residuals — update 4 June 2026
- ✅ Old `/partner` & `/zone-partner` files **DELETED** (cluster removed; public links + admin nav repointed to the reseller funnel; `tsc --noEmit` = 0; no dangling links/fetches).
- ✅ Auto-graduation **automated** (`maybeGraduate`; triggers after settled sale + on repayment; thresholds env-tunable).
- ✅ Winner + low-stock **notifications wired** (best-effort email + wa.me link; no-op without `RESEND_API_KEY`).
- ✅ Customer-facing **returns UI** built (`/returns` + `/api/returns/request`); admin process route now reads the real `customer_email`.
- ✅ **VAT card** rendered on `/admin/finance`.
- ☐ Still open: a real-time PayFast split + the disclosed-agent/VAT treatment need live testing and accountant sign-off; full `next build` to be run on the Mac (sandbox couldn't complete it — `tsc` is clean); wider off-model hygiene (life-os, oem-research, blog, loyalty, gift cards, debug endpoints) not started; optional record-payment button on `/admin/distributors`.
