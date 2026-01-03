# JEFFY BULK IMPORT & VARIANTS SYSTEM - DESIGN DOC
## Date: January 3, 2026

---

## PROBLEM STATEMENT

### Current Issues:
1. **Manual Import**: Each product must be imported one-by-one via "Send to Jeffy" button
2. **No Variants**: Jeffy currently doesn't support product variants (colors, sizes, lengths)
3. **80+ Color Options**: Hair products have 50-80 color variants each
4. **Time Intensive**: 90 products × manual entry = hours of work

### Goals:
1. Bulk import 90+ products from 1688 links
2. Support product variants like 1688 does
3. Maintain pricing formula automation
4. Enable Zone Partners to order specific variants

---

## PROPOSED SOLUTION

### PHASE 1: Bulk Import API (Immediate)

**New API Endpoint:** `POST /api/import/1688/bulk`

```typescript
// Request body
{
  "links": [
    "https://detail.1688.com/offer/581430625604.html",
    "https://detail.1688.com/offer/790136960770.html",
    // ... more links
  ],
  "default_category": "hair-braids",
  "auto_price": true,  // Apply pricing formula
  "status": "draft"    // Don't publish until reviewed
}

// Response
{
  "success": true,
  "imported": 85,
  "failed": 5,
  "failed_links": ["..."],
  "products": [
    {
      "id": "prod_xxx",
      "title": "30 Inch Crochet Braids",
      "1688_url": "https://detail.1688.com/offer/...",
      "status": "draft"
    }
  ]
}
```

**Implementation:**
1. Accept array of 1688 links
2. For each link, scrape product data (reuse existing scraper)
3. Apply pricing formula
4. Save as draft products
5. Return summary

---

### PHASE 2: Product Variants System

**Database Schema Changes:**

```sql
-- New table: product_variants
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  -- Variant attributes
  variant_name VARCHAR(100) NOT NULL,     -- "1b", "27#", "1b/27"
  variant_type VARCHAR(50) NOT NULL,      -- "color", "size", "length"
  variant_value VARCHAR(100),             -- Display name: "Natural Black"
  
  -- Pricing (can override base price)
  price_adjustment DECIMAL(10,2) DEFAULT 0,  -- +R20 for ombre
  
  -- Stock
  in_stock BOOLEAN DEFAULT true,
  
  -- 1688 reference
  sku_1688 VARCHAR(100),                  -- Original SKU from 1688
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_type ON product_variants(variant_type);
```

**Product Model Update:**

```typescript
interface Product {
  id: string;
  title: string;
  description: string;
  base_price: number;
  images: string[];
  category: string;
  
  // NEW: Variants
  has_variants: boolean;
  variant_types: string[];  // ["color", "length"]
  variants: ProductVariant[];
}

interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;      // "1b"
  variant_type: string;      // "color"
  variant_value: string;     // "Natural Black"
  price_adjustment: number;  // 0 or +20
  in_stock: boolean;
  sku_1688: string;
}
```

---

### PHASE 3: UI Components

**1. Variant Selector (Customer-facing)**

```tsx
// components/VariantSelector.tsx
interface VariantSelectorProps {
  product: Product;
  onVariantSelect: (variant: ProductVariant) => void;
}

// Shows color swatches, size buttons, etc.
// Updates price display based on selection
// Requires selection before "Add to Cart"
```

**2. Variant Manager (Admin)**

```tsx
// admin/components/VariantManager.tsx
// - Import variants from 1688 automatically
// - Toggle individual variants on/off
// - Set price adjustments
// - Bulk enable/disable colors
```

**3. Order with Variants**

```sql
-- Update order_items table
ALTER TABLE order_items ADD COLUMN variant_id UUID REFERENCES product_variants(id);
ALTER TABLE order_items ADD COLUMN variant_details JSONB;  -- Snapshot of variant at time of order
```

---

### PHASE 4: Variant Import Automation

When importing from 1688, automatically extract variants:

```typescript
async function extractVariants(productPage: string): Promise<Variant[]> {
  // Parse the 1688 product page
  // Look for color/size selectors
  // Extract:
  //   - Variant name (1b, 27#, etc.)
  //   - Variant image if available
  //   - Price difference if any
  //   - SKU
  
  // For hair products, common pattern:
  // "30 inches 1b" -> { type: "color", name: "1b", value: "Natural Black" }
  // "30 inches 1b/27" -> { type: "color", name: "1b/27", value: "Black/Honey Ombre" }
}
```

**Color Mapping Table:**

```typescript
const HAIR_COLOR_MAP: Record<string, string> = {
  "1b": "Natural Black",
  "1": "Jet Black", 
  "2#": "Dark Brown",
  "4#": "Medium Brown",
  "27#": "Honey Blonde",
  "30#": "Auburn",
  "33#": "Dark Auburn",
  "99j": "Burgundy Wine",
  "613#": "Platinum Blonde",
  "350": "Ginger",
  "1b/27": "Black to Honey Ombre",
  "1b/30": "Black to Auburn Ombre",
  "1b/613": "Black to Blonde Ombre",
  "1b/pink": "Black to Pink Ombre",
  "1b/blue": "Black to Blue Ombre",
  // ... etc
};
```

---

## IMPLEMENTATION PRIORITY

### Week 1: Bulk Import
1. [ ] Create `/api/import/1688/bulk` endpoint
2. [ ] Test with 10 products
3. [ ] Add admin UI to paste links and import

### Week 2: Basic Variants
1. [ ] Create `product_variants` table
2. [ ] Update product model
3. [ ] Create variant selector component
4. [ ] Update cart/checkout to include variants

### Week 3: Automation
1. [ ] Auto-extract variants from 1688
2. [ ] Color mapping for hair products
3. [ ] Bulk variant management UI

### Week 4: Polish
1. [ ] Variant images
2. [ ] Stock tracking per variant
3. [ ] Zone Partner variant ordering

---

## ALTERNATIVE: Simple Approach (MVP)

If full variants is too complex, simpler option:

**Create separate products per color family:**
- "Crochet Braids - Black Shades" (1b, 2#, 4#)
- "Crochet Braids - Blonde Shades" (27#, 613#)
- "Crochet Braids - Ombre Collection" (1b/27, 1b/30, etc.)
- "Crochet Braids - Fashion Colors" (pink, blue, purple)

**Pros:** No schema changes, works now
**Cons:** More products to manage, less professional

---

## RECOMMENDED NEXT STEPS

1. **Today:** Use the flat link list to import products one-by-one via existing "Send to Jeffy" button (manual but works)

2. **This week:** Build `/api/import/1688/bulk` endpoint to speed up imports

3. **Next sprint:** Implement full variant system

---

## FILES TO CREATE

```
jeffy-commerce/
├── lib/
│   └── variants/
│       ├── types.ts           # Variant interfaces
│       ├── color-mapping.ts   # Hair color translations
│       └── extractor.ts       # Extract variants from 1688
├── app/
│   └── api/
│       └── import/
│           └── 1688/
│               └── bulk/
│                   └── route.ts  # Bulk import endpoint
├── components/
│   └── products/
│       └── VariantSelector.tsx   # Customer variant picker
└── supabase/
    └── migrations/
        └── 004_product_variants.sql  # Schema migration
```

---

*Design Doc Created: 2026-01-03*
*Author: Claude (for Tredoux)*
