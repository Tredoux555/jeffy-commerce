'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  viewedAt: number;
}

interface RecentlyViewedStore {
  products: RecentProduct[];
  addProduct: (product: Omit<RecentProduct, 'viewedAt'>) => void;
  clearHistory: () => void;
}

export const useRecentlyViewed = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],
      
      addProduct: (product) => {
        const current = get().products;
        // Remove if already exists
        const filtered = current.filter(p => p.id !== product.id);
        // Add to front with timestamp
        const updated = [
          { ...product, viewedAt: Date.now() },
          ...filtered
        ].slice(0, 10); // Keep only 10 most recent
        
        set({ products: updated });
      },
      
      clearHistory: () => set({ products: [] }),
    }),
    {
      name: 'jeffy-recently-viewed',
    }
  )
);
