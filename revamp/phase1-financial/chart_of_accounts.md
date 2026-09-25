# Chart of Accounts — Jeffy Commerce (Pty) Ltd

Designed for a South African importer (China → DTC) on **Xero**, not yet VAT-registered. Account codes follow Xero's default numbering so you can map onto a standard SA template. Import-specific accounts are flagged ⚑.

## Revenue (200–259)
| Code | Account | Notes |
|---|---|---|
| 200 | Product Sales | Gross sales, ZAR |
| 260 | Shipping Recovered | Delivery charged to customers (if any) |
| 270 | Discounts & Promotions | Contra-revenue (negative) |

## Cost of Goods Sold (300–399) — the landed-cost stack ⚑
| Code | Account | Notes |
|---|---|---|
| 310 | Product Purchases (supplier, CNY) ⚑ | Factory/1688 cost at ZAR paid |
| 315 | Inbound Freight (sea/air) ⚑ | International freight to SA port |
| 320 | Marine Insurance ⚑ | |
| 325 | Customs Import Duty ⚑ | Per HS code |
| 330 | Import VAT (sunk) ⚑ | **Non-recoverable while unregistered — true cost** |
| 335 | Clearing & Forwarding ⚑ | Agent, SAD500, port handling |
| 340 | Inland Freight (port→warehouse) ⚑ | |
| 350 | Inventory Adjustments / Shrinkage | |
| 360 | FX Gains/Losses on Purchases ⚑ | CNY payment vs book rate |

> All of 310–340 roll into **landed cost** and are capitalised to Inventory (630), then released to COGS as units sell. Keep the per-shipment landed-cost workings in `Jeffy_Financial_Model.xlsx`.

## Operating Expenses (400–599)
| Code | Account | Notes |
|---|---|---|
| 405 | Advertising & Marketing (CAC) | Meta/Google ad spend |
| 410 | Last-Mile Delivery | Courier to customer |
| 415 | Packaging & Fulfilment | |
| 420 | Payment Processing Fees | PayFast 3.2%+R2, payout fees |
| 425 | Software & Subscriptions | Xero, hosting, domain, email |
| 430 | Returns & Refunds | |
| 440 | Bank Charges | Nedbank fees, SWIFT/TT fees |
| 450 | Professional Fees | Accountant, clearing agent retainer |
| 460 | Office / Admin | |
| 470 | Bad Debts | |

## Assets (600–699)
| Code | Account | Notes |
|---|---|---|
| 610 | Nedbank Business Current (1307614477) | Primary bank |
| 615 | PayFast Clearing | Sales in transit before payout — reconcile to payouts |
| 630 | Inventory — Stock on Hand ⚑ | At landed cost |
| 640 | Goods in Transit ⚑ | Paid-for stock on the water |
| 650 | Prepayments / Supplier Deposits ⚑ | Factory deposits before shipment |

## Liabilities (800–899)
| Code | Account | Notes |
|---|---|---|
| 820 | VAT Control | **Dormant until VAT-registered** |
| 825 | Provisional Tax Payable | IRP6 |
| 830 | Income Tax Payable | ITR14 |
| 840 | Shareholder Loan | Director funds in/out |

## Equity (900–999)
| Code | Account | Notes |
|---|---|---|
| 910 | Share Capital | |
| 960 | Retained Earnings | |
| 970 | Current Year Earnings | |

---
**Key principle:** never expense product purchases directly. Capitalise the full landed cost to **Inventory (630)**, then recognise **COGS (310–340)** only as units sell. This keeps gross margin truthful — the #1 thing missing from the current system.
