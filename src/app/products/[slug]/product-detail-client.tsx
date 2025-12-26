'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/lib/recently-viewed-store';
import { RecentlyViewed } from '@/components/recently-viewed';

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
  };
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const addProduct = useRecentlyViewed((state) => state.addProduct);

  // Track product view on mount
  useEffect(() => {
    addProduct({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
    });
  }, [product.id]);

  return null; // Recently viewed shown elsewhere
}
