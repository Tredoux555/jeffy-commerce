'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';

export function ExpressCheckoutButton() {
  const { items, getSubtotal } = useCartStore();

  if (items.length === 0) return null;

  return (
    <Link href="/checkout">
      <button className="fixed bottom-24 right-4 lg:bottom-6 z-40 bg-gradient-to-r from-[#ff6b35] to-orange-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-transform animate-pulse-slow">
        <Zap className="h-5 w-5" />
        <span className="font-bold">Checkout {formatCurrency(getSubtotal())}</span>
      </button>
    </Link>
  );
}
