# ⭐ JEFFY PROGRAM — Master Control & Resume File

> **This is the single file to open at the start of any session.** It tells you (and any AI partner) exactly what Jeffy is, the locked model, the real business identity, where the build stands, and what to do next. If anything elsewhere contradicts this file, this file wins — then update it.
>
> **Last updated:** 4 June 2026 (late) — **LIVE on jeffy.co.za.** Migrations 004+005 applied, products wiped, full build deployed (Railway auto-deploy from GitHub `main`). Public funnel converted to the Wish List model. · **Keeper:** Tredoux Willemse
>
> **▶ RESUME POINT:** Platform is **live and the public Wish List is converted** (monthly random draw; old "10 agrees = free" gone). Deploy via `git push origin main` (Desktop Commander, SSH); DB via Supabase SQL editor. **Next, in `SESSION_HANDOFF.md` → "WHAT'S LEFT FOR THE NEW BUSINESS MODEL":** add `RESEND_API_KEY` (emails), finish PayFast/Network merchant + Split, lodge draw rules with NCC, hire the campaign manager (Step 1), add products + set wholesale prices, attorney sign-off + rewrite `/wants/terms`.

---

## 0. How to resume cleanly (read this first)
1. Read this file top to bottom.
2. Then skim `revamp/HANDOFF_RETURN.md` (engineering single-source-of-truth) and `revamp/BUILD_JOURNAL.md` (step-by-step with audits).
3. Check the **Build Status** table (§6) for the next unbuilt phase.
4. Investor/auditor materials live in **`investor-pack/`** (§7).
5. When you finish a work block, update §6 and the "Last updated" date above.

---

## 1. What Jeffy is (one sentence)
An import-and-supply commerce network: Jeffy imports goods from China under its own SA importer's code, wholesales them to a national network of **independent local sellers** who deliver from their garages, and channels net profit into **free, merit-based schools**. *"Takealot, but your neighbour delivers it."*

## 2. The mission
Commerce is the engine; education is the destination. Net profit funds free, merit-based schools in South Africa — no fees, no connections, selected on potential and character. First school site: the family farm.

> Keep external documents grounded and professional. The personal/spiritual material in older notes stays **internal** — it never goes into investor, auditor, or marketing materials.

## 3. The model (LOCKED)
- **Flow:** Chinese factories → Jeffy (imports, owns landed stock) → independent sellers (buy wholesale, resell at retail) → customers order on **jeffy.co.za**.
- **Sellers are independent resellers (buy-sell), NOT employees, NOT commission agents.** They buy stock at wholesale and keep the retail margin (the Avon/Tupperware model). No PAYE, no minimum wage, no leave, no franchise obligation.
- **Graduation:** new sellers take stock **on credit** (Jeffy-owned until paid, retention of title); as they build a cash cushion they **buy upfront** for bigger margins.
- **Payments:** customers pay centrally on the site; **PayFast Split Payments** auto-divides each sale → Jeffy's wholesale cut + seller's margin, in real time. Jeffy never holds money that isn't its own (disclosed payment-agent setup).
- **VAT:** plan to **register Jeffy** so import VAT (currently a 15% sunk cost) becomes recoverable; VAT ends cleanly at the wholesale leg (sellers too small to register).
- **Demand engine — the Wish List:** customers request products and vote; real demand triggers sourcing; first requester gets theirs free (filmed → viral). We only buy what's been asked for → minimal dead stock.
- **Foundation:** net profit → free merit-based schools.

### Naming caution (important)
Brand the program **"Jeffy Wish List"** and the charitable arm **"The Jeffy Foundation."** **Do not** use the literal phrase *"Make-A-Wish"* in public/marketing/legal materials — it is a registered trademark of an unrelated children's charity. Your own branding keeps you clear of any trademark conflict.

## 4. Business identity (verifiable — use exactly)
| Field | Value |
|---|---|
| Registered name | **Jeffy Commerce (Pty) Ltd** |
| Registration number | **2025/950712/07** |
| Registered | 10 December 2025 · Private Company · FY end February · Status: In Business |
| Income Tax number | 9168272293 |
| Director / Public Officer | Tredoux Willemse · ID 8706025176086 · appointed 10 Dec 2025 |
| Trading address | 39 Panorama Drive, The Links, Somerset West, 7130 |
| Registered office (CIPC) | Kendy Farm, Mullers Pass, Newcastle, KwaZulu-Natal, 2940 |
| Bank | Nedbank · Acct **1307614477** · Branch 198765 · "Jeffy Commerce (Pty) Ltd" |
| Importer status | Registered Importer — approved 18 May 2026 |
| SARS Customs Code | **CU25827795** · cash account 8125959786 · ref BRLA-20260518-0190-00-01 · case 1000406607 |
| VAT | **Not yet registered** (voluntary threshold R120k; compulsory R2.3m / 12 months, eff. 1 Apr 2026) |
| Website / email | jeffy.co.za · hello@jeffy.co.za · tredoux555@gmail.com · 076 506 4386 |
| Note | Dormant entity K2025624712 (2025/624712/07) exists but is **not** the operating business. |

## 5. Financials (illustrative model — see `Jeffy_Financial_Model.xlsx`)
- **Landed cost is true COGS** = supplier (CNY × FX) + freight + insurance → CIF → +10% uplift (non-SACU) → duty → **import VAT 15%** → clearing → ÷ units. Worked example: ~**R92.32/unit** on the modelled inputs.
- **Current modelled unit economics (illustrative, pre-optimisation):** sell R249, contribution margin ≈ **28.6%** (target >35%), break-even ROAS ≈ 3.5×, profit after CAC ≈ **−R18.76/order**. → The whole strategy (Wish List demand, single-hero focus, VAT recovery, two-tier margin) is the plan to push CM above 35% and turn this positive **before** scaling.
- **Discipline (non-negotiable):** price off true landed cost; prove the unit on a small batch in 1–2 areas; only then deploy big capital by the container into proven winners.

## 6. BUILD STATUS — where we are
**Stack:** Next.js 14 (App Router) · Supabase (Postgres/Auth/Storage) · Tailwind · Zustand · Hosting: standardise on Vercel. Repo: `ACTIVE/jeffy-mvp`.
**Verify process:** build features → `npm run build` audit → deploy → in-browser verify (`revamp/FEATURE_VERIFICATION_PLAN.md`).

| Phase | What | Status |
|---|---|---|
| 0 | Secure — rotate leaked Supabase key, scrub from files | Files scrubbed ✓ · **key rotation = YOU** |
| A | Business identity on checkout/invoices/SEO; VAT line removed | ✓ Done |
| — | Build fix (NODE_ENV/dev-deps) — baseline compiles clean | ✓ Done |
| B | Data model: distributors, distributor_stock, distributor_ledger, wishlist_grants, landed-cost fields, wholesale price, order routing/split, structured Wish List fields | ✓ Done (types in `src/types/distributor.ts`) |
| C | Wish List engine: `/admin/wishlist` demand-analysis + structured capture (price/frequency/suburb) | ✓ Done |
| D | Distributor intake + admin: `/distributors/join`, `/admin/distributors`, `findNearestDistributor()` | ✓ Done |
| **D-finish** | Reseller dashboard + **magic-link login** (stock / balance / deliveries / ledger) | ✓ Done (`src/app/distributors/dashboard/` + `api/distributors/login`) |
| E | Payments: order routing + two-tier split wired into checkout; reseller settlement + IP allowlist in webhook | ✓ **Code done** — go-live needs PayFast keys + migration (delete duplicate PayFast impl + fake Ozow still ☐) |
| F | Finance dashboard: live revenue / landed COGS / margin / reseller balances | ✓ Done (`/admin/finance`) — old mock `/admin/reports` still present ☐ |
| G | Streamline & harden: legacy `/partner` + `/zone-partner` model DELETED ✓; **off-model removed (4 Jun): life-os, oem-research, commissions, advertisements, blog, dead auto-assign, debug/test endpoints, loyalty/commission libs** ✓; all nav/links repointed; tsc clean. Remaining ☐: "fake Ozow" in live checkout (+ `/api/checkout/test`), admin → Supabase Auth + roles | ◐ Mostly done |
| H | Hygiene: remove logs/zips, archive markdown, drop unused deps, one host config, rewrite README | ☐ |

### Go-live sequence (where we are)
1. ✅ **Apply migration 001+003** — DONE (user ran it, 2 Jun 2026).
2. ⏳ **Rotate the Supabase service-role key** (Settings → API) → update Vercel env + `.env.local`. ← NEXT
3. ☐ **Deploy** the new code (commit/push → Vercel) so the new pages/routes go live.
4. ☐ **Set `products.wholesale_price_cents` (+ `landed_cost_cents`)** on 1–2 test products.
5. ☐ **`RESEND_API_KEY`** (reseller login emails) — optional for testing.
6. ☐ **PayFast keys**; set `PAYFAST_SANDBOX=false` + `PAYFAST_ENFORCE_IP=true` when going live.
7. ☐ **Verify live** end-to-end (`revamp/FEATURE_VERIFICATION_PLAN.md`).

### Other blockers / later
- **Register Jeffy for VAT**; set up **Xero + Nedbank feed** (scaffolding in `revamp/phase1-financial/`).
- **Attorney:** reseller agreement (independence, retention of title, non-exclusive) + central-collection-as-agent doc + Wish List competition T&Cs (CPA). No joining fee (franchise-law).
- **Products come from the Wish List data** once the campaign runs (top-100 shortlist drives sourcing).
- **Open question for user:** how do they deploy? (GitHub→Vercel auto, or other.)

## 7. Document & file map
| File | Purpose |
|---|---|
| `JEFFY_PROGRAM.md` | ← this master control file |
| `SESSION_HANDOFF.md` | ← resume-here thread (read after this file) |
| `investor-pack/Jeffy_Business_Plan_Designed.pdf` | **Current best** — designed, scannable, realistic 3-yr financials, no schools |
| `investor-pack/HeyGen_Investor_Script.md` | Investor video script (schools removed; Wish List = 1–10 + random draw) |
| `investor-pack/WishList_Explainer_Script.md` | Wish List explainer — English + Simplified Chinese |
| `investor-pack/Jeffy_OnePager_Auditor.docx` | Older one-pager (still has schools framing) — re-sync or retire |
| `investor-pack/Jeffy_Business_Plan.docx` | Older Word plan (schools + earlier numbers) — re-sync or retire |
| _(unsaved)_ | Chinese investor pitch — delivered in chat only; save to file if wanted |
| `docs/JEFFY_WISHLIST_CAMPAIGN.md` | **Wishlist media campaign master plan** (surfaced in admin at `/admin/campaign`) |
| `docs/JEFFY_CAMPAIGN_MANAGER_HIRING.md` | Step 1: hiring the SA-based campaign/social manager |
| `GO_LIVE_CHECKLIST.md` | The exact "what YOU must do & add" go-live steps |
| `JEFFY_BUSINESS_INFO.md` | Raw business-identity reference sheet |
| `JEFFY_GAME_PLAN.md` | The phased go-to-market plan |
| `REVAMP_BLUEPRINT_2026.md` | Full technical/financial revamp blueprint + sources |
| `Jeffy_Financial_Model.xlsx` | Landed cost / unit economics / P&L / KPI model |
| `revamp/HANDOFF_RETURN.md` | Engineering single-source-of-truth |
| `revamp/BUILD_JOURNAL.md` | Step-by-step build log with audits |
| `revamp/ENGINEERING_ACTION_PLAN.md` | The marathon plan + audit gates |
| `revamp/FEATURE_VERIFICATION_PLAN.md` | In-browser test script |

## 8. Working conventions
- Claude writes complete files with exact paths; keep instructions plain (non-technical keeper).
- Every build step ends with an audit (`npm run build`) before deploy.
- Keep this file and `revamp/BUILD_JOURNAL.md` current at the end of each session.
