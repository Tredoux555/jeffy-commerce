'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  selling_price_cents: number;
  primary_image_url?: string;
}

interface RecentlyViewedStore {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  clearAll: () => void;
}

const MAX_ITEMS = 12;

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],
      addProduct: (product) => {
        const current = get().products;
        // Remove if already exists
        const filtered = current.filter(p => p.id !== product.id);
        // Add to front, limit to MAX_ITEMS
        const updated = [product, ...filtered].slice(0, MAX_ITEMS);
        set({ products: updated });
      },
      removeProduct: (id) => {
        set({ products: get().products.filter(p => p.id !== id) });
      },
      clearAll: () => set({ products: [] }),
    }),
    {
      name: 'jeffy-recently-viewed',
    }
  )
);

// Hook to track product view
export function useTrackProductView(product: Product | null) {
  const addProduct = useRecentlyViewedStore(state => state.addProduct);

  useEffect(() => {
    if (product) {
      addProduct(product);
    }
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps
}

// Recently viewed products section
export function RecentlyViewedProducts({ currentProductId }: { currentProductId?: string }) {
  const products = useRecentlyViewedStore(state => state.products);
  const clearAll = useRecentlyViewedStore(state => state.clearAll);

  // Filter out current product
  const filtered = products.filter(p => p.id !== currentProductId);

  if (filtered.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-400" />
          Recently Viewed
        </h2>
        <button onClick={clearAll} className="text-sm text-gray-500 hover:text-gray-700">
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.slice(0, 6).map((product) => (
          <RecentlyViewedCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function RecentlyViewedCard({ product }: { product: Product }) {
  const removeProduct = useRecentlyViewedStore(state => state.removeProduct);

  return (
    <a href={`/products/${product.slug}`} className="group relative bg-white rounded-xl border overflow-hidden hover:shadow-md transition">
      <button
        onClick={(e) => { e.preventDefault(); removeProduct(product.id); }}
        className="absolute top-2 right-2 p-1 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white transition z-10"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="aspect-square bg-gray-100">
        {product.primary_image_url ? (
          <img
            src={product.primary_image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
        )}
      </div>

      <div className="p-3">
        <h3 className="text-sm font-medium line-clamp-2 mb-1">{product.name}</h3>
        <p className="text-[#ff6b35] font-bold">{formatCurrency(product.selling_price_cents)}</p>
      </div>
    </a>
  );
}

// Compact recently viewed (for sidebar/footer)
export function RecentlyViewedCompact() {
  const products = useRecentlyViewedStore(state => state.products);

  if (products.length === 0) return null;

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-400" />
        Recently Viewed
      </h3>
      <div className="space-y-3">
        {products.slice(0, 4).map((product) => (
          <a key={product.id} href={`/products/${product.slug}`} className="flex gap-3 hover:bg-gray-100 rounded-lg p-2 -mx-2 transition">
            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {product.primary_image_url ? (
                <img src={product.primary_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">📦</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-sm text-[#ff6b35] font-bold">{formatCurrency(product.selling_price_cents)}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
