# HANDOFF: Zone Partner Model Finalized
**Date:** 2026-01-03
**Session Focus:** Zone Partner legal structure and commercial model

---

## CRITICAL DECISION MADE

**REJECTED: Consignment Model**
- Stock belongs to Jeffy until sold
- ZP just holds and delivers
- 50/50 "profit split"

**WHY REJECTED:**
1. Fails Section 200A LRA independence test
2. ZP bears no business risk = disguised employment  
3. Jeffy absorbs unsold stock = negative cash flow
4. Doesn't scale (limited by Jeffy's capital)
5. Trust issues with collections

---

**ADOPTED: Wholesale + Trade Credit (Net 7)**

| Aspect | Model |
|--------|-------|
| Stock ownership | Transfers to ZP at delivery |
| Pricing | ZP sets their own retail prices |
| Risk | ZP bears risk of unsold stock |
| Profit | ZP keeps ALL profit above wholesale cost |
| Payment | Net 7 (pay within 7 days of delivery) |
| Legal status | Buyer-seller (NOT employment) |

---

## THE STARTER PACKAGE

```
Deposit:           R500 (refundable after 3 cycles)
First stock order: R2,500 value
ZP pays upfront:   R500 (deposit only)
Balance due:       R2,000 within 7 days

Marketing message: "Start your business for R500"
```

---

## WEEKLY CYCLE

```
Monday:    Stock delivered to ZP
Mon-Sun:   ZP sells to customers at their prices
Sunday:    ZP pays Jeffy wholesale cost via EFT
Monday:    New stock delivered, cycle repeats
```

---

## MONEY FLOW

```
Agent cost (to Jeffy):     ~R60 per unit
Jeffy sells to ZP at:      R100 (wholesale)
ZP sells to customer at:   R199 (retail, their choice)
ZP profit:                 R99 (100% theirs)
Jeffy margin:              R40 (from wholesale markup)
```

**No "50/50 split" - that language is gone.** 
ZP buys wholesale, sells retail, keeps the difference.

---

## LEGAL PROTECTIONS (Why this is NOT employment)

1. ✅ Stock ownership transfers at delivery (ZP owns it)
2. ✅ ZP sets their own retail prices (business autonomy)
3. ✅ ZP bears risk if stock doesn't sell (real business risk)
4. ✅ ZP can work for other companies (Uber, Mr D, Makro)
5. ✅ ZP can hire own staff / subcontract
6. ✅ ZP provides own vehicle, phone, fuel
7. ✅ No fixed hours or supervision
8. ✅ Payment is for goods, not time worked

---

## FILES UPDATED THIS SESSION

| File | Status | Purpose |
|------|--------|---------|
| `/src/components/zone-partner-agreement.tsx` | Updated | Full wholesale agreement |
| `/src/components/zone-partner-explainer.tsx` | Created | 1-page "How It Works" |
| `/src/app/zone-partner/page.tsx` | Updated | Marketing page ("Start for R500") |
| `/src/data/life-os/mission-control.json` | Updated | Full model documentation |

---

## WHAT'S IN THE AGREEMENT NOW

1. **Section 1:** Independent business owner status (NOT employee)
2. **Section 2:** How stock buying works (deposit + trade credit)
3. **Section 3:** Ownership and risk (ZP owns stock, ZP's risk)
4. **Section 4:** Exclusive zone territory
5. **Section 5:** Pricing (ZP sets own prices)
6. **Section 6:** Payment terms (Net 7, late payment = supply pause)
7. **Section 7:** ZP responsibilities (vehicle, phone, expenses, tax)
8. **Section 8:** Tax responsibilities (ITR12, provisional tax, VAT)
9. **Section 9:** Termination (10-day cooling off, 14-day notice)
10. **Section 10:** Governing law (South Africa)

---

## REMAINING TASKS (Not done this session)

| Task | Priority |
|------|----------|
| Build ZP payment tracking system | High |
| Define starter stock package (actual products) | High |
| Set up Agent payment schedule | High |
| Build ZP dashboard (stock, sales, payments) | Medium |
| Create ZP onboarding WhatsApp flow | Medium |
| Test full cycle: deposit → stock → sale → payment → restock | Critical |

---

## LEGAL RESEARCH COMPLETED

Deep dive on SA independent contractor law:
- Section 200A LRA (presumption of employment)
- BCEA Section 83A (same provisions)
- SARS Interpretation Note 17 (50% income test)
- Uber SA v NUPSAW case (gig worker classification)
- Takealot franchise model analysis
- Mr D / Uber Eats driver classification

**Key finding:** Wholesale buyer-seller relationship is cleanest legally. Consignment creates employment risk.

---

## CONTEXT FOR NEXT SESSION

1. **Zone Partner model is FINALIZED** - don't revisit unless specifically asked
2. **No more "50/50 split" language** - it's wholesale/retail now
3. **Trade credit is NOT a loan** - it's standard Net 7 payment terms
4. **Agreement and marketing are aligned** - both say "buy stock, keep profit"
5. **Mission Control has full documentation** - check `zone-partner-system` project

---

## KEY QUOTES FOR MESSAGING

**Marketing:**
- "Start your business for R500"
- "Buy wholesale. Sell retail. Keep the profit."
- "Your business, your prices, your profit"

**Legal:**
- "You are an INDEPENDENT BUSINESS OWNER"
- "Stock ownership transfers to YOU at delivery"
- "You are NOT a Jeffy employee"

---

## STOCK/MONEY PIPELINE (Full picture)

```
CHINA
  │
  ▼
Agent sources products
  │
  ▼
Agent's JHB warehouse (Jeffy holds NO stock)
  │
  ├──────────────────────────────────────┐
  ▼                                      │
Zone Partner A ◄── Weekly auto-ship ─────┤
  │                                      │
  ▼                                      │
Customers (COD)                          │
  │                                      │
  ▼                                      │
ZP keeps profit, pays wholesale to Jeffy │
  │                                      │
  ▼                                      │
Jeffy pays Agent (weekly lump sum) ◄─────┘
```

---

## COMMIT REFERENCE

```
Commit: dbe06ae
Message: MAJOR: Zone Partner model finalized - Wholesale + Trade Credit
```

---

**END HANDOFF**
