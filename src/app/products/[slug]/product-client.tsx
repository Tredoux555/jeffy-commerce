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
