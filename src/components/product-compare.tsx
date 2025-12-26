'use client';

import { useState } from 'react';
import { X, Plus, Check, Minus, Scale } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  specs?: Record<string, string>;
  rating?: number;
  reviewCount?: number;
}

// Compare store
interface CompareState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  isInCompare: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const current = get().items;
        if (current.length >= 4) return; // Max 4 items
        if (current.find(p => p.id === product.id)) return;
        set({ items: [...current, product] });
      },
      removeItem: (id) => set({ items: get().items.filter(p => p.id !== id) }),
      clearAll: () => set({ items: [] }),
      isInCompare: (id) => get().items.some(p => p.id === id),
    }),
    { name: 'jeffy-compare' }
  )
);

// Add to Compare Button
export function CompareButton({ product }: { product: Product }) {
  const { addItem, removeItem, isInCompare, items } = useCompareStore();
  const inCompare = isInCompare(product.id);
  const isFull = items.length >= 4;

  const handleClick = () => {
    if (inCompare) {
      removeItem(product.id);
    } else if (!isFull) {
      addItem(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isFull && !inCompare}
      className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg transition ${
        inCompare 
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
          : isFull 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Scale className="h-4 w-4" />
      {inCompare ? 'In Compare' : 'Compare'}
    </button>
  );
}

// Floating Compare Bar
export function CompareBar() {
  const { items, removeItem, clearAll } = useCompareStore();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm">Compare ({items.length}/4)</span>
          <div className="flex gap-2">
            {items.map((item) => (
              <div key={item.id} className="relative">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                  )}
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {Array.from({ length: 4 - items.length }).map((_, i) => (
              <div key={i} className="w-12 h-12 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <Plus className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={clearAll} className="text-gray-500 hover:text-gray-700 text-sm">
            Clear All
          </button>
          <Link href="/compare">
            <button disabled={items.length < 2} className="bg-[#ff6b35] text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Compare Now
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Compare Page Table
export function CompareTable() {
  const { items, removeItem } = useCompareStore();

  if (items.length < 2) {
    return (
      <div className="text-center py-16">
        <Scale className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">Add products to compare</h2>
        <p className="text-gray-500 mb-4">Select at least 2 products to compare them side by side</p>
        <Link href="/products">
          <button className="bg-[#ff6b35] text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600">
            Browse Products
          </button>
        </Link>
      </div>
    );
  }

  const allSpecs = new Set<string>();
  items.forEach(item => {
    if (item.specs) {
      Object.keys(item.specs).forEach(key => allSpecs.add(key));
    }
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="p-4 text-left w-40"></th>
            {items.map((item) => (
              <th key={item.id} className="p-4 text-center">
                <div className="relative inline-block">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center z-10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="w-32 h-32 bg-gray-100 rounded-xl mx-auto mb-3 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                    )}
                  </div>
                  <Link href={`/products/${item.slug}`} className="font-bold hover:text-[#ff6b35]">{item.name}</Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Price Row */}
          <tr className="bg-gray-50">
            <td className="p-4 font-medium">Price</td>
            {items.map((item) => (
              <td key={item.id} className="p-4 text-center">
                <span className="text-xl font-bold text-[#ff6b35]">{formatCurrency(item.price)}</span>
              </td>
            ))}
          </tr>
          
          {/* Rating Row */}
          <tr>
            <td className="p-4 font-medium">Rating</td>
            {items.map((item) => (
              <td key={item.id} className="p-4 text-center">
                {item.rating ? (
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span>{item.rating.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">({item.reviewCount})</span>
                  </div>
                ) : (
                  <span className="text-gray-400">No reviews</span>
                )}
              </td>
            ))}
          </tr>

          {/* Specs Rows */}
          {Array.from(allSpecs).map((spec) => (
            <tr key={spec} className="border-t">
              <td className="p-4 font-medium">{spec}</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 text-center">
                  {item.specs?.[spec] || <Minus className="h-4 w-4 mx-auto text-gray-300" />}
                </td>
              ))}
            </tr>
          ))}

          {/* Add to Cart Row */}
          <tr className="bg-gray-50">
            <td className="p-4"></td>
            {items.map((item) => (
              <td key={item.id} className="p-4 text-center">
                <button className="bg-[#ff6b35] text-white px-4 py-2 rounded-lg font-bold hover:bg-orange-600 w-full">
                  Add to Cart
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
