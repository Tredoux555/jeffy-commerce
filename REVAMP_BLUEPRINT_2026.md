# Jeffy Commerce — Revamp Blueprint

**Prepared:** 31 May 2026 · **Entity:** Jeffy Commerce (Pty) Ltd · Reg 2025/950712/07 · SARS Customs Code CU25827795
**Trading address:** 39 Panorama Drive, The Links, Somerset West, 7130 · **Bank:** Nedbank 1307614477 (br 198765)

---

## 0. Executive summary

The platform is **functionally broad but financially hollow.** It's a 100+-route storefront with mock financial reports, fictional product costs, no VAT accounting, a low-value 166-SKU catalog, and a leaked database key sitting in committed files. None of that is fatal — but it means the current "books" cannot be trusted, and the system is far too sprawling for a one-person, single-product import business.

The revamp thesis is three moves:

1. **Secure** — rotate the leaked key, harden the payment path. (Do first, today.)
2. **Collapse** — cut from 166 products and ~175 components down to **one hero product** and a lean storefront. Focus beats breadth for an importer with limited working capital.
3. **Rebuild the financial core** — real landed-cost costing, truthful profit, a proper accounting stack (Xero + Nedbank feed), and clean monthly closes. This is what makes it "top class."

Everything below is the detail and the step-by-step build plan, with an audit checkpoint after every phase.

---

## 1. 🔴 CRITICAL — do this before anything else

**Your Supabase service-role key is committed in plain text** in several files (`scripts/cleanup-products.js`, `scripts/fix-pricing-direct.js`, `test-complete-flow.sh`, and two `WANTS_*_REPORT.md` files). That key **bypasses all database security** — anyone who has seen the repo can read/modify your entire database.

**Action (only you can do this):**
1. Supabase dashboard → Project Settings → API → **Roll/regenerate the `service_role` key.**
2. Update it in Vercel env vars and your local `.env.local`.
3. I'll then purge it from all committed files (and ideally from git history).

Until this is rotated, treat the database as compromised. This is the single highest priority.

---

## 2. System audit — what we found

**Stack:** Next.js 14 (App Router), Supabase (Postgres/Auth/Storage), Tailwind, Zustand. Hosting config is contradictory — Vercel *and* Railway/Nixpacks configs both present (pick one; recommend Vercel).

**Scale (wildly oversized for the goal):** ~113 page routes, ~83 API routes, ~175 components. For a single-product store this should be a fraction of that.

**Financial tracking maturity: 2/10.**
- `admin/reports` is **100% hardcoded mock data** — not connected to the database.
- `admin/analytics` only sums revenue (`Σ total_cents`). No cost, profit, margin, or VAT anywhere.
- Product cost is stored as a single `cost_price_cents` that holds the **raw 1688 Yuan-converted unit price** — e.g. a power bank shows R12 cost. That is **not** landed cost (it ignores freight, duty, import VAT, clearing). **Every "profit" figure in the app is therefore fictional and overstated.**
- No COGS ledger, no reconciliation, no FX tracking, no VAT returns. The only mature money feature is the zone-partner payout sub-ledger (which we're retiring anyway).

**Payment path risks:**
- PayFast webhook's **source-IP allowlist is commented out** ("uncomment in production") — re-enable before go-live.
- A **second, parallel PayFast implementation** (`lib/integrations/payfast.ts`) has a signature check that returns `true` in sandbox — delete it so it can never be wired in by accident.
- **Ozow is fake** — checkout redirects straight to "success" and treats the order as paid without taking money. Remove or build properly.
- **Stock is decremented before payment** — move it into the webhook on payment-confirmed to prevent overselling.

**Catalog reality:** The 166 products are overwhelmingly **beauty / hair / nails / fashion accessories** (not electronics as old notes claimed). Median price R60; 70 SKUs under R50. This is a **low-average-order-value, high-SKU** catalog — the worst shape for an importer, because per-shipment freight and duty crush thin tickets.

---

## 3. The financial architecture ("top class")

This is the heart of the revamp. *(Tax/structuring points below should be confirmed with your accountant — flagged where relevant.)*

### 3.1 Landed cost — cost the *true* number, not the supplier price

Your real COGS is the **landed cost per unit**, not the 1688 price. Costing on supplier price alone is the classic way importers wipe out their own margin. The layers:

> Supplier cost (CNY) → ×FX rate you actually pay → + international freight + insurance = **CIF / Customs Value** → + customs duty (varies by HS code) → + **import VAT** → + clearing/forwarding → ÷ units = **landed cost per unit**

**SARS import VAT formula (official):** `[(Customs Value + 10%) + non-rebated duties] × 15%`. The +10% uplift applies because China is outside SACU.

**⚠️ The single most important financial fact for you right now:** because you are **not VAT-registered**, that 15% import VAT is a **permanent sunk cost** baked into your COGS — you cannot claim it back. A VAT-registered competitor recovers it, making their COGS ~12–13% lower than yours on the same goods. (This is the core argument for considering early voluntary registration — see 3.3.)

A worked example and a live calculator are in the companion file **`Jeffy_Financial_Model.xlsx`**.

### 3.2 Accounting stack — recommendation: **Xero (Premium) + Nedbank direct feed**

| | Why it wins here |
|---|---|
| **Nedbank direct API bank feed** | Cleanest automated reconciliation available in SA; you already bank Nedbank. Decisive for a clean monthly close. |
| **Multi-currency (Premium tier)** | Records your CNY supplier payments and FX gains/losses correctly. |
| **App ecosystem** | When you outgrow native inventory, bolt on a landed-cost app (Cin7/Unleashed) rather than migrating. |

Weakness: Xero's native inventory doesn't auto-apportion freight+duty+VAT into per-unit landed cost — so you maintain the landed-cost model (the xlsx) and post a journal to value inventory correctly. **Value alternative:** Zoho Books (cheaper multi-currency + stronger native inventory) but you lose the Nedbank feed. *Confirm current Premium pricing/discount and CNY support before subscribing.*

### 3.3 VAT strategy — thresholds changed on 1 April 2026

**Important correction:** you mentioned R50k for VAT registration — that figure is outdated. As of 1 April 2026 (SARS):
- **Compulsory** registration: **R2.3 million** / 12 months (was R1m).
- **Voluntary** registration: **R120,000** / 12 months (was R50k).

So you have much more runway before you're *forced* to register. But the import-VAT sunk cost (3.1) means **voluntary registration may still pay for itself** by letting you recover import VAT + input VAT on ads/software/freight. The catch: as a consumer-facing seller you'd then have to **charge customers 15%** (they can't reclaim it), which is a real price/margin wedge. **Net benefit depends on your import-VAT volume vs ad spend vs price sensitivity — have your accountant model the break-even before deciding.** Once registered, VAT201 filing is typically **bi-monthly** (SARS assigns the category).

### 3.4 Unit economics & the cash-conversion cycle

The structural risk that kills profitable-on-paper importers: you **pay the factory upfront**, goods sit **30–45 days on a ship**, you pay duty + import VAT in cash at the border, *then* sell over weeks. Cash is locked the entire time.

- **Contribution margin/unit** = price − (landed COGS + delivery + PayFast fee + packaging + returns allowance). Target **>35%**.
- **Break-even ROAS = 1 ÷ contribution margin %** (e.g. 40% CM → you need 2.5× ROAS just to break even on ads).
- **CAC payback must happen on the first order** for a single-purchase product, and within 30–60 days to stay cash-positive.
- Track: landed COGS/unit, contribution margin %, CAC, break-even & blended ROAS, Days Inventory Outstanding, cash-conversion cycle, sell-through, cash runway in weeks.

### 3.5 Compliance calendar (Pty Ltd importer)

- **Provisional tax (IRP6):** twice a year + optional top-up; plus annual **ITR14**.
- **CIPC annual return** every year — **must include the Beneficial Ownership declaration** (anyone holding ≥5% / significant control) or it's rejected.
- **Records retained 5 years**, including SAD500 bills of entry, commercial invoices, bills of lading, HS-code proof, FX advices.
- **Monthly close:** Nedbank feed reconciled → PayFast settlements reconciled (gross sales vs payout = fees) → inventory/COGS updated at landed cost → FX booked → management P&L + contribution report by ~day 5–7.

---

## 4. Product strategy — collapse to one hero product

The DTC playbook is clear: launch with **one hero product**, concentrate ad budget, prove unit economics, *then* broaden. One SKU = one HS code, one supplier, one inventory forecast, one landed-cost model — exactly what your cash-constrained position needs.

**Data-driven recommendation (from the catalog analysis):** of what's already sourced, the strongest single-hero candidate is a **20,000mAh solar power bank** — broad gender-neutral appeal, directly relevant to SA load-shedding, robust (low breakage/returns), non-regulated, and a R200–300 ticket that can actually carry import freight and duty. Runner-up: stainless steel thermos mug.

**Caveat:** this is a recommendation from the *existing* catalog. If you have a different/new hero product in mind (you mentioned refining products), tell me — the financial model and build work the same either way. Whatever we pick, its **true landed cost must be recalculated** (the current R12-type costs are fake).

---

## 5. Streamline — what gets cut

For a single-product store, decommission: the **wants** crowd-demand system (~15 routes), **zone-partner** franchise system, **life-os** personal tracker, **OEM research**, affiliates, gift cards, loyalty, bundles, blog, the `_future/trends` AI module. Consolidate the **three** invoice generators, duplicate checkout/quick-view/size-guide/segments component families into one each. Drop the unused `puppeteer*` dependencies. Delete stray HTTP-garbage files, logs, `src.zip`, and archive the ~118 markdown reports. Collapse Vercel-vs-Railway configs to one. **Target: reduce routes/components by ~70%.**

---

## 6. The marathon build plan (audit after every phase)

Each phase ends with an audit checkpoint — I verify it before moving on, and report.

**Phase 0 — Secure (gated on you):**
- You rotate the Supabase service-role key. I purge it from all files + git history.
- *Audit:* confirm no secrets remain in repo; confirm old key is dead.

**Phase 1 — Financial foundation (no code risk):**
- Finalise landed-cost model with your real numbers (HS code/duty, freight, FX).
- Stand up Xero + Nedbank feed; set chart of accounts; define the monthly-close checklist.
- *Audit:* worked landed cost ties out; test bank-feed reconciliation.

**Phase 2 — Data model & truthful costs:**
- Add landed-cost fields to `products` (cny_cost, fx_rate, freight, duty, import_vat, clearance, landed_cost_cents); snapshot landed cost into `order_items.unit_cost_cents`; fix profit math.
- *Audit:* recompute a sample order's profit by hand vs system.

**Phase 3 — Single-product pivot:**
- Back up all 166 products (clean export). Clear catalog + categories. Insert the one hero product with real landed cost, variants, images, copy.
- *Audit:* storefront shows one product; checkout completes end-to-end in sandbox.

**Phase 4 — Payment hardening + PayFast go-live (gated on your keys):**
- Wire PayFast keys (Vercel env), `PAYFAST_SANDBOX=false`, re-enable webhook IP allowlist, move stock-decrement into webhook, delete the parallel PayFast impl and fake Ozow.
- *Audit:* sandbox transaction → real R-value test transaction → refund test.

**Phase 5 — Real finance dashboard:**
- Replace mock `admin/reports` with a live dashboard: revenue, landed COGS, gross margin, contribution, per-order profit, PayFast fee reconciliation.
- *Audit:* dashboard figures reconcile to Xero and to raw DB.

**Phase 6 — Streamline & harden:**
- Delete dead features/components; consolidate duplicates; replace shared-password admin with Supabase Auth + roles + rate limiting; remove debug endpoints; deliberate RLS review.
- *Audit:* build passes; route/component count down ~70%; RLS verified on every money/PII table.

**Phase 7 — Repo hygiene:**
- Remove logs/zip/garbage files; archive markdown; drop unused deps; one host config.
- *Audit:* clean `git status`, clean install, green build.

---

## 7. Open decisions (need your input)

1. **Hero product:** go with the solar power bank from the catalog, or a different/new product you have in mind?
2. **VAT:** stay un-registered for now (simplest), or have your accountant model early voluntary registration to recover import VAT? (Recommend: model it — the sunk-cost math may favour registering.)
3. **Accounting software:** green-light **Xero Premium + Nedbank feed**, or compare Zoho first?
4. **Hosting:** standardise on **Vercel** (recommended) and remove Railway config?
5. **Sequence:** start the marathon at Phase 1 (financial foundation) now, in parallel with you doing Phase 0 (key rotation) and fetching PayFast keys?

---

## Sources

SARS — Duties & Taxes for Importers; New VAT threshold (R2.3m, eff. 1 Apr 2026); VAT filing categories; Provisional Tax; Record-keeping. PayFast — Fees (3.2%+R2 card, R8.70 payout, no monthly fee, Apr 2026); Immediate Payout; Developer docs (ITN). Xero ZA pricing + Nedbank bank-feed announcement. Sage / Zoho Books pricing. JLog — SA import duties/SAD500. Admetrics / Wayflyer — cash-conversion cycle. Top Growth Marketing / ATTN — DTC unit economics. CIPC — annual return + beneficial ownership. (Full URLs retained in research notes.)
