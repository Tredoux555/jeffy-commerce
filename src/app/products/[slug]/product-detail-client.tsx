'use client';

import { useEffect } from 'react';
import { addToRecentlyViewed, RecentlyViewed } from '@/components/recently-viewed';

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
  useEffect(() => {
    addToRecentlyViewed(product);
  }, [product]);

  return <RecentlyViewed excludeId={product.id} />;
}
