'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RecentProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  viewedAt: number;
}

const STORAGE_KEY = 'jeffy-recent-products';
const MAX_RECENT = 10;

// Add product to recently viewed
export function trackProductView(product: Omit<RecentProduct, 'viewedAt'>) {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let recent: RecentProduct[] = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists
    recent = recent.filter(p => p.id !== product.id);
    
    // Add to front
    recent.unshift({ ...product, viewedAt: Date.now() });
    
    // Keep only MAX_RECENT
    recent = recent.slice(0, MAX_RECENT);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
  } catch (e) {
    console.error('Failed to track product view:', e);
  }
}

// Get recently viewed products
export function getRecentProducts(): RecentProduct[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Clear recently viewed
export function clearRecentProducts() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Recently Viewed Component
export function RecentlyViewed({ currentProductId }: { currentProductId?: string }) {
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let recent = getRecentProducts();
    // Filter out current product
    if (currentProductId) {
      recent = recent.filter(p => p.id !== currentProductId);
    }
    setProducts(recent.slice(0, 6));
  }, [currentProductId]);

  if (!mounted || products.length === 0) return null;

  return (
    <div className="py-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-gray-400" />
        <h3 className="font-bold text-lg">Recently Viewed</h3>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="flex-shrink-0 w-32 group"
          >
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
              )}
            </div>
            <p className="text-sm font-medium line-clamp-2 group-hover:text-[#ff6b35]">
              {product.name}
            </p>
            <p className="text-sm font-bold text-[#ff6b35]">
              {formatCurrency(product.price)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Floating Recently Viewed Sidebar
export function RecentlyViewedSidebar() {
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProducts(getRecentProducts().slice(0, 5));
  }, []);

  if (!mounted || products.length === 0) return null;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-r-lg p-2 z-40 hover:bg-gray-50"
      >
        <Clock className="h-5 w-5 text-gray-600" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff6b35] text-white text-xs rounded-full flex items-center justify-center">
          {products.length}
        </span>
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold">Recently Viewed</h3>
          <button onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)]">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              onClick={() => setIsOpen(false)}
              className="flex gap-3 group"
            >
              <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {product.image && (
                  <Image src={product.image} alt={product.name} width={64} height={64} className="object-cover" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium line-clamp-2 group-hover:text-[#ff6b35]">
                  {product.name}
                </p>
                <p className="text-sm font-bold text-[#ff6b35]">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
