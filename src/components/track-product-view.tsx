'use client';

import { useEffect } from 'react';
import { useRecentlyViewed } from '@/lib/recently-viewed-store';

interface TrackProductViewProps {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

export function TrackProductView({ productId, name, slug, price, image }: TrackProductViewProps) {
  const addProduct = useRecentlyViewed((state) => state.addProduct);

  useEffect(() => {
    addProduct({ id: productId, name, slug, price, image });
  }, [productId, name, slug, price, image, addProduct]);

  return null;
}
