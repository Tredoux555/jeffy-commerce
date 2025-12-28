'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';
import type { Product } from '@/types/database';

interface ExpressCheckoutProps {
  product: Product;
  quantity?: number;
}

export function ExpressCheckoutButton({ product, quantity = 1 }: ExpressCheckoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const handleExpressCheckout = async () => {
    setLoading(true);
    
    // Clear cart and add only this product
    clearCart();
    addItem(product, quantity);
    
    // Go directly to checkout
    router.push('/checkout?express=true');
  };

  return (
    <Button
      onClick={handleExpressCheckout}
      disabled={loading || product.quantity <= 0}
      variant="outline"
      className="w-full border-2 border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Zap className="h-4 w-4 mr-2" />
      )}
      Buy Now
    </Button>
  );
}

// PayFast express checkout (for future)
export function PayFastExpressButton({ amount, itemName }: { amount: number; itemName: string }) {
  return (
    <button
      className="w-full py-3 bg-[#00457C] text-white rounded-lg font-medium hover:bg-[#003a66] transition flex items-center justify-center gap-2"
      onClick={() => {
        // PayFast integration would go here
        alert('PayFast integration coming soon!');
      }}
    >
      <span className="text-lg">💳</span>
      Pay with PayFast
    </button>
  );
}

// Mobile pay options
export function MobilePayOptions() {
  const options = [
    { name: 'SnapScan', icon: '📱', color: 'bg-blue-500' },
    { name: 'Zapper', icon: '⚡', color: 'bg-orange-500' },
    { name: 'Ozow', icon: '🏦', color: 'bg-green-500' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option.name}
          className={`${option.color} text-white py-3 rounded-lg font-medium hover:opacity-90 transition text-sm`}
          onClick={() => alert(`${option.name} integration coming soon!`)}
        >
          <span className="text-lg block">{option.icon}</span>
          {option.name}
        </button>
      ))}
    </div>
  );
}
