'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';

interface StickyAddToCartProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string | null;
    inStock?: boolean;
  };
}

export function StickyAddToCart({ product }: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar after scrolling past 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    addItem(product as any, quantity);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 p-3 lg:hidden animate-slide-up">
      <div className="flex items-center gap-3">
        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{product.name}</p>
          <p className="text-[#ff6b35] font-bold">{formatCurrency(product.price)}</p>
        </div>

        {/* Quantity */}
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="p-2"
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="px-3 font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="p-2"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add to Cart */}
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="px-4"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Desktop sticky bar (appears at top)
export function StickyProductBar({ product }: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b shadow-md z-40 py-3 hidden lg:block animate-slide-down">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {product.image && (
            <img src={product.image} alt="" className="w-12 h-12 rounded object-cover" />
          )}
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-[#ff6b35] font-bold">{formatCurrency(product.price)}</p>
          </div>
        </div>

        <Button onClick={() => addItem(product as any, 1)}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

// Buy Now floating button
export function FloatingBuyButton({ product, onBuyNow }: StickyAddToCartProps & { onBuyNow: () => void }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={onBuyNow}
      className="fixed bottom-20 right-4 bg-[#ff6b35] text-white px-6 py-3 rounded-full shadow-lg z-40 flex items-center gap-2 hover:bg-orange-600 transition lg:hidden animate-bounce-subtle"
    >
      <ShoppingCart className="h-5 w-5" />
      Buy Now
    </button>
  );
}
