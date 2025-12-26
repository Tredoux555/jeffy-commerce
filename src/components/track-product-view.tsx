'use client';

import { useEffect } from 'react';
import { useRecentlyViewedStore } from '@/lib/recently-viewed-store';

interface TrackProductViewProps {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

export function TrackProductView({ productId, name, slug, price, image }: TrackProductViewProps) {
  const { addProduct } = useRecentlyViewedStore();

  useEffect(() => {
    addProduct({ productId, name, slug, price, image });
  }, [productId, name, slug, price, image, addProduct]);

  return null;
}
