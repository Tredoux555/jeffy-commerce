'use client';

import { CompareTable } from '@/components/product-compare';
import { Scale } from 'lucide-react';

export default function ComparePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Scale className="h-8 w-8 text-[#ff6b35]" />
        <h1 className="text-2xl font-bold">Compare Products</h1>
      </div>
      
      <div className="bg-white rounded-xl border p-6">
        <CompareTable />
      </div>
    </div>
  );
}
