'use client';

import { Zap, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';

interface ExpressCheckoutProps {
  productId: string;
  productName: string;
  price: number;
  disabled?: boolean;
}

export function ExpressCheckout({ productId, productName, price, disabled }: ExpressCheckoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleExpressCheckout = async () => {
    setLoading(true);
    
    // Add to cart and go directly to checkout
    addItem({
      id: productId,
      name: productName,
      slug: '',
      selling_price_cents: price,
      primary_image_url: null,
      quantity: 999,
    } as any, 1);
    
    // Small delay to ensure cart is updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    router.push('/checkout');
  };

  return (
    <button
      onClick={handleExpressCheckout}
      disabled={disabled || loading}
      className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <Zap className="h-5 w-5" />
          Buy Now
        </>
      )}
    </button>
  );
}
