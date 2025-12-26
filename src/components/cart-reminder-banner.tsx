'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, X } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function CartReminderBanner() {
  const pathname = usePathname();
  const { items, getSubtotal } = useCartStore();
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if dismissed in this session
    const wasDismissed = sessionStorage.getItem('cart-reminder-dismissed');
    if (wasDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('cart-reminder-dismissed', 'true');
  };

  // Don't show on cart, checkout, or admin pages
  if (!mounted || dismissed || items.length === 0) return null;
  if (pathname.startsWith('/cart') || pathname.startsWith('/checkout') || pathname.startsWith('/admin')) return null;

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed bottom-20 left-4 right-4 lg:bottom-4 z-40 animate-slide-up">
      <div className="bg-[#0f172a] text-white rounded-xl shadow-2xl p-4 flex items-center justify-between gap-4 max-w-lg mx-auto border border-white/10">
        <div className="flex items-center gap-3">
          <div className="bg-[#ff6b35] p-2 rounded-lg">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-sm">
              {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
            </p>
            <p className="text-white/70 text-xs">
              Total: {formatCurrency(getSubtotal())}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link href="/cart">
            <button className="bg-[#ff6b35] hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-medium transition">
              View Cart
            </button>
          </Link>
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
