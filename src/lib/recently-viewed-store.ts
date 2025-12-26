import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentProduct {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  viewedAt: number;
}

interface RecentlyViewedStore {
  products: RecentProduct[];
  addProduct: (product: Omit<RecentProduct, 'viewedAt'>) => void;
  getProducts: (excludeId?: string) => RecentProduct[];
  clearHistory: () => void;
}

const MAX_RECENT = 10;

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (product) => {
        set((state) => {
          // Remove if already exists
          const filtered = state.products.filter((p) => p.productId !== product.productId);
          // Add to front with timestamp
          const updated = [{ ...product, viewedAt: Date.now() }, ...filtered];
          // Keep only last MAX_RECENT
          return { products: updated.slice(0, MAX_RECENT) };
        });
      },

      getProducts: (excludeId) => {
        const products = get().products;
        if (excludeId) {
          return products.filter((p) => p.productId !== excludeId);
        }
        return products;
      },

      clearHistory: () => set({ products: [] }),
    }),
    {
      name: 'jeffy-recently-viewed',
    }
  )
);
