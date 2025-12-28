import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CompareItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

interface CompareStore {
  items: CompareItem[];
  addItem: (item: CompareItem) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  isInCompare: (id: string) => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const current = get().items;
        if (current.length >= 4) return; // Max 4 items
        if (current.some(i => i.id === item.id)) return;
        set({ items: [...current, item] });
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
      },
      
      clearAll: () => set({ items: [] }),
      
      isInCompare: (id) => get().items.some(i => i.id === id),
    }),
    {
      name: 'jeffy-compare',
    }
  )
);
