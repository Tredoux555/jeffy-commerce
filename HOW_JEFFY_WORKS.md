# How Jeffy Works
### A Simple Guide to the Pre-Launch System

---

## The Big Picture

Jeffy has **3 ways people can engage** before launch:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  COMING SOON    │    │     WANTS       │    │  ZONE PARTNERS  │
│   (Customers)   │    │   (Products)    │    │   (Delivery)    │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ Join waitlist   │    │ Request products│    │ Apply to deliver│
│ Get position #  │    │ Vote on others  │    │ in your area    │
│ Share & earn    │    │ 50 votes = made │    │ Earn 50% profit │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 1. COMING SOON PAGE (Customer Waitlist)
**URL:** https://jeffy.co.za/coming-soon

### What It Does
- People sign up with email + name
- They get a **position number** (#1, #2, #47, etc.)
- They get a unique **referral code** (like `a3f8b2`)

### The Viral Loop
```
Person signs up → Gets email with referral link
                         ↓
              Shares with friends
                         ↓
         Friends sign up using their link
                         ↓
    Original person's referral count goes UP
                         ↓
         They unlock rewards (tiers)
```

### Reward Tiers
| Referrals | Tier Name  | Reward                    |
|-----------|------------|---------------------------|
| 3         | Supporter  | 10% Launch Discount       |
| 5         | Insider    | Priority Access           |
| 10        | Star       | 20% Launch Discount       |
| 25        | Champion   | R200 Store Credit         |
| 50        | Legend     | Founder Kit + Free Product|

### What The Email Contains
When someone signs up, they instantly get an email:
- Their position (#47 in line!)
- Their referral link
- WhatsApp share button (one tap to share)
- Progress to next reward tier

---

## 2. WANTS PAGE (Product Requests)
**URL:** https://jeffy.co.za/wants

### What It Does
- Anyone can **request a product** they want Jeffy to sell
- Other people can **vote** on products
- When a product hits **50 votes**, Jeffy sources it

### The Magic: First Requester Gets It FREE
```
You request "Solar Power Bank"
         ↓
You share it, people vote
         ↓
It hits 50 votes
         ↓
Jeffy sources it from China
         ↓
YOU get the first one FREE! 🎁
(Everyone else can buy it)
```

### Current Products (Seeded)
| Product                    | Category    | Votes |
|----------------------------|-------------|-------|
| Solar Power Bank 20000mAh  | Electronics | 1     |
| Xiaomi Robot Vacuum S10    | Home        | 1     |
| Portable Air Conditioner   | Home        | 1     |
| Ring Light 18" with Stand  | Electronics | 1     |
| Electric Standing Desk     | Office      | 1     |
| Kids Smart Watch with GPS  | Kids        | 1     |

### How Voting Works
- Click on a product → Enter email → Vote
- One vote per email per product
- Products sorted by vote count (most popular first)

---

## 3. ZONE PARTNERS PAGE (Delivery Network)
**URL:** https://jeffy.co.za/zone-partners

### What It Does
Zone Partners are **local delivery entrepreneurs** who:
- Handle last-mile delivery in their area
- Keep **50% of the profit** on each delivery
- Build their own business with low startup cost

### The 16 South African Zones
```
GAUTENG          WESTERN CAPE      KWAZULU-NATAL
├── Joburg North ├── Cape Town CBD ├── Durban Central
├── Joburg South ├── Cape Flats    ├── Durban North
├── Sandton      ├── Northern      ├── Pietermaritzburg
├── Soweto       └── Winelands     
├── Pretoria                       OTHER
├── East Rand                      ├── Port Elizabeth
└── West Rand                      ├── Bloemfontein
                                   └── Polokwane
```

### How Sign-Up Works
1. Pick a zone from the map
2. Fill in application (name, email, phone, zone)
3. Jeffy reviews and approves
4. Partner gets onboarded with training

### Position Benefits
- **Position 1-3** in a zone: First pick of orders, Founding Partner badge
- **Earlier = Better**: More orders, better routes, established reputation

---

## How The Pieces Connect

```
                    ┌──────────────────┐
                    │   JEFFY.CO.ZA    │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ /coming-soon  │    │    /wants     │    │/zone-partners │
│               │    │               │    │               │
│ "I want to    │    │ "I want this  │    │ "I want to    │
│  buy stuff"   │    │  product"     │    │  deliver"     │
│               │    │               │    │               │
│ → Waitlist    │    │ → Product DB  │    │ → Partner DB  │
│ → Email sent  │    │ → Vote system │    │ → Review queue│
└───────────────┘    └───────────────┘    └───────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   LAUNCH DAY     │
                    │  Jan 20, 2025    │
                    ├──────────────────┤
                    │ • Customers get  │
                    │   early access   │
                    │                  │
                    │ • Top-voted      │
                    │   products live  │
                    │                  │
                    │ • Zone Partners  │
                    │   start delivery │
                    └──────────────────┘
```

---

## The Business Model (Why This Works)

### For Customers
- **China-direct prices** (skip SA middlemen)
- **Wants system** = only stock what people actually want
- **Referral rewards** = free stuff for sharing

### For Zone Partners
- **50% profit share** (not wages, real ownership)
- **Low startup** (R10-30k vs R500k for franchise)
- **Local expertise** (they know their neighborhood)

### For Jeffy
- **No inventory risk** (only source after 50 votes)
- **Free marketing** (referral viral loop)
- **Distributed delivery** (partners, not employees)

### The Mission
Every purchase funds **free schools**. The commerce is just the engine - the goal is education for South Africans who have merit but lack opportunity.

---

## Quick Reference

### URLs
| Page | URL |
|------|-----|
| Customer Waitlist | https://jeffy.co.za/coming-soon |
| Product Wants | https://jeffy.co.za/wants |
| Zone Partners | https://jeffy.co.za/zone-partners |

### APIs (for nerds)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/waitlist | POST | Sign up |
| /api/waitlist | GET | Get count |
| /api/wants/public | POST | Request product |
| /api/wants/public | GET | List products |
| /api/wants/vote | POST | Vote on product |
| /api/zone-partners | POST | Apply as partner |

### Database Tables
| Table | What It Stores |
|-------|----------------|
| waitlist | Customer signups + referral codes |
| wants | Product requests |
| want_votes | Who voted for what |
| users | People who requested products |

---

## What To Do Now

1. **Share the waitlist link** with 5-10 people
2. **Watch signups come in** (check Supabase or /api/waitlist)
3. **See referrals work** (people using each other's codes)
4. **Review Zone Partner applications** when they come

The system runs itself. Your job is just to share the links and watch it grow.

---

*Last updated: Dec 31, 2025*
