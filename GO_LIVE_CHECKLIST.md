# ✅ Jeffy — What YOU need to do & add to make it all work

_Updated 4 June 2026. The whole build is code-complete and type-checks clean (`tsc --noEmit` = 0). Everything below needs **your** accounts, keys, or a decision — none of it can be done from inside the build environment._

---

## 1. Apply the two database migrations (5 min)
In the **Supabase dashboard → SQL Editor**, run these two files in order (they're safe to run more than once):

1. `revamp/phase2-data-model/004_payouts_and_dedupe.sql`
2. `revamp/phase2-data-model/005_rls_policies.sql`

004 adds the PayFast-split, VAT, customer-identity and ledger columns. 005 locks the reseller tables with Row-Level Security. Without these, the new finance/returns/split features have no columns to write to.

## 2. Add environment variables (Vercel → Project → Settings → Environment Variables)
Add the ones you don't already have. Defaults are sensible — you only *need* the first group to go live.

| Variable | Set it to | Why |
|---|---|---|
| `RESEND_API_KEY` | your Resend key | Turns on reseller-login, returns, low-stock & Wish List winner emails. **Without it, all emails silently skip** (nothing breaks). |
| `NOTIFY_FROM_EMAIL` | `Jeffy <hello@jeffy.co.za>` | The "from" on those emails. |
| `CRON_SECRET` | a long random string | Protects the weekly Wish List draw endpoint. |
| `VAT_REGISTERED` | `false` now → `true` the day you register | Turns on output-VAT tracking on the finance page. |
| `PAYFAST_ENFORCE_IP` | `false` for sandbox → `true` live | Rejects fake webhook posts in production. |
| `GRAD_MIN_SALES` / `GRAD_MIN_SALES_CENTS` | `10` / `500000` (optional) | When a reseller auto-graduates from consignment → buy-upfront. |
| `LOW_STOCK_THRESHOLD` | `3` (optional) | Units at/below which a reseller gets a "restock" nudge. |

(Full list with comments is in `.env.example`.)

## 3. Rotate the leaked Supabase service-role key (do this once, soon)
Supabase → **Settings → API → Reset service-role key**. Then update it in Vercel env **and** your local `.env.local`, and redeploy. (The old key was exposed in earlier files.)

## 4. Set wholesale prices
Go to **`/admin/wholesale`** and set `wholesale_price_cents` (and landed cost) on at least your 1–2 test products. A banner flags anything missing. The two-tier split can't compute a seller margin until this is set.

## 5. Enable PayFast Split Payments
- Turn on **Split Payments** on your PayFast merchant account.
- For each reseller, capture their **`payfast_merchant_id`** (so their margin is paid to them in real time). Resellers without one are covered by the **ledger-credit fallback** automatically — nothing breaks.
- Going live: set `PAYFAST_SANDBOX=false`, `PAYFAST_ENFORCE_IP=true`, and add your real PayFast keys.

## 6. Schedule the weekly Wish List draw
Add a **Vercel Cron** hitting `GET /api/cron/wishlist-draw` (e.g. weekly), sending header `Authorization: Bearer <your CRON_SECRET>`. It picks a uniformly-random eligible wish, records the winner, emails them, and returns a WhatsApp click-to-chat link for you to follow up.

## 7. Build & deploy from the Mac, then verify
- Run **`npm run build`** locally (the sandbox here couldn't finish a full Next build, so this is the final gate — `tsc` is already clean).
- Deploy (commit/push → Vercel).
- Walk the checklist in `revamp/FEATURE_VERIFICATION_PLAN.md`, including a **PayFast sandbox split** test, a test **return** via `/returns`, and a look at the **VAT card** on `/admin/finance`.

## 8. Before signing any resellers — legal & accounting
- **Accountant:** confirm the disclosed-agent / central-collection setup and the VAT-ends-at-wholesale treatment.
- **Attorney:** reseller agreement (independence, retention of title, non-exclusive, no joining fee) + the Wish List competition T&Cs (CPA s36). See `revamp/COMPLIANCE_TRACKER.md` items 1–3.

---

## What changed this session (so you know what's new)
- `/admin/finance` now shows a **VAT card**.
- New customer page **`/returns`** (order number + email → logged for your team to action).
- Resellers now **auto-graduate** consignment → buy-upfront once they've cleared debt and proven volume.
- New **record-a-repayment** endpoint `POST /api/admin/distributors/payment` (no admin button yet — call it directly or ask for a button).
- **Winner & low-stock notifications** are wired (email + WhatsApp link), safely off until `RESEND_API_KEY` is set.
- The **old franchise / "Zone Partner" model is deleted**; every link now points to the reseller funnel (`/distributors/join`).

## Tiny optional follow-ups (not blocking)
- Reword the homepage/vision **body copy** that still says "Zone Partner" (links already moved).
- Add a "Record payment" button to `/admin/distributors`.
- Wider cleanup of other off-model pages (life-os, oem-research, blog, loyalty, gift cards) + debug endpoints.
