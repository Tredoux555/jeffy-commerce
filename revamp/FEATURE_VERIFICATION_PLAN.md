# Feature Verification Plan (physical / in-browser)

For end-to-end verification of each feature **after build + deploy**, by Claude-in-Chrome (or you). Each test: steps → expected result → pass/fail. Run against the preview/staging URL first, then production.

Legend: ✅ pass · ❌ fail · ⏭️ blocked

---

## A. Wish List (demand engine)
**A1 — Submit a wish (structured capture)**
1. Go to `/wants` (Wish List). Click "Add a wish."
2. Fill: product name, category, **price you'd pay**, **how often you'd buy**, your area.
3. Submit.
- *Expect:* confirmation; the wish appears in the public list with your inputs captured.

**A2 — Multiple wishes per person (up to 10)**
1. Submit several wishes as the same user.
- *Expect:* all saved; counter respects the 10-item cap.

**A3 — Vote / demand stacking**
1. Vote on an existing wish.
- *Expect:* vote count rises; popular items float up.

**A4 — Admin demand ranking**
1. Admin → Wish List analysis.
- *Expect:* items ranked by repeat demand, with price band + region; top ~100 exportable/shortlistable.

**A5 — Weekly winner**
1. Admin grants a wish (pick winner).
- *Expect:* winner recorded in `wishlist_grants`; shows on a public "granted" feed.

---

## B. Distributor onboarding
**B1 — Apply as distributor**
1. Go to distributor signup. Enter details + coverage area + accept agreement.
- *Expect:* record created with status `pending`; agreement timestamp saved.

**B2 — Admin approve + set credit limit**
1. Admin → Distributors → approve a pending applicant; set a credit limit.
- *Expect:* status → `active`; credit limit saved; phase = `consignment`.

---

## C. Distributor dashboard
**C1 — Stock on hand**
- *Expect:* shows products held, quantities, and value owed (matches `distributor_stock`).

**C2 — Balance owed + ledger**
- *Expect:* running balance owed matches the sum of `distributor_ledger`; entries readable (dispatch/sale/payment).

**C3 — Daily delivery list**
- *Expect:* today's routed orders for this distributor appear as a delivery run.

---

## D. Customer order → routing → split
**D1 — Geo-routing to nearest distributor**
1. As a customer, order a product to an address in a covered area.
- *Expect:* order is assigned to the nearest active distributor.

**D2 — Payment + split (sandbox first)**
1. Pay via PayFast sandbox.
- *Expect:* order marked paid only on webhook; split recorded — `jeffy_wholesale_cents` to Jeffy, `seller_margin_cents` to seller; distributor's stock balance reduced by the unit (ledger `sale` entry).

**D3 — Stock decrement timing**
- *Expect:* stock decremented on payment confirmation (webhook), not before.

---

## E. Finance dashboard (real data)
**E1 — Live figures**
- *Expect:* revenue, landed COGS, gross margin, per-distributor balances — all from the DB, no mock numbers.

**E2 — Reconciliation**
- *Expect:* dashboard totals tie to raw order/ledger data.

---

## F. Regression / safety
**F1 — Existing storefront still loads** (home, product pages, cart, checkout).
**F2 — Admin login works** and is protected.
**F3 — No console errors** on key pages.
**F4 — Invoices** show correct Jeffy details (Nedbank, reg no, no VAT line while unregistered).

---

## Pre-production gate (must all be ✅ before promoting to jeffy.co.za)
- [ ] Build passes clean (Desktop Commander `npm run build`).
- [ ] Supabase service-role key rotated (the exposed one).
- [ ] Migrations 001 + 003 applied to the database.
- [ ] PayFast live keys in env; one real low-value test transaction settled to Nedbank.
- [ ] A–F above all ✅ on preview.
