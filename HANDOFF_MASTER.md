# JEFFY COMMERCE - MASTER HANDOFF
## Date: January 4, 2026

---

## 🎯 THE VISION (Two Parallel Systems)

### System 1: WANTS PLATFORM (jeffy.co.za)
**Purpose:** Community-driven product sourcing + school funding story
**Audience:** General public, influencers, media
**Flow:**
1. User submits a "Want" (product they need)
2. Community votes on Wants
3. 10+ verified votes → Product gets sourced from China
4. Product goes live on store
5. Revenue funds free merit-based schools

**Status:** Built and working ✅

---

### System 2: THE SPAZA PROJECT (jeffy.co.za/hustle)
**Purpose:** Township supplier network + income generation
**Audience:** Township hustlers, local buyers

**NEW VISION (not starter kits):**
- Hustlers = independent suppliers with their own stock
- They register on Jeffy with their location
- Customers browse Jeffy products
- Customer clicks "Find Local Supplier"
- We show nearest hustler who has that product
- Customer contacts hustler directly via WhatsApp
- Hustler handles sale and delivery

**This is a SUPPLIER DIRECTORY, not us selling kits.**

**Status:** Landing page built, supplier system NOT built yet ❌

---

## 📊 PRODUCT AUDIT STATUS

### Current State: 175 products from 1688

**Problems to Fix:**
| Issue | Count | Action |
|-------|-------|--------|
| Chinese company names | 18 | DELETE via `/admin/category-fixer` |
| Uncategorized | 4 | FIX category |
| In "Other" category | 10 | RECATEGORIZE |
| **Total issues** | **32** | |

**Clean Products:** ~132 with valid pricing

### Categories After Cleanup:
- Beauty & Skincare: 65
- Fashion & Accessories: 39
- Home & Living: 11
- Hair Care: 8
- Electronics: 7
- Sports & Outdoors: 5
- Health & Wellness: 3
- Baby & Kids: 3

---

## 💰 PRICING STATUS

**Current Problem:** Prices use OLD air freight formula (R75/item) = 8-60x markups
**Example:** ¥8 product → R255 (should be ~R70)

**Fix Script Ready:** `scripts/fix-pricing-sea-freight.js`

**New Formula (sea freight):**
```
Landed Cost = CNY × 3.2 + R1
Wholesale = Landed × 1.3 (for suppliers/partners)
Retail = Landed × 2.5 (rounded to R5)
```

**To Apply:** Run `node scripts/fix-pricing-sea-freight.js --apply` after deploy

**Note:** `/hustle/kit` page calculates correct prices on-the-fly regardless of DB state

---

## 🗄️ DATABASE TABLES

### Existing Tables (working):
- `products` - 175 products with source_data containing variants, CNY prices
- `wants` - Community product requests
- `categories` - Product categories
- `zone_partners` - Formal partner applications
- `orders`, `order_items` - E-commerce orders

### NEW Table Needed (followers):
```sql
CREATE TABLE followers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100),
  email VARCHAR(255),
  source VARCHAR(50) DEFAULT 'website',
  interests TEXT[],
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
**Run in Supabase SQL Editor** - API is ready, table not created yet.

### NEW Table Needed (suppliers - for Spaza Project):
```sql
CREATE TABLE suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(20),
  location_name VARCHAR(255), -- "Soweto, Diepkloof"
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  products_available TEXT[], -- product IDs they stock
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, inactive
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 📁 KEY FILES & PAGES

### Admin Pages:
| Page | URL | Purpose |
|------|-----|---------|
| Category Fixer | `/admin/category-fixer` | Delete bad products, fix categories |
| Agent Order | `/admin/agent-order` | Generate China shipping requests |
| Followers | `/admin/followers` | View/export follower list |
| Products | `/admin/products` | Product management |
| Starter Kit | `/admin/starter-kit` | Kit composition |

### Public Pages:
| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Wants platform landing |
| Wants | `/wants` | Browse/vote on wants |
| Products | `/products` | Product catalog |
| Hustle | `/hustle` | Spaza Project landing |
| Kit Catalog | `/hustle/kit` | View all products with prices |

### Scripts:
| Script | Purpose |
|--------|---------|
| `scripts/fix-pricing-sea-freight.js` | Fix product pricing |
| `scripts/audit-categories.js` | Audit product categories |
| `scripts/enrich-premium-v4.js` | AI product enrichment |

### Components:
| Component | Purpose |
|-----------|---------|
| `components/follow-form.tsx` | Reusable follower signup form |
| `components/product-card.tsx` | Product display card |

---

## ✅ COMPLETED THIS SESSION

1. **Variants UI** - Product editor shows variants with images
2. **Agent Order Page** - Bilingual order generator for China agent
3. **Category Fixer Page** - UI to delete/fix problem products
4. **Pricing Fix Script** - Ready to apply sea freight formula
5. **Followers System** - API + admin page + form component
6. **Spaza Project Landing** - `/hustle` with real product counts
7. **Kit Catalog** - `/hustle/kit` showing all products with prices

---

## ❌ NOT DONE YET

### Immediate (before launch):
1. **Run followers migration SQL** in Supabase
2. **Delete 18 bad products** via `/admin/category-fixer`
3. **Fix 14 category issues** via `/admin/category-fixer`
4. **Apply pricing fix** - `node scripts/fix-pricing-sea-freight.js --apply`

### For Spaza Supplier Network:
1. **Create suppliers table** in Supabase
2. **Supplier registration page** - `/hustle/register`
3. **Supplier profile page** - `/supplier/[id]`
4. **"Find Local Supplier" button** on products
5. **Location-based supplier search** - show nearest suppliers
6. **Supplier dashboard** - manage their product list

---

## 🔧 QUICK COMMANDS

```bash
# Navigate to project
cd ~/Desktop/jeffy-mvp

# Dev server
npm run dev

# TypeScript check
npx tsc --noEmit

# Category audit
node scripts/audit-categories.js

# Pricing analysis (view only)
node scripts/fix-pricing-sea-freight.js

# Apply pricing fix
node scripts/fix-pricing-sea-freight.js --apply

# Git push
git add -A && git commit -m "message" && git push origin main
```

---

## 🌐 LIVE URLS

- **Main Site:** https://jeffy.co.za
- **Spaza Project:** https://jeffy.co.za/hustle
- **Kit Catalog:** https://jeffy.co.za/hustle/kit
- **Admin:** https://jeffy.co.za/admin
- **GitHub:** https://github.com/Tredoux555/jeffy-commerce

---

## 📞 CONTACT

- **WhatsApp:** +27 73 843 9496 (linked to site)

---

## 🎯 NEXT SESSION PRIORITIES

1. **Clean up products** - delete 18, fix 14 categories
2. **Build supplier registration** - `/hustle/register`
3. **Build supplier finder** - "Find local supplier" on products
4. **Create suppliers table** in database

---

*Last updated: Jan 4, 2026, 08:30*
