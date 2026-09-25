# How Jeffy Works

### The current model (buy-sell reseller network)

> Replaces the older zone-partner / 50%-profit-share description. The locked model lives in
> `JEFFY_PROGRAM.md` §3 — this is the plain-English version.
> Last updated: 3 June 2026.

---

## One sentence

Jeffy imports goods from China under its own SARS customs code, **wholesales** them to a network
of **independent local resellers** who hold stock and deliver in their own area, and customers
order on **jeffy.co.za**. *"Takealot, but your neighbour delivers it."*

---

## The flow

```
Chinese factories
      ↓  (Jeffy imports, owns landed stock)
   JEFFY
      ↓  (dispatches stock ON CREDIT — retention of title — to resellers)
INDEPENDENT RESELLERS  ← buy wholesale, keep the retail margin
      ↓  (deliver locally, same-day, from home)
  CUSTOMERS  ← order + pay on jeffy.co.za
```

## The money (two-tier split)

- Customer pays the retail price on the site (central collection).
- **PayFast Split Payments** pays the **reseller's margin** straight to their PayFast merchant
  account in real time; Jeffy keeps its **wholesale** cut.
- That wholesale cut clears what the reseller owed Jeffy for the stock they held (ledger entry).
- If a reseller isn't PayFast-enabled yet, their margin is saved as a **withdrawable credit**
  on their Jeffy balance (fallback) — shown on their dashboard.

## Credit & graduation

New resellers take stock **on credit** against a credit limit (Jeffy owns it until sold —
retention of title). As they build a cash cushion they **buy upfront** for a bigger margin,
which lowers Jeffy's credit exposure over time.

## The Wish List (demand + marketing)

Customers submit products they wish Jeffy stocked. The **"agrees"/votes are the internal
sourcing signal** — they tell Jeffy what to import. Separately, each week Jeffy runs a **random
draw** and grants one wish free (the public giveaway / marketing). The draw is a CPA s36
promotional competition with published rules (`/wish-list-rules`).

## Key pages & endpoints (current)

| Area | Path |
|------|------|
| Reseller signup | `/distributors/join` |
| Reseller dashboard (magic-link) | `/distributors/dashboard` |
| Admin — resellers | `/admin/distributors` |
| Admin — finance (live) | `/admin/finance` |
| Admin — wholesale prices | `/admin/wholesale` |
| Dispatch stock to a reseller (credit-checked) | `POST /api/admin/distributors/dispatch` |
| Checkout (routes + splits) | `POST /api/checkout` |
| PayFast webhook (settles ledger) | `/api/webhooks/payfast` |
| Weekly Wish List draw (cron) | `/api/cron/wishlist-draw` |
| Process a return | `POST /api/admin/returns/process` |
| Wish List rules | `/wish-list-rules` |

## Retired (do not use)

The old **zone-partner / 50% profit-share** model is retired. Its routes still exist in the repo
but are disconnected from the live order path (hygiene removal pending). The buy-sell
`/distributors` model is canonical.
