# Runbook — Wish List live · Finance clean · Products cleared

Do these in order, top to bottom. ✅ = I already did it in code (ships on your next deploy). 🧑 = you do it.

---

## 0. Safety first (5 min) 🧑
- Supabase → **Database → Backups** → take a manual backup (Step 2 clears products and is destructive).

## 1. Build & deploy the code (the gate) 🧑
1. On your Mac, in `ACTIVE/jeffy-mvp`: run **`npm run build`**. It must finish with no errors. *(I can only run `tsc` in here — it's clean — but the full build needs your Mac's compiler.)*
2. Commit & push → Vercel deploys. This ships: the clean finance page, the removed mock reports, the new `/admin/campaign`, the customer `/returns` page, and the **Wish List draw cron** (now in `vercel.json`).

---

## A. Get the Wish List system in  (Railway — on-demand, no scheduler)

- ✅ **On-demand draw** — a **"Draw a winner"** button on `/admin/campaign` runs a uniform-random pick, records the winner in `wishlist_grants`, and shows their contact + a WhatsApp link. Click it whenever you're ready to grant the next wish — no fixed weekly/monthly cron needed.
- ✅ Endpoint behind it: `POST /api/admin/wishlist/draw` (admin-only, server-side). The old `GET /api/cron/wishlist-draw` still exists if you ever want an external scheduler to automate it (`Authorization: Bearer ${CRON_SECRET}`).
- ✅ Public **rules page** `/wish-list-rules` (CPA s36) · admin demand view `/admin/wishlist`.
- Env: `CRON_SECRET` is **already set** in Railway. `RESEND_API_KEY` is the only optional add — without it the winner email just skips (you'd add it yourself, it's a secret).

🧑 To use it (after deploy + migrations):
1. Open `/admin/campaign`, scroll to **"Grant a wish — draw a winner"**, click the button. (Needs active wishes with ≥1 supporter.)
2. 🧑 Legal: lodge the competition rules with the National Consumer Commission before promoting it.
3. Note the tension in your plan: a published **"random draw"** must actually be random (this button is). If you'd rather *curate* the most shareable story, that's a selection, not a draw — tell me and I'll add a curated mode.

---

## B. Get the finance system clean

- ✅ Old **mock `/admin/reports` deleted** (it showed fake numbers). `/admin/finance` is now the single source of truth — real revenue, landed COGS, margin, reseller balances, and the VAT card.

🧑 To make the numbers real:
1. **Apply the migrations** in Supabase → SQL Editor, in order (safe to re-run):
   - `revamp/phase2-data-model/004_payouts_and_dedupe.sql` (adds `vat_cents`, split + customer columns finance reads).
   - `revamp/phase2-data-model/005_rls_policies.sql` (locks the reseller tables).
2. **Set wholesale prices** at `/admin/wholesale` on each product you'll sell — margin/finance can't compute without them.
3. **VAT:** leave `VAT_REGISTERED=false` until you register; flip it to `true` (Vercel env) the day you do, and the VAT card starts tracking output VAT.
4. Open **`/admin/finance`** — that's your clean dashboard.

---

## C. Clear out the products

- ✅ Safe wipe script written: `revamp/phase2-data-model/006_clear_products.sql`.

🧑 To run it:
1. Make sure you took the backup (Step 0).
2. Supabase → SQL Editor → open `006_clear_products.sql`.
3. Run **Step 1 (preview)** to see the counts.
4. Run **Step 2** — `TRUNCATE products CASCADE;` clears all products + everything linked to them (order line-items, reseller stock, reviews/Q&A, bundles, flash sales, inventory, restock alerts, wishlist→product links). It **keeps** orders, resellers + balances, wants/Wish List demand, categories, customers.
5. (Optional) Step 3 clears the leftover test order shells too.
6. Run **Step 4** to confirm everything reads 0.

After this, your catalogue is empty and ready to be filled from real Wish List demand.

---

## Suggested overall order
0 backup → C clear products → B apply migrations 004+005 → A add env vars (CRON_SECRET, RESEND_API_KEY) → 1 build on Mac → deploy → verify Vercel cron + `/admin/finance` + `/admin/wishlist` → set wholesale prices.
```
```
