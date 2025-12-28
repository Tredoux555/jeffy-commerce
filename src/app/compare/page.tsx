'use client';

import { useCompareStore, CompareTable } from '@/components/product-compare';
import { Scale, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const { products, clearAll } = useCompareStore();

  if (products.length < 2) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Scale className="h-8 w-8 text-[#ff6b35]" />
          <h1 className="text-2xl font-bold">Compare Products</h1>
        </div>
        <div className="bg-white rounded-xl border p-6 text-center py-12">
          <Scale className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Add at least 2 products to compare</p>
          <Link href="/products" className="text-[#ff6b35] hover:underline">
            Browse Products →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Scale className="h-8 w-8 text-[#ff6b35]" />
          <h1 className="text-2xl font-bold">Compare Products</h1>
        </div>
        <Link href="/products" className="text-[#ff6b35] hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>
      </div>
      
      <div className="bg-white rounded-xl border p-6">
        <div className="flex justify-end mb-4">
          <button onClick={clearAll} className="text-sm text-red-500 hover:underline">
            Clear All
          </button>
        </div>
        <CompareTable products={products} />
      </div>
    </div>
  );
}
