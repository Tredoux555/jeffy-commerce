# Variant-Image Sync Implementation Plan v5 (FINAL)

## Problem
Tapping a color swatch doesn't update the main product image.

## Root Cause
`ProductImageGallery` and `AddToCartWithVariants` are sibling client components with no shared state.

---

## Solution Architecture

```
BEFORE:
┌─────────────────────────────────────────────────────────┐
│ page.tsx (Server)                                       │
│ ├── ProductDetailClient (tracks recently viewed)        │
│ ├── ProductImageGallery ← own selectedIndex state       │
│ └── AddToCartWithVariants ← own selectedVariant state   │
│                                                         │
│     ❌ No connection between variant and image          │
└─────────────────────────────────────────────────────────┘

AFTER:
┌─────────────────────────────────────────────────────────┐
│ page.tsx (Server) - fetches data, passes FULL product   │
│ └── ProductClient (Client) ← owns selectedVariant       │
│     ├── ProductImageGallery ← receives variantImage     │
│     └── VariantSelector/AddToCart ← controlled by parent│
│                                                         │
│     ✅ Parent syncs variant selection to image display  │
└─────────────────────────────────────────────────────────┘
```

---

## All Fixes Applied (v2 → v5)

| Issue | Fix |
|-------|-----|
| Cart type mismatch | Pass FULL Product object |
| Hydration flash | useState with initializer function |
| Broken images | onError fallback to primary image |
| Quantity sticks | Resets to 1 after add |
| No build test | Explicit `npm run build` step |
| Missing "Select an Option" | Added needsVariantSelection logic |
| Plain text buttons | Use Lucide icons (ShoppingCart, Plus, Minus, Check) |
| Inconsistent styling | Use Button component from ui/button |
| Selection behavior change | Documented: selects first variant even if OOS |
| Missing attributes field | Added `attributes?: Record<string, string>` to Variant |

---

## File Changes (4 files)

### File 1: MODIFY `src/app/products/[slug]/product-image-gallery.tsx`

Add `variantImage` prop with error handling.

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  discountPercent: number;
  variantImage?: string | null;
}

export function ProductImageGallery({ 
  images, 
  productName, 
  discountPercent,
  variantImage
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [useVariantImage, setUseVariantImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  // When variant changes, show variant image and reset error state
  useEffect(() => {
    setUseVariantImage(true);
    setImageError(false);
  }, [variantImage]);

  // Determine what to display
  const displayImage = (useVariantImage && variantImage && !imageError) 
    ? variantImage 
    : (images[selectedIndex] || images[0]);

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setUseVariantImage(false);
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setUseVariantImage(false);
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setUseVariantImage(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setUseVariantImage(false);
  };

  if (!images.length && !variantImage) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
        No image
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
        <img 
          src={displayImage} 
          alt={productName}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        
        {discountPercent > 0 && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
            Save {discountPercent}%
          </span>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {useVariantImage && variantImage && !imageError ? 'Variant' : `${selectedIndex + 1} / ${images.length}`}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                !useVariantImage && index === selectedIndex 
                  ? 'ring-2 ring-[#ff6b35] ring-offset-2' 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img 
                src={img} 
                alt={`Thumbnail ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### File 2: NEW `src/app/products/[slug]/product-client.tsx`

Client wrapper with all fixes applied.

```tsx
'use client';

import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { ProductImageGallery } from './product-image-gallery';
import { VariantSelector } from '@/components/variant-selector';
import { ShareButtons } from '@/components/share-buttons';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import type { Product } from '@/types/database';

interface Variant {
  name: string;
  image?: string;
  in_stock: boolean;
  price_adjustment?: number;
  sku_suffix?: string;
  attributes?: Record<string, string>;
}

interface ProductClientProps {
  product: Product;
  variants: Variant[];
  images: string[];
  features: string[];
  specs: Record<string, string>;
  categoryName?: string | null;
  categorySlug?: string | null;
}

export function ProductClient({ 
  product, 
  variants, 
  images, 
  features, 
  specs,
  categoryName,
  categorySlug,
}: ProductClientProps) {
  // Initialize with first in-stock variant, or first variant if all OOS
  // Note: This means a variant is always selected if variants exist (better UX)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(() => {
    if (variants.length === 0) return null;
    return variants.find(v => v.in_stock) || variants[0];
  });
  
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Variant selection state
  const hasVariants = variants.length > 0;
  const needsVariantSelection = hasVariants && !selectedVariant;

  // Price calculations
  const hasDiscount = product.compare_at_price_cents && 
    product.compare_at_price_cents > product.selling_price_cents;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.selling_price_cents / product.compare_at_price_cents!) * 100)
    : 0;
  const finalPrice = selectedVariant?.price_adjustment 
    ? product.selling_price_cents + selectedVariant.price_adjustment
    : product.selling_price_cents;

  // Variant image (only if variant has one)
  const variantImage = selectedVariant?.image || null;

  // Stock status
  const isOutOfStock = product.quantity <= 0 || 
    (selectedVariant ? !selectedVariant.in_stock : false);

  const handleAddToCart = () => {
    if (needsVariantSelection) return;
    
    const variantId = selectedVariant 
      ? selectedVariant.name.replace(/\s+/g, '-').toLowerCase() 
      : undefined;
    
    // Create product with adjusted price for cart
    const productForCart = {
      ...product,
      selling_price_cents: finalPrice,
    };
    
    addItem(productForCart, quantity, variantId, selectedVariant?.name);
    
    setAdded(true);
    setQuantity(1); // Reset quantity after adding
    setTimeout(() => setAdded(false), 2000);
  };

  const handleVariantChange = (variant: Variant) => {
    setSelectedVariant(variant);
  };

  const incrementQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
      {/* LEFT: Image Gallery */}
      <ProductImageGallery 
        images={images} 
        productName={product.name} 
        discountPercent={hasDiscount ? discountPercent : 0}
        variantImage={variantImage}
      />

      {/* RIGHT: Product Info */}
      <div>
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <a href="/products" className="hover:text-gray-700">Products</a>
          {categoryName && categorySlug && (
            <>
              <span className="mx-2">/</span>
              <a 
                href={`/products?category=${categorySlug}`} 
                className="hover:text-gray-700"
              >
                {categoryName}
              </a>
            </>
          )}
        </nav>

        {/* Title */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <ShareButtons url={`/products/${product.slug}`} title={product.name} />
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-3xl font-bold text-gray-900">
            {formatCurrency(finalPrice)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xl text-gray-400 line-through">
                {formatCurrency(product.compare_at_price_cents!)}
              </span>
              <span className="bg-red-100 text-red-700 text-sm font-medium px-2 py-1 rounded">
                -{discountPercent}% OFF
              </span>
            </>
          )}
        </div>

        {/* Stock Status */}
        <div className="mb-6">
          {product.quantity > 10 ? (
            <span className="text-green-600 font-medium">✓ In Stock</span>
          ) : product.quantity > 0 ? (
            <span className="text-orange-600 font-medium">
              Only {product.quantity} left!
            </span>
          ) : (
            <span className="text-red-600 font-medium">Out of Stock</span>
          )}
        </div>

        {/* Short Description */}
        {product.short_description && (
          <p className="text-gray-600 mb-6">{product.short_description}</p>
        )}

        {/* Variant Selector */}
        {hasVariants && (
          <VariantSelector
            variants={variants}
            selectedVariant={selectedVariant}
            onSelectVariant={handleVariantChange}
            basePrice={product.selling_price_cents}
          />
        )}

        {/* Quantity + Add to Cart */}
        <div className="space-y-4 mb-8">
          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Quantity:</span>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1 || isOutOfStock}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
              <button
                onClick={incrementQuantity}
                disabled={quantity >= product.quantity || isOutOfStock}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || needsVariantSelection}
            size="lg"
            className={`w-full ${added ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {added ? (
              <>
                <Check className="h-5 w-5 mr-2" />
                Added to Cart!
              </>
            ) : needsVariantSelection ? (
              'Select an Option'
            ) : isOutOfStock ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="border-t pt-6 mb-6">
            <h3 className="font-semibold mb-3">Features</h3>
            <ul className="space-y-2">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-600">
                  <span className="text-[#ff6b35] mt-1">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Description</h3>
            <div className="text-gray-600 prose prose-sm max-w-none whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}

        {/* Specifications */}
        {Object.keys(specs).length > 0 && (
          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-3">Specifications</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {Object.entries(specs).slice(0, 10).map(([key, value]) => (
                <div key={key} className="contents">
                  <dt className="text-gray-500">{key}</dt>
                  <dd className="text-gray-900">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### File 3: SIMPLIFY `src/app/products/[slug]/page.tsx`

Pass FULL product object. Clean category extraction.

```tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductClient } from './product-client';
import { ProductDetailClient } from './product-detail-client';
import { RelatedProducts } from '@/components/related-products';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (!product) {
    notFound();
  }

  // Prepare data
  const images = product.images?.length 
    ? product.images 
    : (product.primary_image_url ? [product.primary_image_url] : []);
  const variants = product.source_data?.variants || [];
  const features = product.source_data?.features || [];
  const specs = product.source_data?.specs || {};
  
  // Extract category info (comes as object from join)
  const category = product.categories as { name: string; slug: string } | null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Track recently viewed */}
      <ProductDetailClient product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.selling_price_cents,
        image: product.primary_image_url,
      }} />

      {/* Main product section */}
      <ProductClient
        product={product}
        variants={variants}
        images={images}
        features={features}
        specs={specs}
        categoryName={category?.name}
        categorySlug={category?.slug}
      />

      {/* Related products */}
      <RelatedProducts 
        currentProductId={product.id} 
        categoryId={product.category_id} 
      />
    </div>
  );
}
```

---

### File 4: DELETE `src/app/products/[slug]/add-to-cart-with-variants.tsx`

No longer needed - functionality merged into `ProductClient`.

```bash
rm src/app/products/[slug]/add-to-cart-with-variants.tsx
```

---

## Behavior Changes (Documented)

| Behavior | Old | New | Reason |
|----------|-----|-----|--------|
| Initial variant selection | First in-stock only | First in-stock OR first variant | Better UX - always shows something selected |
| Quantity after add | Stays same | Resets to 1 | Prevents accidental bulk adds |
| Image on variant tap | No change | Instantly updates | The whole point of this work |

---

## Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| Variant has image | Main image shows variant image instantly |
| Variant has NO image | Main image stays on product image |
| Variant image URL broken (404) | Falls back to product image |
| User clicks thumbnail | Shows that angle, variant still selected |
| User selects new variant | Resets to show variant image (if exists) |
| User adds to cart | Quantity resets to 1, button shows "✓ Added" |
| No variants exist | Works normally, no variant logic runs |
| All variants out of stock | First variant selected, button shows "Out of Stock" |
| Page loads with variants | First in-stock variant pre-selected (no hydration flash) |
| No variant selected but variants exist | Button shows "Select an Option" |

---

## Implementation Steps

### Step 1: Modify product-image-gallery.tsx
Add `variantImage` prop and error handling.

### Step 2: Create product-client.tsx
New file with shared state wrapper.

### Step 3: Simplify page.tsx
Replace JSX with `<ProductClient />`.

### Step 4: Delete old file
```bash
rm src/app/products/[slug]/add-to-cart-with-variants.tsx
```

### Step 5: Build test (CRITICAL)
```bash
cd ~/Desktop/jeffy-mvp
npm run build
```
Must pass with 0 TypeScript errors.

### Step 6: Local dev test
```bash
npm run dev
```
Open http://localhost:3000/products/[any-product-slug]

**Test checklist:**
- [ ] Tap swatch → image changes
- [ ] Tap thumbnail → shows that angle
- [ ] Tap different swatch → image changes again
- [ ] Add to cart → shows "✓ Added", quantity resets
- [ ] Add to cart → cart icon updates

### Step 7: Push to Railway
```bash
git add -A
git commit -m "feat: sync variant selection with product image"
git push
```

### Step 8: Verify on live site
```
https://jeffy.co.za/products/[any-product-slug]
```

---

## Files Summary

| File | Action | Lines Changed |
|------|--------|---------------|
| `product-image-gallery.tsx` | MODIFY | +25 |
| `product-client.tsx` | NEW | ~230 |
| `page.tsx` | SIMPLIFY | -90 |
| `add-to-cart-with-variants.tsx` | DELETE | -115 |

Net: ~50 new lines, cleaner architecture.

---

## Success Criteria

- [ ] `npm run build` passes with 0 errors
- [ ] Tapping swatch changes main image instantly
- [ ] Variant with no image keeps showing product image
- [ ] Broken image URL falls back gracefully  
- [ ] Button shows "Select an Option" when no variant selected
- [ ] Button shows shopping cart icon when ready
- [ ] "Add to Cart" works and resets quantity to 1
- [ ] "✓ Added to Cart!" shows with check icon
- [ ] No hydration mismatch warnings in console
- [ ] Works on mobile (swatches tappable, image updates)

---

## Audit History

| Version | Issues Found | Status |
|---------|--------------|--------|
| v1 | Architecture gap, no code | ❌ |
| v2 | Type mismatch, hydration, no error handling | ❌ |
| v3 | Missing icons, button component, "Select an Option" | ❌ |
| v4 | Missing `attributes` in Variant interface | ❌ |
| v5 | All fixes applied | ✅ |

---

## Ready to Build

All issues addressed. Code is complete and matches existing patterns.

Say: **"Build it"**
