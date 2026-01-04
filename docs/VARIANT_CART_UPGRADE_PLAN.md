# Jeffy Variant Cart Upgrade Plan

## Executive Summary

Transform Jeffy's single-variant-at-a-time cart flow into a **multi-variant quantity grid** that lets customers add multiple colors/options in one action. Based on conversion research: swatches beat dropdowns by 14.6%, sticky add-to-cart increases orders by 7.9%, and multi-variant grids dramatically reduce friction for beauty products.

---

## Current State Analysis

### What Works ✅
- **Swatch size**: 64px (w-16 h-16) - meets 48px minimum
- **Visual swatches**: Images show when available
- **Cart store**: Already supports `variantId` and `variantName`
- **Quick view modal**: Exists for fast product preview
- **Variant badge**: Shows "X Options" on product cards

### What Needs Improvement ❌
- **One variant at a time**: Must repeat flow for each color
- **Flex-wrap layout**: Gets messy with 20+ variants
- **No horizontal scroll**: Variants stack vertically on mobile
- **No sticky add-to-cart**: Button scrolls out of view
- **No "Notify Me"**: Out-of-stock variants dead-end
- **Add-to-cart button**: Doesn't stand out enough

---

## Implementation Phases

### Phase 1: Quick Wins (2-3 hours)
*Immediate conversion improvements with minimal code changes*

#### 1.1 Horizontal Scrolling Swatches
**File:** `src/components/variant-selector.tsx`

Replace `flex-wrap` with horizontal scroll for products with 8+ variants:

```tsx
// Show horizontal scroll when many variants
const useHorizontalScroll = uniqueVariants.length > 8;

<div className={useHorizontalScroll 
  ? "flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x" 
  : "flex flex-wrap gap-3"
}>
```

Add to `globals.css`:
```css
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

**Key detail**: Truncate last visible swatch (show partial) to signal scrollability.

#### 1.2 Differentiate Add-to-Cart Button
**File:** `src/components/ui/button.tsx` or inline

Make the primary CTA more prominent:

```tsx
// In AddToCartWithVariants
<Button
  className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-bold text-lg py-6 shadow-lg"
>
```

Research shows distinct button colors increase conversion by 18.4%.

#### 1.3 Show Variant Count Indicator
**File:** `src/components/variant-selector.tsx`

For scrollable variants, show position indicator:

```tsx
{useHorizontalScroll && (
  <p className="text-sm text-gray-500 mt-2">
    ← Swipe to see all {uniqueVariants.length} colors →
  </p>
)}
```

---

### Phase 2: Multi-Variant Quantity Grid (4-6 hours)
*The main feature - add multiple variants at once*

#### 2.1 New Component: MultiVariantGrid
**File:** `src/components/multi-variant-grid.tsx`

```tsx
interface MultiVariantGridProps {
  variants: Variant[];
  basePrice: number;
  onQuantitiesChange: (quantities: Record<string, number>) => void;
}

// UI: Each variant gets a row with:
// [Swatch Image] [Variant Name] [Stock Status] [-] [Qty] [+]
```

**Layout (Mobile)**:
```
┌─────────────────────────────────────┐
│ 🟤 Dark Brown          In Stock     │
│                        [-] 0 [+]    │
├─────────────────────────────────────┤
│ 🟡 Honey Blonde        Only 3 left! │
│                        [-] 2 [+]    │
├─────────────────────────────────────┤
│ ⚫ Natural Black       In Stock     │
│                        [-] 1 [+]    │
└─────────────────────────────────────┘
   Selected: 3 items • R1,650 total
   
   [  🛒 Add All to Cart  ]
```

**Layout (Desktop)**:
```
┌────────┬─────────────────┬────────────┬───────────┐
│ Swatch │ Variant Name    │ Stock      │ Quantity  │
├────────┼─────────────────┼────────────┼───────────┤
│ 🟤     │ Dark Brown      │ In Stock   │ [-] 0 [+] │
│ 🟡     │ Honey Blonde    │ 3 left     │ [-] 2 [+] │
│ ⚫     │ Natural Black   │ In Stock   │ [-] 1 [+] │
└────────┴─────────────────┴────────────┴───────────┘
```

#### 2.2 Toggle Between Views
Let users choose their preferred selection method:

```tsx
<div className="flex gap-2 mb-4">
  <button 
    onClick={() => setViewMode('swatches')}
    className={viewMode === 'swatches' ? 'active' : ''}
  >
    Quick Select
  </button>
  <button 
    onClick={() => setViewMode('grid')}
    className={viewMode === 'grid' ? 'active' : ''}
  >
    Buy Multiple Colors
  </button>
</div>
```

#### 2.3 Update Cart Store for Bulk Add
**File:** `src/lib/cart-store.ts`

```tsx
addMultipleVariants: (product: Product, variantQuantities: Record<string, { qty: number; name: string; price: number }>) => {
  set((state) => {
    const newItems = [...state.items];
    
    Object.entries(variantQuantities).forEach(([variantId, { qty, name, price }]) => {
      if (qty <= 0) return;
      
      const existingIndex = newItems.findIndex(
        item => item.productId === product.id && item.variantId === variantId
      );
      
      if (existingIndex > -1) {
        newItems[existingIndex].quantity += qty;
      } else {
        newItems.push({
          id: `${product.id}-${variantId}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: product.primary_image_url,
          price: price,
          quantity: qty,
          variantId,
          variantName: name,
        });
      }
    });
    
    return { items: newItems };
  });
},
```

#### 2.4 Running Total Display
Show live calculation as quantities change:

```tsx
const totalItems = Object.values(quantities).reduce((sum, q) => sum + q, 0);
const totalPrice = Object.entries(quantities).reduce((sum, [variantId, qty]) => {
  const variant = variants.find(v => v.name === variantId);
  const price = basePrice + (variant?.price_adjustment || 0);
  return sum + (price * qty);
}, 0);

<div className="sticky bottom-0 bg-white border-t p-4 shadow-lg">
  <div className="flex justify-between mb-2">
    <span>{totalItems} items selected</span>
    <span className="font-bold">{formatCurrency(totalPrice)}</span>
  </div>
  <Button disabled={totalItems === 0}>
    Add {totalItems} Items to Cart
  </Button>
</div>
```

---

### Phase 3: Sticky Add-to-Cart (2-3 hours)
*Keep purchase action always visible on mobile*

#### 3.1 Sticky Bottom Bar Component
**File:** `src/components/sticky-add-to-cart.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';

export function StickyAddToCart({ 
  price, 
  onAddToCart, 
  disabled,
  variantName 
}: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Show when main add-to-cart scrolls out of view
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(!entry.isIntersecting),
      { threshold: 0 }
    );
    
    const mainButton = document.getElementById('main-add-to-cart');
    if (mainButton) observer.observe(mainButton);
    
    return () => observer.disconnect();
  }, []);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50 md:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-bold">{formatCurrency(price)}</p>
          {variantName && <p className="text-sm text-gray-500">{variantName}</p>}
        </div>
        <Button 
          onClick={onAddToCart} 
          disabled={disabled}
          className="flex-1 max-w-[200px]"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
```

#### 3.2 Bottom Sheet for Variant Selection
When sticky bar is tapped without variant selected:

```tsx
// Opens from bottom, shows variant swatches
// User selects variant, then confirms
// Maintains product context visible behind overlay
```

---

### Phase 4: Notify Me for Out-of-Stock (2 hours)
*Capture demand for unavailable variants*

#### 4.1 Notify Button on Out-of-Stock Variants
**File:** `src/components/variant-selector.tsx`

```tsx
{!variant.in_stock && (
  <button 
    onClick={() => openNotifyModal(variant)}
    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white text-xs rounded-lg"
  >
    <span>Sold Out</span>
    <span className="underline">Notify Me</span>
  </button>
)}
```

#### 4.2 Simple Email Capture Modal
```tsx
<Dialog>
  <DialogTitle>Get notified when {variantName} is back</DialogTitle>
  <input type="email" placeholder="your@email.com" />
  <Button>Notify Me</Button>
</Dialog>
```

#### 4.3 Database Table
```sql
CREATE TABLE stock_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  variant_name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  notified_at timestamptz
);
```

---

## File Changes Summary

| File | Changes |
|------|---------|
| `src/components/variant-selector.tsx` | Horizontal scroll, notify me overlay |
| `src/components/multi-variant-grid.tsx` | NEW - quantity grid component |
| `src/components/sticky-add-to-cart.tsx` | NEW - mobile sticky bar |
| `src/app/products/[slug]/add-to-cart-with-variants.tsx` | Toggle view modes, bulk add |
| `src/lib/cart-store.ts` | `addMultipleVariants` method |
| `src/app/globals.css` | Scrollbar hide utility |
| `migrations/stock_notifications.sql` | NEW - notify me table |

---

## Priority Order

1. **Phase 1** (Do First) - Quick wins, 2-3 hours
   - Horizontal scroll ← Most impactful for your 10-30 variant products
   - Button differentiation ← +18.4% conversion potential
   
2. **Phase 2** (Main Feature) - Multi-variant grid, 4-6 hours
   - This is the key differentiator for beauty/hair products
   - Lets customers buy 3 colors in one click
   
3. **Phase 3** (Mobile UX) - Sticky bar, 2-3 hours
   - +7.9% order completion on mobile
   - Critical since most SA shoppers are mobile
   
4. **Phase 4** (Recovery) - Notify me, 2 hours
   - Captures lost sales from out-of-stock
   - Lower priority but easy win

---

## Success Metrics

- **Add-to-cart rate**: Measure before/after Phase 2
- **Items per order**: Should increase with multi-variant grid
- **Mobile conversion**: Should improve with sticky bar
- **Stock notification signups**: New metric from Phase 4

---

## Mockup References

### Multi-Variant Grid (Mobile)
```
┌─────────────────────────────────────────┐
│  Buy Multiple Colors                 ▼  │
├─────────────────────────────────────────┤
│ ┌────┐                                  │
│ │    │  Dark Brown                      │
│ │ 🟤 │  R550 • In Stock    [-] 0 [+]   │
│ └────┘                                  │
├─────────────────────────────────────────┤
│ ┌────┐                                  │
│ │    │  Honey Blonde                    │
│ │ 🟡 │  R550 • Only 3!     [-] 2 [+]   │
│ └────┘                                  │
├─────────────────────────────────────────┤
│ ┌────┐                                  │
│ │    │  Jet Black                       │
│ │ ⚫ │  R550 • In Stock    [-] 1 [+]   │
│ └────┘                                  │
├─────────────────────────────────────────┤
│                                         │
│  3 items selected           R1,650      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     🛒 Add 3 Items to Cart      │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Horizontal Scroll Swatches
```
┌─────────────────────────────────────────┐
│ Select Color: Honey Blonde              │
│                                         │
│ [🟤][🟡][⚫][🔴][🟠][🟢][🔵] ··· →      │
│                                         │
│ ← Swipe to see all 24 colors →          │
└─────────────────────────────────────────┘
```

---

## Ready to Start?

Say: **"Implement Phase 1 - horizontal scroll and button styling"**

Or: **"Build the multi-variant quantity grid"**
