# 🔄 SESSION HANDOFF — pick up here

**Last session:** 4 June 2026 (late) · **Status: LIVE on jeffy.co.za.** Migrations 004+005 applied, products wiped, the whole build deployed via Railway (service `jeffy-commerce` / project `eloquent-harmony`, GitHub auto-deploy from `main`). `tsc --noEmit` = 0.
**Deploy = `git push origin main` via Desktop Commander on the Mac (SSH remote). Railway auto-builds. DB ops = Supabase SQL editor via Chrome.**
**Master context:** read `JEFFY_PROGRAM.md` first, then this file.

## ✅ LATEST SESSION (4 Jun, live ops + Wish List conversion)
- **Went live:** ran `products_backup_20260604` snapshot (166 rows kept) → `TRUNCATE products CASCADE` (catalogue now empty, fresh start) → applied migrations **004 + 005** in Supabase. Deployed everything. Verified live: `/admin/campaign`, `/admin/finance` (VAT card), `/returns`, old `/partner` → 404.
- **Wish List draw is on-demand:** removed the scheduler idea; a **"Draw a winner"** button on `/admin/campaign` runs `POST /api/admin/wishlist/draw` (shared logic in `src/lib/wishlist/draw.ts`). No cron needed. `CRON_SECRET` already set in Railway.
- **PUBLIC WISH LIST CONVERSION (big one):** the public funnel was still the OLD "Wants" model ("get 10 agrees = free product" + CPA risk). Converted the ENTIRE customer-facing surface to the locked model (your wish = demand signal; **one wish granted free each month via random draw**) while keeping the beautiful graphics. Touched: `/wants` funnel, both share/detail pages (`/want/[id]`, `/wants/[shareCode]`), `/wants/explore`, `/wants/my`, `/my-wants`, `/wants/what-is-this`, `/wants/verify`, **FAQ**, homepage, about, vision, login, contact, coming-soon, **root SEO metadata + OG images**, and the **wish-creation confirmation email**. Retired 2 duplicate create flows (`/wants/create`, `/wants/new` → redirect to `/wants`) which **fixed the 500** (raw base64 image through a server action). Audit grep = clean of "guaranteed free / 10 = free" on customer pages.
- **PayFast:** drafted (in Gmail, unsent) a reply to **Jessica Naicker @ Network International** (jessica.naicker@network.global) — the warm lead who followed up 13 May. PayFast is now "Payfast by Network." The old brick wall was the application form (ticket #1601666) before the company/address/bank were finalised — now resolved.
- **Campaign content:** `/admin/campaign` now also holds the **manager advert** (student/side-hustle), **trial brief**, and **launch script pack** (launch film + WhatsApp auto-replies + consent script). Docs: `docs/JEFFY_CAMPAIGN_*.md`, `docs/RUNBOOK_wishlist_finance_products.md`.

## ⏭️ WHAT'S LEFT FOR THE NEW BUSINESS MODEL (do next)
**Email (your step):** add `RESEND_API_KEY` in Railway (jeffy-commerce → Variables) so wish-confirmation, winner, return & low-stock emails actually send — they're all wired but no-op until the key is set. Confirm `jeffy.co.za` is **Verified** in Resend → Domains. (Rotate the key that was exposed in a screenshot.)
**Payments (your step):** send the Jessica/Network draft → complete the PayFast merchant + **Split Payments** application; capture each reseller's `payfast_merchant_id`. Set `PAYFAST_SANDBOX=false`, `PAYFAST_ENFORCE_IP=true`, real keys when live.
**Wish List go-live:** lodge the competition (draw) rules with the **NCC** before promoting; the public draw rules page is `/wish-list-rules`.
**Campaign Step 1:** hire the SA student/side-hustle campaign manager (advert ready in `/admin/campaign`), set the pay figure, post to university channels.
**Catalogue:** products are empty — add real products from Wish List demand, then set wholesale prices at `/admin/wholesale` (margin/finance need this).
**Compliance (attorney + accountant):** reseller agreement (independence, retention of title, non-exclusive); disclosed-agent + VAT treatment; **rewrite `/wants/terms`** to proper Wish List CPA T&Cs (currently flagged with a banner pointing to `/wish-list-rules`); VAT registration → set `VAT_REGISTERED=true`.
**Residual cleanup (mine, low priority):** internal admin templates (`admin/launch`, `launch-playbook`, `outreach`) still say "10 = free / Zone Partners 50%" — not customer-facing but the outreach copy goes to influencers; remove the "fake Ozow" option from live checkout; admin → Supabase Auth + roles.

## WHAT WAS BUILT THIS SESSION (4 June — residuals + cleanup, all tsc-clean)
- **VAT card** now renders on `/admin/finance` (was returned by the API but not shown) — shows output VAT 30d/all-time when `VAT_REGISTERED=true`, else a "not registered yet" hint.
- **Customer-facing returns**: new public page **`/returns`** + endpoint `POST /api/returns/request` — customer enters order number + the email used on the order; we verify the match and log a **pending** return (real customer email captured). Admin still approves/reverses via `/api/admin/returns/process` (now reads the real `customer_email` off the order instead of the placeholder).
- **Auto-graduation**: new `src/lib/distributors/graduation.ts` (`maybeGraduate`) promotes a seller consignment→buy_upfront once debt is cleared **and** they pass volume/value thresholds (`GRAD_MIN_SALES`=10, `GRAD_MIN_SALES_CENTS`=500000, env-tunable). Triggered after each settled sale (PayFast webhook) and on a recorded repayment.
- **Seller repayment endpoint**: new `POST /api/admin/distributors/payment` — records a repayment, reduces balance, writes a `payment` ledger entry, re-checks graduation. (Completes the money loop.)
- **Notifications**: new `src/lib/notify/send.ts` (Resend email + wa.me link helper, **no-op safe without keys**). Wish List **draw winner** is now emailed + a click-to-chat WhatsApp link is returned by `/api/cron/wishlist-draw`. **Low-stock** nudge: new `src/lib/distributors/low-stock.ts` flags/ emails a seller when stock-on-hand ≤ `LOW_STOCK_THRESHOLD` (default 3) after a sale.
- **Wishlist Campaign folded into admin**: new **`/admin/campaign`** action-plan dashboard (one-line strategy, the mechanic, budget scenarios A/B, 12-month roadmap, the dignity ethics rules, and a browser-saved "immediate next actions" checklist) + Growth-section nav link; admin dashboard "Marketing" quick-link now points here. Canonical source docs: `docs/JEFFY_WISHLIST_CAMPAIGN.md` + `docs/JEFFY_CAMPAIGN_MANAGER_HIRING.md`. **Step 1 = hire the SA-based campaign/social manager.**
- **Phase G/0 cleanup (off-model + dead code removed, tsc-clean)**: deleted `admin/life-os`, `admin/oem-research` (+ its API), `admin/commissions`, `admin/advertisements`, `blog`, the dead `api/orders/auto-assign` (old zone-partner assignment), debug/test endpoints (`api/debug`, `api/e2e-test`, `api/test-email`, `api/admin/test-ai`), orphaned components (`loyalty-card`, `partner-earnings-dashboard`) + their libs (`loyalty-store`, `commission-service`) + `lib/testing`. Cleaned the admin nav + unused icon imports. **Deliberately LEFT (need a full `next build` to remove safely):** the "fake Ozow" option in the **live checkout** (type + API branch + radio), `/api/checkout/test` (used by the `/health` diagnostic), and the harmless `zone_id/franchise_id: null` writes in checkout.
- **Legacy model removed**: deleted the old franchise/zone-partner cluster — `app/partner`, `app/zone-partner`, `app/zone-partners`, `app/zp-add`, `api/partner`, `api/zone-partners`, `admin/partners`, `components/partner`. Repointed every public link (homepage hero/footer, coming-soon, wants, wants/what-is-this, vision) and the admin nav to the live reseller funnel (`/distributors/join`, `/admin/distributors`, `/admin/wholesale`, `/admin/finance`). `tsc --noEmit` = 0 after deletion; zero dangling links/fetches remain.
  - **Note:** some homepage **body copy** still says "Zone Partner" (e.g. the hero subhead, vision page). These are wording-only, not broken links — left for you to reword in Jeffy's voice.

---

## WHERE WE ARE RIGHT NOW (the live thread)
The reseller platform was built out to match the business plan. All the code is written and type-checks clean. The remaining work is **mostly yours** (apply migrations + go-live config), then verify. Full mapping in `revamp/MASTER_AUDIT_2026-06-03.md`.

## WHAT WAS BUILT THIS SESSION — the marathon (code-complete, tsc clean, NOT deployed)
- **Phase 0 — De-conflict:** removed old zone-partner auto-assign from the live path; checkout writes only `distributor_id`; new `/admin/wholesale` price tool. Migration `004`.
- **Phase 1 — Money model:** real-time **PayFast Split** at checkout (margin → seller's PayFast merchant) + **ledger-credit fallback**; credit-enforced **stock-dispatch** endpoint `POST /api/admin/distributors/dispatch`.
- **Phase 2 — Routing:** `routeOrder` is **stock-aware** with fallback chain + `routing_status`.
- **Phase 3 — Dashboard:** enhanced existing seller dashboard (margin earned, PayFast-link status, low-stock flags).
- **Phase 4 — Wish List:** weekly random **draw** cron `/api/cron/wishlist-draw` + CPA s36 **`/wish-list-rules`** page; votes remain the sourcing signal.
- **Phase 5 — VAT:** flagged layer `src/lib/vat.ts` (`VAT_REGISTERED`); output VAT on the wholesale leg, shown in finance.
- **Phase 6 — Returns:** `POST /api/admin/returns/process` reverses stock + debt + margin, writes ledger 'return' + RMA.
- **Phase 7 — Harden:** orders capture `customer_email/name/phone` (POPIA, repeat-purchase); RLS migration `005`.
- **Docs:** `revamp/COMPLIANCE_TRACKER.md` (new), `HOW_JEFFY_WORKS.md` (rewritten to buy-sell), `revamp/MARATHON_BUILD_PLAN.md`, `revamp/MASTER_AUDIT_2026-06-03.md`.

## ⏭️ NEXT STEPS — YOU do these, in order
1. **Apply migrations in Supabase SQL editor:** `revamp/phase2-data-model/004_payouts_and_dedupe.sql`, then `005_rls_policies.sql`.
2. **Set wholesale prices** at `/admin/wholesale` (banner flags any missing).
3. **Enable PayFast Split Payments** on the merchant account; capture each seller's `payfast_merchant_id` (fallback covers sellers without one).
4. **Register for VAT** → set env `VAT_REGISTERED=true`. Add `CRON_SECRET` and schedule the weekly draw (Vercel Cron → `/api/cron/wishlist-draw`).
5. **`npm run build` on the Mac** → deploy → verify per `revamp/FEATURE_VERIFICATION_PLAN.md`, incl. a **PayFast sandbox split** test.
6. **Compliance:** clear items 1–3 in `revamp/COMPLIANCE_TRACKER.md` (reseller agreement, disclosed-agent/VAT) with attorney + accountant **before signing resellers**.

## ⚠️ Pre-existing go-live items still open (from before the marathon)
- Rotate the exposed Supabase **service-role key** → update Vercel env + `.env.local`, then redeploy.
- Set `PAYFAST_SANDBOX=false` + `PAYFAST_ENFORCE_IP=true` + real PayFast keys when going live.
- `RESEND_API_KEY` for reseller login emails (optional for testing).

## BACKLOG / RESIDUALS
- ✅ ~~Delete old `/partner` & `/zone-partner` route files~~ — **DONE** (4 Jun, cluster removed, links repointed, tsc clean).
- ✅ ~~Auto-graduation~~ — **DONE** (`maybeGraduate`, automatic; admin toggle still works too).
- ✅ ~~Winner / low-stock notifications~~ — **DONE** (best-effort email + wa.me link; no-op without `RESEND_API_KEY`).
- ✅ ~~Customer-facing returns UI~~ — **DONE** (`/returns` + real customer email through the flow).
- ✅ ~~VAT card on finance page~~ — **DONE**.
- ☐ **Small UI gap:** no admin button yet for the new `POST /api/admin/distributors/payment` (record-a-repayment) — the endpoint works; a button on `/admin/distributors` is a nice-to-have.
- ☐ **Copy:** homepage/vision **body text** still says "Zone Partner" in places (wording only — links already moved to the reseller funnel).
- ◐ Phase G/H hygiene — **mostly done** (life-os, oem-research, blog, commissions, advertisements, debug/test endpoints, loyalty/commission libs all removed). **Still open:** remove "fake Ozow" from live checkout (do with a full `next build` to validate the revenue path), `/api/checkout/test`, admin→Supabase Auth + roles, dedupe host configs (Vercel/Railway/nixpacks), rewrite README, reword "Zone Partner" homepage body copy.

## KEY DECISIONS LOCKED THIS SESSION
- **Payment model:** central collection as **disclosed agent** + **real-time PayFast Split** (primary) + **ledger-credit fallback**. Confirm disclosed-agent/VAT treatment with the accountant.
- **Wish List:** demand votes = internal **sourcing signal**; public **weekly random draw** = the giveaway (CPA s36).
- **VAT** ends at the wholesale leg; build is behind `VAT_REGISTERED`.

## INVESTOR PACK (current)
- `investor-pack/Jeffy_Business_Plan_2026.pdf` (EN) + `Jeffy_Business_Plan_2026_CN.pdf` (中文) — **current 12-page** version (deal: R5.0m for 50% equity; stock/insurance + visa-timing pages included). The user's uploaded PDF was confirmed identical to this.

## FIRST MESSAGE FOR NEXT SESSION
"Resuming Jeffy. The marathon build (Phases 0–7) is code-complete and type-checks clean; migrations 004 + 005 are written but not applied. Read `JEFFY_PROGRAM.md` then `SESSION_HANDOFF.md`. I want to [apply migrations & go live / build the backlog residuals / something else]."
