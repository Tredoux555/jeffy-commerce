'use client';

import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/lib/wishlist-store';
import { useState, useEffect } from 'react';

interface WishlistButtonProps {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  variant?: 'icon' | 'button';
  className?: string;
}

export function WishlistButton({ productId, name, slug, price, image, variant = 'icon', className = '' }: WishlistButtonProps) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    setMounted(true);
    setInWishlist(isInWishlist(productId));
  }, [productId, isInWishlist]);

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      removeItem(productId);
      setInWishlist(false);
    } else {
      addItem({ productId, name, slug, price, image });
      setInWishlist(true);
    }
  };

  if (!mounted) return null;

  if (variant === 'button') {
    return (
      <button
        onClick={toggle}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${
          inWishlist 
            ? 'bg-red-50 border-red-200 text-red-600' 
            : 'border-gray-300 text-gray-600 hover:border-red-300 hover:text-red-500'
        } ${className}`}
      >
        <Heart className={`h-5 w-5 ${inWishlist ? 'fill-red-500' : ''}`} />
        {inWishlist ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className={`p-2 rounded-full transition ${
        inWishlist 
          ? 'bg-red-100 text-red-500' 
          : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
      } ${className}`}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart className={`h-5 w-5 ${inWishlist ? 'fill-red-500' : ''}`} />
    </button>
  );
}
