'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, X } from 'lucide-react';
import { useRecentlyViewed } from '@/lib/recently-viewed-store';
import { formatCurrency } from '@/lib/utils';

export function RecentlyViewed() {
  const { products, clearHistory } = useRecentlyViewed();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          Recently Viewed
        </h2>
        <button 
          onClick={clearHistory}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="flex-shrink-0 w-32 group"
          >
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  No image
                </div>
              )}
            </div>
            <p className="text-sm font-medium line-clamp-1">{product.name}</p>
            <p className="text-sm text-[#ff6b35] font-bold">{formatCurrency(product.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
