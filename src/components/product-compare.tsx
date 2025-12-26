'use client';

import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Image from 'next/image';
import Link from 'next/link';
import { X, Check, Minus, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';

interface CompareProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image: string | null;
  specs: Record<string, string>;
}

interface CompareStore {
  products: CompareProduct[];
  addProduct: (product: CompareProduct) => void;
  removeProduct: (id: string) => void;
  clearAll: () => void;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      products: [],
      addProduct: (product) => {
        const current = get().products;
        if (current.length >= 4) return; // Max 4 products
        if (current.find(p => p.id === product.id)) return; // Already added
        set({ products: [...current, product] });
      },
      removeProduct: (id) => {
        set({ products: get().products.filter(p => p.id !== id) });
      },
      clearAll: () => set({ products: [] }),
    }),
    { name: 'jeffy-compare' }
  )
);

// Compare button for product cards
export function CompareButton({ product }: { product: CompareProduct }) {
  const { products, addProduct, removeProduct } = useCompareStore();
  const isAdded = products.some(p => p.id === product.id);
  const isFull = products.length >= 4;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) {
      removeProduct(product.id);
    } else if (!isFull) {
      addProduct(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isAdded && isFull}
      className={`text-xs px-2 py-1 rounded transition ${
        isAdded 
          ? 'bg-[#ff6b35] text-white' 
          : isFull 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {isAdded ? '✓ Comparing' : 'Compare'}
    </button>
  );
}

// Floating compare bar
export function CompareBar() {
  const { products, removeProduct, clearAll } = useCompareStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || products.length === 0) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white rounded-xl shadow-2xl border p-4 animate-slide-up">
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          {products.map((product) => (
            <div key={product.id} className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
              {product.image ? (
                <Image src={product.image} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">📦</div>
              )}
              <button
                onClick={() => removeProduct(product.id)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: 4 - products.length }).map((_, i) => (
            <div key={i} className="w-16 h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-300">
              +
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Link href="/compare">
            <Button size="sm" disabled={products.length < 2}>
              Compare ({products.length})
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={clearAll}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}

// Full comparison table
export function CompareTable({ products }: { products: CompareProduct[] }) {
  const addToCart = useCartStore((state) => state.addItem);

  // Get all unique spec keys
  const allSpecs = new Set<string>();
  products.forEach(p => Object.keys(p.specs || {}).forEach(k => allSpecs.add(k)));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-4 text-left bg-gray-50 border-b w-32"></th>
            {products.map((product) => (
              <th key={product.id} className="p-4 border-b min-w-[200px]">
                <div className="space-y-3">
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} fill className="object-cover" />
                    ) : null}
                  </div>
                  <Link href={`/products/${product.slug}`} className="font-medium hover:text-[#ff6b35] line-clamp-2 block">
                    {product.name}
                  </Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Price Row */}
          <tr>
            <td className="p-4 font-medium bg-gray-50 border-b">Price</td>
            {products.map((product) => (
              <td key={product.id} className="p-4 border-b text-center">
                <span className="text-xl font-bold text-[#ff6b35]">{formatCurrency(product.price)}</span>
                {product.comparePrice && (
                  <span className="block text-sm text-gray-400 line-through">
                    {formatCurrency(product.comparePrice)}
                  </span>
                )}
              </td>
            ))}
          </tr>

          {/* Spec Rows */}
          {Array.from(allSpecs).map((spec) => (
            <tr key={spec}>
              <td className="p-4 font-medium bg-gray-50 border-b">{spec}</td>
              {products.map((product) => (
                <td key={product.id} className="p-4 border-b text-center">
                  {product.specs?.[spec] || <Minus className="h-4 w-4 mx-auto text-gray-300" />}
                </td>
              ))}
            </tr>
          ))}

          {/* Add to Cart Row */}
          <tr>
            <td className="p-4 bg-gray-50"></td>
            {products.map((product) => (
              <td key={product.id} className="p-4 text-center">
                <Button
                  onClick={() => addToCart(product as any, 1)}
                  className="w-full"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
