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
    addToRecentlyViewed({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
    });
  }, [product]);

  return <RecentlyViewed excludeProductId={product.id} />;
}
