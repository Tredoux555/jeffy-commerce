'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, X, Clock, ArrowRight, Gift } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';

// Abandoned cart popup - shows after user has items but tries to leave
export function AbandonedCartPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());

  useEffect(() => {
    if (dismissed || items.length === 0) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10) {
        setIsVisible(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [dismissed, items.length]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
  };

  if (!isVisible || items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-bounce-in">
        {/* Header */}
        <div className="bg-[#ff6b35] text-white p-4 relative">
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 hover:bg-white/20 rounded-full p-1"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold">Wait! Don't leave yet!</h2>
              <p className="text-white/90 text-sm">You have items in your cart</p>
            </div>
          </div>
        </div>

        {/* Cart Preview */}
        <div className="p-4">
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  {item.image && (
                    <Image src={item.image} alt={item.name} width={64} height={64} className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-[#ff6b35] font-bold text-sm">
                    {formatCurrency(item.price)} x {item.quantity}
                  </p>
                </div>
              </div>
            ))}
            {items.length > 3 && (
              <p className="text-sm text-gray-500">+{items.length - 3} more items</p>
            )}
          </div>

          <div className="border-t mt-4 pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-medium">Cart Total:</span>
              <span className="text-xl font-bold text-[#ff6b35]">{formatCurrency(total)}</span>
            </div>

            {/* Special Offer */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium text-sm">
                  Complete your order now and get FREE shipping!
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Link href="/checkout" onClick={handleDismiss}>
                <Button className="w-full" size="lg">
                  Complete Purchase
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <button
                onClick={handleDismiss}
                className="w-full text-gray-500 text-sm hover:underline"
              >
                I'll come back later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Persistent cart reminder banner
export function CartReminderBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.getTotal());

  useEffect(() => {
    // Show after 5 seconds if cart has items
    if (items.length > 0) {
      const timer = setTimeout(() => setIsVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [items.length]);

  if (!isVisible || items.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-xl shadow-2xl border p-4 z-40 animate-slide-up">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-[#ff6b35] rounded-full flex items-center justify-center">
          <ShoppingCart className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-medium text-sm">{items.length} items in cart</p>
          <p className="text-xs text-gray-500">Total: {formatCurrency(total)}</p>
        </div>
      </div>

      <Link href="/checkout" onClick={() => setIsVisible(false)}>
        <Button size="sm" className="w-full">
          Checkout Now
        </Button>
      </Link>
    </div>
  );
}

// Email capture for cart abandonment
export function CartAbandonmentCapture({ onSubmit }: { onSubmit?: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const items = useCartStore((state) => state.items);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      // Save abandoned cart with email
      if (onSubmit) {
        onSubmit(email);
      }
      setSubmitted(true);
    } catch (e) {
      console.error('Failed to save email:', e);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-800">✓ We'll remind you about your cart!</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-gray-500" />
        <p className="font-medium text-sm">Save your cart for later</p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
          required
        />
        <Button type="submit" size="sm">Save</Button>
      </form>
      <p className="text-xs text-gray-500 mt-2">
        We'll email you a link to your saved cart
      </p>
    </div>
  );
}
