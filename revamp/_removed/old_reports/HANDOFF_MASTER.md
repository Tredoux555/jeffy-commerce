# JEFFY COMMERCE - MASTER HANDOFF
## Date: January 4, 2026 (Updated)

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
**Purpose:** Township supplier directory (NOT starter kits)
**Audience:** Township hustlers (suppliers) + local buyers (customers)

**THE MODEL:**
```
┌─────────────────────────────────────────────────────────┐
│                    THE SPAZA PROJECT                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   HUSTLER (Supplier)              CUSTOMER               │
│   ──────────────────              ────────               │
│   1. Has own stock                1. Browses jeffy.co.za │
│   2. Registers on Jeffy           2. Sees product        │
│   3. Lists their location         3. Clicks "Find Local" │
│   4. Gets customers from us       4. Sees nearest hustler│
│   5. Handles sale directly        5. WhatsApp them       │
│                                   6. Buys from hustler   │
│                                                          │
│   WE ARE THE MIDDLEMAN FOR DISCOVERY, NOT SALES          │
└─────────────────────────────────────────────────────────┘
```

**Benefits:**
- No inventory risk for Jeffy
- Hustlers source stock however they want
- Jeffy is a directory, not a warehouse
- Scales infinitely
- Hustlers WANT to register (free customers)

**Status:** BUILT ✅ (Jan 4, 2026)

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

---

## 🗄️ DATABASE TABLES

### Existing Tables (working):
- `products` - 175 products with source_data containing variants, CNY prices
- `wants` - Community product requests
- `categories` - Product categories
- `zone_partners` - Formal partner applications
- `orders`, `order_items` - E-commerce orders

### NEW Tables Needed:

**1. followers table:**
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

**2. suppliers table (for Spaza Project):**
```sql
CREATE TABLE suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(20),
  location_name VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  products_available TEXT[],
  categories TEXT[],
  bio TEXT,
  profile_image_url TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_suppliers_location ON suppliers(latitude, longitude) WHERE status = 'active';
CREATE INDEX idx_suppliers_status ON suppliers(status);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active suppliers" ON suppliers FOR SELECT USING (status = 'active');
CREATE POLICY "Anyone can register as supplier" ON suppliers FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role has full access to suppliers" ON suppliers FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

GRANT SELECT ON suppliers TO anon;
GRANT INSERT ON suppliers TO anon;
GRANT ALL ON suppliers TO authenticated;
GRANT ALL ON suppliers TO service_role;
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
| **Suppliers** | `/admin/suppliers` | **Manage supplier registrations** |

### Public Pages:
| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Wants platform landing |
| Wants | `/wants` | Browse/vote on wants |
| Products | `/products` | Product catalog |
| Hustle | `/hustle` | **Spaza supplier directory landing** |
| Kit Catalog | `/hustle/kit` | View all products with prices |
| **Supplier Register** | `/hustle/register` | **Register as a supplier** |

### API Routes:
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/suppliers/register` | POST | Register new supplier |
| `/api/suppliers/search` | GET | Search active suppliers |
| `/api/admin/suppliers` | GET/PATCH/DELETE | Admin supplier management |

### Components:
| Component | Purpose |
|-----------|---------|
| `components/follow-form.tsx` | Reusable follower signup form |
| `components/product-card.tsx` | Product display card |
| **`components/supplier-finder.tsx`** | **"Find Local Supplier" modal** |

---

## ✅ COMPLETED THIS SESSION (Jan 4)

### Previously Done:
1. **Variants UI** - Product editor shows variants with images
2. **Agent Order Page** - Bilingual order generator for China agent
3. **Category Fixer Page** - UI to delete/fix problem products
4. **Pricing Fix Script** - Ready to apply sea freight formula
5. **Followers System** - API + admin page + form component
6. **Kit Catalog** - `/hustle/kit` showing all products with prices

### Just Built (Session 2):
7. **Supplier Registration** - `/hustle/register` with 3-step form
8. **Supplier Search API** - `/api/suppliers/search` with category filter
9. **Admin Suppliers Page** - `/admin/suppliers` to approve/manage
10. **Supplier Finder Component** - `supplier-finder.tsx` for products
11. **Updated Hustle Landing** - Now reflects supplier directory model

---

## ❌ NOT DONE YET

### Immediate (before launch):
1. **Run SQL migrations** in Supabase:
   - `followers` table
   - `suppliers` table
2. **Delete 18 bad products** via `/admin/category-fixer`
3. **Fix 14 category issues** via `/admin/category-fixer`
4. **Apply pricing fix** - `node scripts/fix-pricing-sea-freight.js --apply`

### Future Enhancements:
1. **Add supplier finder to product pages** - integrate component
2. **Supplier public profiles** - `/supplier/[id]` page
3. **Location-based search** - use lat/lng for "near me" feature
4. **Supplier analytics** - track how many views/contacts

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
- **Supplier Registration:** https://jeffy.co.za/hustle/register
- **Kit Catalog:** https://jeffy.co.za/hustle/kit
- **Admin:** https://jeffy.co.za/admin
- **Admin Suppliers:** https://jeffy.co.za/admin/suppliers
- **GitHub:** https://github.com/Tredoux555/jeffy-commerce

---

## 📞 CONTACT

- **WhatsApp:** +27 73 843 9496 (linked to site)

---

## 🎯 NEXT SESSION PRIORITIES

1. **Run the SQL** - Create `followers` and `suppliers` tables
2. **Clean up products** - delete 18, fix 14 categories
3. **Test supplier registration** - register a test supplier
4. **Test admin approval** - approve supplier, verify they appear in search
5. **Integrate supplier finder** - add to product detail pages

---

*Last updated: Jan 4, 2026, Session 2*
