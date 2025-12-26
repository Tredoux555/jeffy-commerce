'use client';

import { Truck } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 50000; // R500 in cents

export function FreeShippingProgress() {
  const subtotal = useCartStore((state) => state.getSubtotal());
  
  if (subtotal === 0) return null;
  
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const qualified = remaining <= 0;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <Truck className={`h-5 w-5 ${qualified ? 'text-green-600' : 'text-orange-500'}`} />
        <span className="font-medium text-sm">
          {qualified ? (
            <span className="text-green-600">🎉 You qualify for FREE shipping!</span>
          ) : (
            <span className="text-gray-700">
              Add {formatCurrency(remaining)} more for <span className="text-green-600 font-bold">FREE shipping</span>
            </span>
          )}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-500 ${qualified ? 'bg-green-500' : 'bg-orange-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Free shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
      </p>
    </div>
  );
}
