# Jeffy Commerce — Handoff (pick up here when you return)

_Last updated: this session. Read top to bottom; it's the single source of truth for where the revamp stands._

---

## 1. The business model (locked)

**Import-and-supply distributor network.** Jeffy imports goods from China under its SA importer's code, wholesales to a national network of **independent local distributors** (one per small town / one per suburb), who store stock in their garage and deliver locally (one run a day). Customers order on **jeffy.co.za**; Jeffy **collects all payment centrally** (PayFast) and pays each distributor their cut. Think **"Takealot, but sellers deliver from their garage."**

**The graduation:** new distributors take stock **on credit** (Jeffy-owned until paid); as they build a cash cushion they **buy upfront** and earn bigger margins.

## 2. The legal / tax structure (decided, research-backed)

- **Sellers are independent resellers (buy-sell), NOT employees and NOT commission agents.** They buy stock from Jeffy at a wholesale/trade price and resell at retail, keeping the margin. This is the proven Avon/Tupperware model and is what keeps them legally independent (no PAYE, no minimum wage, no leave).
- **Jeffy collects centrally as the seller's disclosed payment agent** (via PayFast Split Payments, so Jeffy never illegally holds others' money).
- **VAT: register Jeffy.** As an importer, registering lets Jeffy reclaim the 15% import VAT (currently a sunk cost). Sellers are too small to register, so VAT ends cleanly at the wholesale leg.
- **Must be lawyer-blessed before signing sellers:** (1) the reseller agreement establishes genuine independence; (2) the central-collection-as-agent setup is documented so VAT sits only on the wholesale leg; (3) no joining fee, to avoid franchise-law classification (CPA); (4) the Wish List giveaway has CPA competition T&Cs.
- Full detail + sources: `REVAMP_BLUEPRINT_2026.md` and the research in this session.

## 3. What's been BUILT this session (all build-audited on your Mac — `npm run build` ✓)

- **Security:** leaked Supabase service-role key scrubbed from all 7 committed files (verified none remain).
- **Business identity:** real Nedbank EFT details, Jeffy Commerce (Pty) Ltd / Reg 2025/950712/07 / Somerset West on checkout + both invoices + SEO; VAT line removed (not registered); "TAX INVOICE" → "INVOICE".
- **Build fixed:** discovered your Mac's global `NODE_ENV=production` was making npm skip dev deps (Tailwind/PostCSS/TS) so the project couldn't build; fixed — baseline now compiles clean.
- **Data model (Phase B):** distributors, distributor_stock, distributor_ledger, wishlist_grants, landed-cost fields, wholesale price, order routing/split, structured Wish List fields. Types in `src/types/distributor.ts`.
- **Wish List engine (Phase C):** `/admin/wishlist` demand-analysis dashboard (ranks wishes by demand, category, price-willing, top-100 shortlist); structured capture (price / frequency / suburb) wired into the public form + API.
- **Distributor system — intake + admin (Phase D):** `/distributors/join` public signup; `/admin/distributors` approve/suspend + credit-limit; geo-routing helper `findNearestDistributor()`.

Progress log with audit notes per step: `revamp/BUILD_JOURNAL.md`.

## 4. What's NEXT (not yet built)

- **Phase D finish:** ✅ reseller dashboard built (2 Jun 2026) — `src/app/distributors/dashboard/page.tsx` + `src/app/api/distributors/dashboard/route.ts` (stock / balance owed / available credit / today's delivery run / ledger). Login is email/phone lookup for now; **still to do:** gate it behind the site's existing magic-link session, and wire `findNearestDistributor` + the two-tier split into checkout (Phase E).
- **Phase E — Payments:** PayFast Split Payments live; move stock-decrement into the webhook; re-enable webhook IP allowlist; delete the duplicate PayFast impl + fake Ozow.
- **Phase F — Finance dashboard:** replace the mock `/admin/reports` with live revenue / landed COGS / margin / per-distributor ledger.
- **Phase G — Streamline & harden:** remove features that don't fit the model (life-os, OEM research, affiliates, gift cards, loyalty, blog); admin auth → Supabase Auth + roles; RLS review; remove debug endpoints.
- **Phase H — Hygiene:** final cleanup, rewrite README to the real model.

Full plan with audit gates: `revamp/ENGINEERING_ACTION_PLAN.md`.

## 5. What YOU need to do (only you can)

1. **Apply the migration SQL** (in the chat / `revamp/phase2-data-model/`) in Supabase SQL Editor. Additive + safe.
2. **Rotate the Supabase service-role key** (Settings → API) — it was exposed. Then update Vercel env + `.env.local`.
3. **PayFast keys** — Merchant ID, Merchant Key, Passphrase (dashboard → Settings → Integration) → so I can finish payments.
4. **Register Jeffy for VAT**; set up **Xero + Nedbank feed** (scaffolding ready in `revamp/phase1-financial/`).
5. **Attorney**: reseller agreement + Wish List competition T&Cs (brief is the legal section above).
6. **Products come from the Wish List data** — once the campaign runs, the top-100 shortlist drives what you source.

## 6. Verification & deploy process (agreed)

Build features → audit with `npm run build` via Desktop Commander on your Mac → when clean, deploy → physically verify each feature in-browser with Claude-in-Chrome using `revamp/FEATURE_VERIFICATION_PLAN.md`. **Pre-production gate:** clean build + key rotated + migrations applied + PayFast live test + the A–F checklist all green.

## 7. Key files

- `revamp/HANDOFF_RETURN.md` ← this file
- `revamp/BUILD_JOURNAL.md` — step-by-step with audits
- `revamp/ENGINEERING_ACTION_PLAN.md` — the marathon plan + gates
- `revamp/FEATURE_VERIFICATION_PLAN.md` — in-browser test script
- `revamp/phase2-data-model/*.sql` — the migrations
- `JEFFY_GAME_PLAN.md` · `REVAMP_BLUEPRINT_2026.md` · `JEFFY_BUSINESS_INFO.md` · `Jeffy_Financial_Model.xlsx`

## 8. One-line status

Model locked, legal/tax structure decided, data layer + Wish List engine + distributor intake/admin built and compiling clean; nothing deployed. Resume at **Phase D finish → E → F**, gated on you applying the SQL + rotating the key.
