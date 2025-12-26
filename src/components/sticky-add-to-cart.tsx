'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';

interface StickyAddToCartProps {
  productId: string;
  productName: string;
  price: number;
  image?: string | null;
  slug: string;
  inStock: boolean;
}

export function StickyAddToCart({ productId, productName, price, image, slug, inStock }: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 400px
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({
      id: productId,
      name: productName,
      slug,
      selling_price_cents: price,
      primary_image_url: image || null,
      quantity: 999,
    } as any, 1);
    
    setTimeout(() => setIsAdding(false), 500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40 transform transition-transform duration-300 animate-slide-up">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Product Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {image && (
              <img src={image} alt="" className="w-12 h-12 rounded-lg object-cover hidden sm:block" />
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm truncate">{productName}</p>
              <p className="text-[#ff6b35] font-bold">{formatCurrency(price)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={scrollToTop}
              className="p-2 hover:bg-gray-100 rounded-lg transition hidden sm:block"
            >
              <ChevronUp className="h-5 w-5 text-gray-500" />
            </button>
            
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isAdding}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition ${
                inStock 
                  ? 'bg-[#ff6b35] text-white hover:bg-orange-600' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              } ${isAdding ? 'scale-95' : ''}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {inStock ? (isAdding ? 'Added!' : 'Add to Cart') : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
