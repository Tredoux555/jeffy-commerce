'use client';

import { useEffect, useCallback } from 'react';
import { useCartStore } from '@/lib/cart-store';

// Generate session ID for tracking
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = localStorage.getItem('jeffy_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('jeffy_session_id', sessionId);
  }
  return sessionId;
}

// Hook to track cart abandonment
export function useAbandonedCartTracker() {
  const { items, getSubtotal } = useCartStore();

  const saveAbandonedCart = useCallback(async (email?: string, phone?: string) => {
    if (items.length === 0) return;

    const sessionId = getSessionId();
    const cartTotal = getSubtotal();

    try {
      await fetch('/api/abandoned-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          email,
          phone,
          cartData: items,
          cartTotalCents: cartTotal,
        }),
      });
    } catch (err) {
      console.error('Failed to save abandoned cart:', err);
    }
  }, [items, getSubtotal]);

  // Save cart on page unload (when user leaves)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (items.length > 0) {
        // Use sendBeacon for reliability
        const sessionId = getSessionId();
        const data = JSON.stringify({
          sessionId,
          cartData: items,
          cartTotalCents: getSubtotal(),
        });
        navigator.sendBeacon('/api/abandoned-cart', data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [items, getSubtotal]);

  return { saveAbandonedCart };
}

// Component to capture email for cart recovery
interface CartEmailCaptureProps {
  onEmailCapture?: (email: string) => void;
}

export function CartEmailCapture({ onEmailCapture }: CartEmailCaptureProps) {
  const { items } = useCartStore();
  const { saveAbandonedCart } = useAbandonedCartTracker();

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email && email.includes('@')) {
      saveAbandonedCart(email);
      onEmailCapture?.(email);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <p className="text-sm text-blue-800 mb-2">
        Enter your email to save your cart and get exclusive offers:
      </p>
      <input
        type="email"
        placeholder="your@email.com"
        onBlur={handleEmailBlur}
        className="w-full border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}

// Recovery banner for returning users
interface RecoveryBannerProps {
  cartId: string;
  itemCount: number;
  totalCents: number;
  discountPercent?: number;
  recoveryCode?: string;
  onRestore: () => void;
  onDismiss: () => void;
}

export function CartRecoveryBanner({
  itemCount, totalCents, discountPercent, recoveryCode, onRestore, onDismiss
}: RecoveryBannerProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 shadow-lg z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-2xl">🛒</span>
          <div>
            <p className="font-bold">Welcome back! You have {itemCount} items in your cart</p>
            {discountPercent && discountPercent > 0 && (
              <p className="text-sm opacity-90">
                Use code <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{recoveryCode}</span> for {discountPercent}% off!
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onDismiss} className="text-white/80 hover:text-white text-sm">
            Dismiss
          </button>
          <button
            onClick={onRestore}
            className="bg-white text-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-orange-50 transition"
          >
            Restore Cart
          </button>
        </div>
      </div>
    </div>
  );
}
