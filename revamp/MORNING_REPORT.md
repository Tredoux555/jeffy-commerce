# Good morning — overnight revamp report

I ran the marathon as agreed, **local files only** — nothing was deployed, nothing live was deleted, and the site is untouched and still up. Everything I changed is reversible. Full step-by-step detail is in `BUILD_JOURNAL.md`; this is the summary.

## ✅ Done & self-audited

1. **Security scrub.** Removed your leaked Supabase service-role key from 7 committed files (code now reads from env; markdown redacted). Verified: no full key remains anywhere in the repo.
2. **Business identity wired in.** Real Nedbank EFT details replaced the fake FNB account on checkout; both invoices + SEO updated to Jeffy Commerce (Pty) Ltd / Reg 2025/950712/07 / Somerset West; VAT removed (you're not registered) and "TAX INVOICE" corrected to "INVOICE".
3. **Financial foundation (Xero-ready).** Chart of accounts for a SA importer, monthly-close checklist, and the `Jeffy_Financial_Model.xlsx` (landed cost · unit economics · monthly P&L · KPI dashboard, zero formula errors).
4. **Truthful costs.** Prepared the landed-cost migration (`001_landed_cost_fields.sql`) and made checkout compute profit from real landed cost with a safe fallback. Updated the type definitions to match.
5. **Repo cleanup.** Cut root files from **121 → 64** — moved 20 junk files + 57 superseded session reports into `revamp/_removed/` (recoverable, not deleted).

## 🔴 Needs you (can't be automated)

1. **Rotate the Supabase key** — Settings → API → roll the `service_role` key, then update Vercel env + `.env.local`. The old key was exposed, so do this first.
2. **PayFast keys** — Merchant ID, Merchant Key, Passphrase (Settings → Integration). Then I finish PayFast go-live.
3. **Create Xero + connect the Nedbank feed** — account + bank connection only you can authorise. Scaffolding is ready to drop in.
4. **Pick the hero product** — you said TBD. Once chosen, I do the single-product pivot (with a clean backup first).

## 🟡 Prepared, waiting for your go-ahead

- Apply `001_landed_cost_fields.sql` to the database (additive/safe — one click after the key rotation).
- Single-product pivot (destructive to the catalog — supervised).
- Feature deletion (wants / zone-partner / life-os, etc.) — needs a verified build loop so we don't break anything.
- Admin auth upgrade + RLS review (security-sensitive — supervised).

## Two things I want to flag from the numbers

- **Your example hero economics didn't work.** At R249 with realistic landed cost + ads, the model showed a **loss per order**. Whatever product we pick, we price it off the real landed cost in the model — don't set price first.
- **Import VAT is a sunk cost for you** (not VAT-registered), adding ~15% to COGS vs a registered competitor. Worth asking your accountant whether early voluntary VAT registration (now R120k threshold, not R50k) nets positive.

## Suggested order when you're up
Rotate key → I apply the migration → you start Xero + give me the hero product → we run the single-product pivot and PayFast go-live together, with a build check after each.

Nothing here is urgent to undo — take your time. I left the task list and journal updated so we can pick up exactly where this stopped.
