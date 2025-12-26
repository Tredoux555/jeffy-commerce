'use client';

import { useRecentlyViewedStore } from '@/lib/recently-viewed-store';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

// Export helper function for adding products
export function addToRecentlyViewed(product: {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}) {
  useRecentlyViewedStore.getState().addProduct(product);
}

interface RecentlyViewedProps {
  excludeProductId?: string;
  maxItems?: number;
}

export function RecentlyViewed({ excludeProductId, maxItems = 4 }: RecentlyViewedProps) {
  const { getProducts } = useRecentlyViewedStore();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<ReturnType<typeof getProducts>>([]);

  useEffect(() => {
    setMounted(true);
    setProducts(getProducts(excludeProductId).slice(0, maxItems));
  }, [excludeProductId, maxItems, getProducts]);

  if (!mounted || products.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-gray-400" />
        Recently Viewed
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.productId} href={`/products/${product.slug}`}>
            <div className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition group">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">{product.name}</h3>
                <p className="text-[#ff6b35] font-bold">{formatCurrency(product.price)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
