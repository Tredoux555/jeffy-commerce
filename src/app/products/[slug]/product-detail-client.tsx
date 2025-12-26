'use client';

import { useTrackProductView, RecentlyViewedProducts } from '@/components/recently-viewed';

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
    selling_price_cents: product.price,
    primary_image_url: product.image || undefined,
  });

  return <RecentlyViewedProducts currentProductId={product.id} />;
}
