# Engineering Action Plan — reshape platform to the distributor model

My execution plan to polish the platform into the locked model (importer-wholesaler → independent buy-sell resellers → central collection via PayFast split → Wish List demand engine). Marathon build, **audit gate after every phase**, local files only (no deploy), everything reversible.

## Rules I hold myself to
- **Audit every step:** TypeScript typecheck (`tsc --noEmit`) after each change; full `next build` where the sandbox allows; SQL reviewed and additive-only; logic re-read; results logged in `BUILD_JOURNAL.md`.
- **Nothing destructive on the live system:** no deploys, no live-DB schema changes (migrations written as files for you to apply), no feature deletion without a passing typecheck proving nothing broke.
- **Reversible:** work in the repo; removed things go to `revamp/_removed/`, not the bin.

## Phase A — Verification harness (do first)
Get a working `tsc --noEmit` typecheck so every later change is actually audited. Record a baseline of pre-existing errors so I can tell what I introduce vs what was already there. Confirm git is clean so each change is a clean diff.
**Gate:** typecheck runs; baseline recorded.

## Phase B — Data model for buy-sell distributor network
- `products`: landed-cost fields (migration 001) + `wholesale_price_cents`, `retail_price_cents`.
- `distributors` (built on existing zone_partners/suppliers): `credit_limit_cents`, `balance_owed_cents`, `status`, coverage area, location.
- `distributor_ledger`: stock dispatched / sold / owed / paid per distributor.
- `orders`: distributor routing + split fields (reuse existing platform_share / franchise_share).
- `wishlist`: structured fields on the wants table (price_willing, frequency, category, location).
- All as additive migration files + update `types/database.ts`.
**Gate:** typecheck passes; SQL additive-only; reviewed.

## Phase C — Wish List engine (relaunch "wants")
- Structured submission form (product, category, price they'd pay, buy-frequency, location).
- Admin ranking/analysis (top products by demand, price band, region).
- Weekly-winner mechanic + public feed hooks.
**Gate:** typecheck; flow reviewed.

## Phase D — Distributor system
- Onboarding + agreement acceptance + credit limit.
- Distributor dashboard: stock, earnings, balance owed, daily delivery list.
- Geo-routing: order → nearest distributor.
- Admin: distributor management + ledger.
**Gate:** typecheck; flows reviewed.

## Phase E — Payments: PayFast split
- Split logic (Jeffy wholesale cut + seller margin) in checkout/webhook.
- Move stock-decrement into webhook; re-enable webhook IP allowlist; delete duplicate PayFast impl + fake Ozow.
**Gate:** typecheck; signature/split logic reviewed; sandbox test when keys arrive.

## Phase F — Real finance dashboard
- Replace mock `admin/reports` with live data: revenue, landed COGS, gross margin, per-distributor ledger, VAT.
**Gate:** dashboard figures reconcile to DB; typecheck.

## Phase G — Streamline & harden
- Remove features that don't fit (life-os, OEM research, affiliates, gift cards, loyalty, blog, trends, leftover DTC bits) — typecheck after each removal.
- Admin auth → Supabase Auth + roles + rate limiting; remove debug endpoints; deliberate RLS review on money/PII tables.
**Gate:** build green; route/component count down ~60–70%; RLS verified.

## Phase H — Hygiene & docs
- Final cleanup; rewrite README to the real model; one host config.
**Gate:** clean git status; green build.

## Gated on you (I can't do these)
VAT registration · attorney agreements (reseller + competition T&Cs) · PayFast live keys · Xero account + Nedbank feed · applying migrations to the live database · sourcing/product decisions (these come from the Wish List data).

## Order of attack
A → B → C (Wish List first, since demand data leads everything) → D → E → F → G → H.
