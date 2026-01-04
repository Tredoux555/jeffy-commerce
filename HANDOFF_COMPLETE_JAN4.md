# JEFFY COMMERCE - COMPLETE HANDOFF
## January 4, 2026

---

# 🎯 THE MISSION

## The Big Picture

Tredoux is building **Jeffy Commerce** - a South African e-commerce platform that sources products from China (1688.com) and sells them locally. But this isn't just about selling products.

**THE REAL GOAL:** Use commerce profits to fund **free merit-based schools** in South Africa where graduates receive:
- 1 hectare of land
- A self-built house
- Production facilities
- Skills to manufacture food, tech, medicine, and clothing

The first school will be built on Tredoux's family farm (valued at R300M, purchased for R30M). The family previously built a school for local children but corruption destroyed it. This is redemption.

**Philosophy:** "South Africans are the most capable people on the planet - they just need opportunity."

---

# 🏗️ TWO PARALLEL SYSTEMS

Jeffy runs two systems simultaneously:

## System 1: THE WANTS PLATFORM (jeffy.co.za)

**What it is:** Community-driven product sourcing

**How it works:**
1. User submits a "Want" (product they need)
2. Community votes on Wants
3. 10+ verified votes → Product gets sourced from China
4. Product goes live on store
5. Revenue funds the school mission

**Purpose:** 
- Build community engagement
- Let the market decide what to source
- Create media/influencer story ("community funds schools")

**Status:** ✅ Built and working

---

## System 2: THE SPAZA PROJECT (jeffy.co.za/hustle)

**What it is:** Township supplier directory

**The Model:**
```
┌─────────────────────────────────────────────────────────┐
│                    THE SPAZA PROJECT                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   HUSTLER (Supplier)              CUSTOMER               │
│   ──────────────────              ────────               │
│   1. Has own stock                1. Browses jeffy.co.za │
│   2. Registers on Jeffy (free)    2. Sees product        │
│   3. Lists their location         3. Clicks "Find Local" │
│   4. Gets customers from us       4. Sees nearest hustler│
│   5. Handles sale directly        5. WhatsApps them      │
│                                   6. Buys from hustler   │
│                                                          │
│        JEFFY = DISCOVERY PLATFORM, NOT WAREHOUSE         │
└─────────────────────────────────────────────────────────┘
```

**Why this model:**
- ❌ NOT starter kits (we don't hold inventory)
- ❌ NOT us shipping products (no logistics headache)
- ✅ We're Craigslist for Spaza - pure discovery
- ✅ Zero operational risk
- ✅ Scales infinitely
- ✅ Hustlers WANT to register (free customers)

**Purpose:**
- Quick revenue while Wants builds momentum
- Build network of township suppliers
- Low barrier to entry for hustlers

**Status:** ✅ Built and ready to launch

---

# 📊 WHAT WAS DONE TODAY (Jan 4, 2026)

## Session 1: Supplier System Built

### Created:
| Component | Location | Purpose |
|-----------|----------|---------|
| Supplier Registration | `/hustle/register` | 3-step form for hustlers |
| Supplier Search API | `/api/suppliers/search` | Find suppliers by category/location |
| Supplier Register API | `/api/suppliers/register` | Handle registrations |
| Admin Suppliers | `/admin/suppliers` | Approve/manage suppliers |
| Admin Suppliers API | `/api/admin/suppliers` | Admin operations |
| Supplier Finder | `components/supplier-finder.tsx` | "Find Local Supplier" modal |
| Updated Hustle Landing | `/hustle` | Reflects directory model |

### Database:
- Created `suppliers` table in Supabase
- RLS policies for public read, anon insert, service role full access

---

## Session 2: Full System Audit

### 1. PRICING FIXED ✅

**The Problem:** Old pricing used air freight formula (R75/item) creating 8-60x markups. Products were too expensive for township market.

**Example of the problem:**
- ¥8 product was selling for R255 (should be ~R55)
- ¥2 product was selling for R205 (should be ~R15)

**The Fix:** New sea freight formula applied to ALL 130 products:

```
Landed Cost = CNY × 3.2 + R1 (sea freight per item)
Retail = Landed × 2.0 (rounded to R5)
Wholesale = Landed × 1.2 (hustler buy price)
Hustler Profit = Retail - Wholesale
```

**New Pricing Examples:**
| CNY Cost | Retail Price | Wholesale (Hustler Pays) | Hustler Profit |
|----------|--------------|--------------------------|----------------|
| ¥2       | R15          | R8                       | R7             |
| ¥8       | R55          | R32                      | R23            |
| ¥15      | R100         | R58                      | R42            |
| ¥30      | R195         | R116                     | R79            |
| ¥50      | R325         | R194                     | R131           |

**Result:** Prices reduced by 50-75%. Now Spaza-friendly.

### 2. PRODUCTS CLEANED ✅

**Started with:** 175 products

**Actions taken:**
- Deleted 19 products with Chinese company names (bad data)
- Fixed 13 products in "Other"/"Uncategorized" categories
- All products now properly categorized

**Final count:** 156 clean products

**Category Distribution:**
| Category | Count |
|----------|-------|
| Beauty & Skincare | 74 |
| Fashion & Accessories | 40 |
| Hair Care | 11 |
| Home & Living | 11 |
| Electronics | 7 |
| Sports & Outdoors | 5 |
| Health & Wellness | 3 |
| Baby & Kids | 3 |
| Office & Stationery | 1 |
| Adult | 1 |

### 3. SCRIPTS CREATED ✅

| Script | Purpose | Command |
|--------|---------|---------|
| `scripts/fix-pricing-direct.js` | Update all product prices | `node scripts/fix-pricing-direct.js --apply` |
| `scripts/cleanup-products.js` | Delete bad products, fix categories | `node scripts/cleanup-products.js --apply` |
| `scripts/audit-categories.js` | Audit product categories | `node scripts/audit-categories.js` |

---

# 📈 CURRENT STATE

## Products
| Metric | Value |
|--------|-------|
| Total Products | 156 |
| Products with Issues | 0 |
| Average Retail Price | ~R80 |
| Average Hustler Profit | ~R35 |
| Source | 1688.com (China) |

## Categories
- 10 active categories
- All products categorized
- No orphans

## Suppliers
- Table created ✅
- Registration flow built ✅
- Admin approval built ✅
- 0 suppliers registered (system just launched)

## Database Tables
| Table | Status | Purpose |
|-------|--------|---------|
| products | ✅ Working | 156 products from 1688 |
| categories | ✅ Working | 40 categories |
| wants | ✅ Working | Community product requests |
| suppliers | ✅ Working | Spaza supplier directory |
| followers | ⚠️ Needs RLS | Email/phone collection |
| zone_partners | ✅ Working | Formal partner applications |
| orders | ✅ Working | E-commerce orders |

---

# 🔧 ONE FIX NEEDED

The `followers` table needs RLS policies. Run in **Supabase SQL Editor**:

```sql
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert followers"
  ON followers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can read followers"
  ON followers FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role');

GRANT INSERT ON followers TO anon;
GRANT ALL ON followers TO service_role;
```

---

# 🌐 LIVE URLS

| Page | URL | Purpose |
|------|-----|---------|
| **Main Site** | https://jeffy.co.za | Wants platform |
| **Spaza Landing** | https://jeffy.co.za/hustle | Supplier directory landing |
| **Supplier Registration** | https://jeffy.co.za/hustle/register | Hustlers register here |
| **Product Catalog** | https://jeffy.co.za/hustle/kit | All products with prices |
| **Admin** | https://jeffy.co.za/admin | Main admin |
| **Admin Suppliers** | https://jeffy.co.za/admin/suppliers | Manage suppliers |
| **Admin Products** | https://jeffy.co.za/admin/products | Manage products |
| **Admin Category Fixer** | https://jeffy.co.za/admin/category-fixer | Fix product issues |

---

# 📁 PROJECT STRUCTURE

```
~/Desktop/jeffy-mvp/
├── src/
│   ├── app/
│   │   ├── hustle/
│   │   │   ├── page.tsx          # Spaza landing
│   │   │   ├── register/page.tsx # Supplier registration
│   │   │   └── kit/page.tsx      # Product catalog
│   │   ├── admin/
│   │   │   ├── suppliers/page.tsx # Manage suppliers
│   │   │   └── category-fixer/    # Fix products
│   │   └── api/
│   │       ├── suppliers/
│   │       │   ├── register/route.ts
│   │       │   └── search/route.ts
│   │       └── admin/suppliers/route.ts
│   └── components/
│       ├── supplier-finder.tsx   # Find local supplier modal
│       └── follow-form.tsx       # Email/phone collection
├── scripts/
│   ├── fix-pricing-direct.js     # Price updater
│   ├── cleanup-products.js       # Product cleaner
│   └── audit-categories.js       # Category audit
└── HANDOFF_*.md                  # Handoff documents
```

---

# 🚀 NEXT STEPS

## Immediate (Do Now)
1. ✅ ~~Fix pricing~~ DONE
2. ✅ ~~Clean products~~ DONE
3. ✅ ~~Build supplier system~~ DONE
4. 🔧 Run followers RLS fix (SQL above)
5. 📱 Test supplier registration flow

## This Week
1. **Get First Suppliers:**
   - Share `/hustle/register` link
   - Target: 10 suppliers in Soweto/Khayelitsha
   - Approve them at `/admin/suppliers`

2. **Integrate Supplier Finder:**
   - Add "Find Local Supplier" button to product pages
   - Show suppliers who stock each category

3. **Marketing:**
   - Send influencer outreach letters (28 prepared)
   - Target: Taddy Blecher, Joe Matimba, Motsepe Foundation

## Future
1. **1688 Pipeline:**
   - Auto-scrape products from 1688 links
   - Agent in China receives orders
   - Ships monthly → weekly

2. **Zone Partners:**
   - Formal franchise model
   - 50/50 profit sharing
   - R10-30K entry

3. **Schools:**
   - First school on family farm
   - Merit-based selection
   - Graduates get land + house + facility

---

# 🔧 QUICK COMMANDS

```bash
# Navigate to project
cd ~/Desktop/jeffy-mvp

# Start dev server
npm run dev

# Deploy (auto-deploys on push)
git add -A && git commit -m "message" && git push origin main

# Audit categories
node scripts/audit-categories.js

# Check pricing (no changes)
node scripts/fix-pricing-direct.js

# Apply pricing changes
node scripts/fix-pricing-direct.js --apply

# Clean products (dry run)
node scripts/cleanup-products.js

# Clean products (apply)
node scripts/cleanup-products.js --apply

# TypeScript check
npx tsc --noEmit
```

---

# 🔑 CREDENTIALS

**Supabase:**
- URL: `https://inhrgiakjyprabxluppv.supabase.co`
- Located in `.env.local`

**Admin Password:** 870602

**WhatsApp:** +27 73 843 9496

**GitHub:** https://github.com/Tredoux555/jeffy-commerce

---

# 📋 WORKFLOW RULES

1. **Claude writes ALL code** - Cursor is just the implementation agent
2. **Always give Cursor-ready prompts** - Complete files with exact paths
3. **Tredoux is non-technical** - No jargon, simple instructions only
4. **Direct SQLs for Supabase** - Copy-paste ready
5. **Segment, checkpoint, save** - Don't lose work on long tasks

---

# 🎯 THE VISION SUMMARY

```
TODAY:
├── Wants Platform (community sourcing)
└── Spaza Project (supplier directory)
        ↓
TOMORROW:
├── Revenue from both systems
└── First suppliers registered
        ↓
NEXT MONTH:
├── 100+ suppliers across townships
├── 1000+ products
└── Profitable operations
        ↓
NEXT YEAR:
├── Zone Partner network
├── Self-sustaining commerce
└── School fund growing
        ↓
THE GOAL:
├── Free merit-based schools
├── Graduates get land + house + facilities
├── Self-sufficient communities
└── "Plant trees under whose shade you'll never sit"
```

---

*Handoff complete. System ready. Let's build.*

*Last updated: January 4, 2026*
*Git: 7c6f8a1*
