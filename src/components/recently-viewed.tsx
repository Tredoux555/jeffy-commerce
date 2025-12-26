'use client';

import { useEffect, useState } from 'react';
import { Clock, X, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Product type for recently viewed
interface ViewedProduct {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  compare_price_cents?: number;
  image_url?: string;
  viewedAt: number;
}

// Zustand store for recently viewed
interface RecentlyViewedStore {
  products: ViewedProduct[];
  addProduct: (product: Omit<ViewedProduct, 'viewedAt'>) => void;
  removeProduct: (id: string) => void;
  clearAll: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],
      
      addProduct: (product) => set((state) => {
        // Remove if already exists
        const filtered = state.products.filter(p => p.id !== product.id);
        // Add to beginning with timestamp
        const newProducts = [
          { ...product, viewedAt: Date.now() },
          ...filtered,
        ].slice(0, 20); // Keep max 20
        return { products: newProducts };
      }),
      
      removeProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id),
      })),
      
      clearAll: () => set({ products: [] }),
    }),
    {
      name: 'jeffy-recently-viewed',
    }
  )
);

// Hook to track product view
export function useTrackProductView(product: Omit<ViewedProduct, 'viewedAt'> | null) {
  const addProduct = useRecentlyViewedStore((state) => state.addProduct);

  useEffect(() => {
    if (product) {
      addProduct(product);
    }
  }, [product?.id]);
}

// Recently viewed section component
interface RecentlyViewedProps {
  excludeProductId?: string;
  maxItems?: number;
  showClearButton?: boolean;
}

export function RecentlyViewed({ excludeProductId, maxItems = 6, showClearButton = false }: RecentlyViewedProps) {
  const { products, clearAll } = useRecentlyViewedStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const displayProducts = products
    .filter(p => p.id !== excludeProductId)
    .slice(0, maxItems);

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          Recently Viewed
        </h2>
        {showClearButton && (
          <button onClick={clearAll} className="text-sm text-gray-500 hover:text-gray-700">
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayProducts.map((product) => (
          <RecentlyViewedCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

// Individual recently viewed card
function RecentlyViewedCard({ product }: { product: ViewedProduct }) {
  const removeProduct = useRecentlyViewedStore((state) => state.removeProduct);
  const discount = product.compare_price_cents
    ? Math.round((1 - product.price_cents / product.compare_price_cents) * 100)
    : 0;

  return (
    <div className="group relative">
      <a
        href={`/products/${product.slug}`}
        className="block bg-white rounded-xl border overflow-hidden hover:shadow-md transition"
      >
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
              -{discount}%
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.name}</h3>
          <div className="flex items-baseline gap-1">
            <span className="text-[#ff6b35] font-bold">{formatCurrency(product.price_cents)}</span>
            {product.compare_price_cents && (
              <span className="text-xs text-gray-400 line-through">
                {formatCurrency(product.compare_price_cents)}
              </span>
            )}
          </div>
        </div>
      </a>
      
      {/* Remove button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          removeProduct(product.id);
        }}
        className="absolute top-2 right-2 p-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-white"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>
    </div>
  );
}

// Compact horizontal scroll version
export function RecentlyViewedCompact({ excludeProductId }: { excludeProductId?: string }) {
  const products = useRecentlyViewedStore((state) => state.products);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const displayProducts = products.filter(p => p.id !== excludeProductId).slice(0, 10);

  if (displayProducts.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          Recently Viewed
        </h3>
        <a href="/products" className="text-sm text-[#ff6b35] flex items-center gap-1 hover:underline">
          View All <ChevronRight className="h-4 w-4" />
        </a>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
        {displayProducts.map((product) => (
          <a
            key={product.id}
            href={`/products/${product.slug}`}
            className="flex-shrink-0 w-24"
          >
            <div className="w-24 h-24 rounded-lg bg-white border overflow-hidden mb-2">
              {product.image_url ? (
                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">📦</div>
              )}
            </div>
            <p className="text-xs line-clamp-1">{product.name}</p>
            <p className="text-xs font-bold text-[#ff6b35]">{formatCurrency(product.price_cents)}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
