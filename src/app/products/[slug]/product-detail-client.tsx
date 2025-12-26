'use client';

import { useTrackProductView, RecentlyViewed } from '@/components/recently-viewed';

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
  // Track product view
  useTrackProductView({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price_cents: product.price,
    image_url: product.image || undefined,
  });

  return <RecentlyViewed excludeProductId={product.id} />;
}
