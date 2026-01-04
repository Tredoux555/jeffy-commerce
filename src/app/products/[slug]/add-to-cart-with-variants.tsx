'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import type { Product } from '@/types/database';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';
import { VariantSelector } from '@/components/variant-selector';

interface Variant {
  name: string;
  image?: string;
  in_stock: boolean;
  price_adjustment?: number;
  sku_suffix?: string;
  attributes?: Record<string, string>;
}

interface AddToCartWithVariantsProps {
  product: Product;
  variants?: Variant[];
}

export function AddToCartWithVariants({ product, variants = [] }: AddToCartWithVariantsProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  // Auto-select first in-stock variant
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      const firstInStock = variants.find(v => v.in_stock);
      if (firstInStock) {
        setSelectedVariant(firstInStock);
      }
    }
  }, [variants, selectedVariant]);

  const hasVariants = variants.length > 0;
  const needsVariantSelection = hasVariants && !selectedVariant;

  // Calculate final price with variant adjustment
  const finalPrice = selectedVariant?.price_adjustment 
    ? product.selling_price_cents + selectedVariant.price_adjustment
    : product.selling_price_cents;

  const handleAddToCart = () => {
    if (needsVariantSelection) return;
    
    // Create variant ID from variant name for cart
    const variantId = selectedVariant ? selectedVariant.name.replace(/\s+/g, '-').toLowerCase() : undefined;
    
    addItem(
      { ...product, selling_price_cents: finalPrice },
      quantity,
      variantId,
      selectedVariant?.name
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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

  const isOutOfStock = product.quantity <= 0 || (selectedVariant && !selectedVariant.in_stock);

  return (
    <div className="space-y-4">
      {/* Variant Selector */}
      {hasVariants && (
        <VariantSelector
          variants={variants}
          selectedVariant={selectedVariant}
          onSelectVariant={setSelectedVariant}
          basePrice={product.selling_price_cents}
        />
      )}

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
          <span className="px-4 py-2 font-medium">{quantity}</span>
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
        ) : (
          <>
            <ShoppingCart className="h-5 w-5 mr-2" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </>
        )}
      </Button>
    </div>
  );
}
