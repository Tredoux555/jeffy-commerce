'use client';

import { Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';

interface ExpressCheckoutProps {
  productId: string;
  product: any;
}

export function ExpressCheckout({ productId, product }: ExpressCheckoutProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const handleExpressCheckout = () => {
    // Add to cart and go straight to checkout
    addItem(product, 1);
    router.push('/checkout');
  };

  return (
    <button
      onClick={handleExpressCheckout}
      className="w-full mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:from-yellow-500 hover:to-orange-600 transition shadow-lg"
    >
      <Zap className="h-5 w-5" />
      Buy Now
    </button>
  );
}
