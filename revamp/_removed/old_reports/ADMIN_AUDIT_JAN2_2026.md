# ADMIN DASHBOARD AUDIT - January 2, 2026

## CRITICAL ISSUES

### 1. BROKEN: `/admin/products/translate-images` 
**Status:** ❌ BROKEN
**Problem:** Dynamic route `[id]` catches "translate-images" as a product ID, shows "Product Not Found"
**Fix Required:** Move to `/admin/image-translator` (standalone, not nested under products)

### 2. STALE DATA: Analytics & Survey Pages
**Status:** ⚠️ USING WRONG COLUMNS
- `/admin/analytics` - Uses `current_agrees`, `want_agrees` (System A)
- `/admin/survey` - Uses `survey_votes` (System A)
**Problem:** Live system uses `verified_count` (System B)
**Fix Required:** Update to use correct columns OR remove from nav until fixed

---

## PAGE STATUS BY CATEGORY

### ✅ PRODUCTION READY (Using Real Data)
| Page | URL | Status | Notes |
|------|-----|--------|-------|
| Dashboard | `/admin` | ✅ | Basic stats |
| Products | `/admin/products` | ✅ | Full CRUD |
| Categories | `/admin/categories` | ✅ | Full CRUD |
| Orders | `/admin/orders` | ✅ | Full management |
| **Wants** | `/admin/wants` | ✅ | **JUST FIXED** |
| Zone Partners | `/admin/partners` | ✅ | Full management |
| Notifications | `/admin/notifications` | ✅ | Queue management |
| OEM Research | `/admin/oem-research` | ✅ | Supplier research |
| 1688 Factories | `/admin/factories` | ✅ | Factory database |
| Outreach | `/admin/outreach` | ✅ | **1476 lines, very complete** |
| Roadmap | `/admin/roadmap` | ✅ | Launch planning |
| Commissions | `/admin/commissions` | ✅ | Real data |
| Refunds | `/admin/refunds` | ✅ | Real data |
| Reviews | `/admin/reviews` | ✅ | Real data |
| Seed Docs | `/admin/seed-docs` | ✅ | Utility tool |

### ⚠️ NEEDS FIXING
| Page | URL | Problem |
|------|-----|---------|
| Translate Images | `/admin/products/translate-images` | Broken routing |
| Analytics | `/admin/analytics` | Wrong want columns |
| Survey/Wants Stats | `/admin/survey` | Wrong want columns |

### 📦 SCAFFOLDED (Mock Data - Future Use)
| Page | URL | Notes |
|------|-----|-------|
| Activity | `/admin/activity` | Admin audit log - mock |
| Customers | `/admin/customers` | Segmentation - mock |
| Inventory | `/admin/inventory` | Stock management - mock |
| Promotions | `/admin/promotions` | Promo codes - mock |
| Reports | `/admin/reports` | Sales reports - mock |
| Zones | `/admin/zones` | Zone management - needs work |

---

## IMAGE TOOLS COMPARISON

### Two Different Tools (NOT duplicates):

| Tool | Location | Purpose |
|------|----------|---------|
| Image Processor | `/admin/image-processor` | **Extract & translate TEXT** from image URLs |
| Translate Images | `/admin/products/translate-images` | **Replace Chinese with English** in uploaded images |

**Recommendation:** Keep both, but:
1. Move "Translate Images" to `/admin/image-translator` (fix routing)
2. Add both to nav under "Sourcing" section
3. Rename for clarity:
   - "Image Text Extractor" (processor)
   - "Image Translator" (translate-images)

---

## RECOMMENDED NAV RESTRUCTURE

```
CORE OPERATIONS
├── Dashboard
├── Analytics ⚠️ (needs fix)
├── Products
├── Categories
├── Orders
└── Notifications

WANTS SYSTEM
├── Wants Dashboard
└── (remove Wants Stats until fixed)

ZONE PARTNERS
├── Applications
└── Zones

SOURCING & PROCUREMENT
├── Procurement
├── Smart Finder (already exists under procurement)
├── OEM Research
├── 1688 Factories
├── Image Text Extractor (NEW - was image-processor)
└── Image Translator (NEW - was translate-images)

GROWTH
├── Influencer Outreach
└── Launch Roadmap

FINANCE (hidden until needed)
├── Commissions
├── Refunds
└── Reports

UTILITIES (hidden until needed)
├── Reviews
├── Seed Docs
├── Activity Log
├── Customer Segments
├── Inventory
└── Promotions
```

---

## IMMEDIATE ACTION PLAN

### Priority 1: Fix Broken (Do Now)
1. Move `/admin/products/translate-images` → `/admin/image-translator`
2. Add to nav under "Sourcing"

### Priority 2: Remove Stale (Do Now)
1. Remove "Wants Stats" from nav (uses wrong columns)
2. Fix or hide Analytics page (uses wrong columns)

### Priority 3: Clean Up (Later)
1. Move scaffolded pages to `_archive` folder
2. Simplify nav by hiding unused sections
3. Add "Image Text Extractor" to nav

---

## FILES TO MODIFY

```
1. src/app/admin/layout.tsx - Update nav
2. src/app/admin/image-translator/page.tsx - NEW (move from products/translate-images)
3. DELETE: src/app/admin/products/translate-images/ (after moving)
```

---

Want me to implement these fixes now?
