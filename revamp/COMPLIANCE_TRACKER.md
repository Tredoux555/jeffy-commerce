# ✅ Jeffy Compliance Tracker

> Living checklist of the legal / tax / insurance items the platform build depends on.
> Hand to the relevant advisor. Status: ☐ open · ◐ in progress · ✓ done.
> Created 3 June 2026.

| # | Item | Owner | Why it matters | Platform link | Status |
|---|------|-------|----------------|---------------|--------|
| 1 | **Reseller agreement** — buy-sell independence, retention of title, non-exclusive, **non-circumvention**, disclosed-agent collection, home storage/security duties | Attorney | Holds the buy-sell structure; prevents employee/agent mis-classification and disintermediation | `distributors.agreement_signed_at` | ☐ |
| 2 | **Disclosed-agent + VAT treatment** of central collection + real-time PayFast split | Chartered accountant | Confirms Jeffy isn't the retailer (VAT on R249) and that holding/splitting funds is sound; the fallback path briefly accrues seller margin | Phase 1 split + `vat.ts` | ☐ |
| 3 | **VAT registration** | Chartered accountant | Whole unit-economics assume recovered import VAT; output VAT ends at the wholesale leg | `VAT_REGISTERED` flag (Phase 5) | ☐ |
| 4 | **POPIA** — customer consent, operator agreements with resellers, privacy policy, data-minimisation | Attorney | Customer data (name, address, wishes) is shared with independent resellers | `orders.customer_email/name/phone` (Phase 7) | ☐ |
| 5 | **Wish List competition rules** (CPA s36) + lodge with the National Consumer Commission | Attorney | A weekly random prize draw is a regulated promotional competition (no purchase, published rules, 3-yr records) | `/wish-list-rules` page + `/api/cron/wishlist-draw` (Phase 4) | ◐ (rules page drafted) |
| 6 | **Insurance** — stock-at-various-premises + goods-in-transit + product liability | Short-term broker | Stock lives at resellers' homes; importer CPA s61 exposure | Per-reseller credit cap = loss cap | ☐ |
| 7 | **Zoning guidance for resellers** (home-occupation limits) | You / town planner | Resellers store & dispatch from home | Reseller onboarding checklist | ☐ |
| 8 | **PayFast Split Payments** — enable on the merchant account; onboard resellers' PayFast merchant IDs (bank + KYC) | You / PayFast | Required for the real-time margin split | `distributors.payfast_merchant_id`; fallback ledger-credit covers gaps | ☐ |
| 9 | **Business visa pathway** (if pursued) — CA capital certificate, DTIC recommendation, 60% SA-employee undertaking | Immigration attorney | The R5m investment + visa timeline (4–8 months) | n/a | ☐ |

**Note on the chosen payment model:** central collection + payouts (real-time PayFast split, ledger-credit fallback). Items 1–3 confirm this is legally sound — they are the gating compliance dependencies before signing resellers and going live.
