'use client';

import { Truck, Gift } from 'lucide-react';
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
    <div className={`p-4 rounded-xl ${qualified ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
      <div className="flex items-center gap-3 mb-2">
        {qualified ? (
          <>
            <Gift className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">🎉 You qualify for FREE shipping!</span>
          </>
        ) : (
          <>
            <Truck className="h-5 w-5 text-[#ff6b35]" />
            <span className="font-medium text-gray-800">
              Add {formatCurrency(remaining)} more for FREE shipping
            </span>
          </>
        )}
      </div>
      
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${qualified ? 'bg-green-500' : 'bg-[#ff6b35]'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {!qualified && (
        <p className="text-xs text-gray-500 mt-2">
          Free shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
        </p>
      )}
    </div>
  );
}
