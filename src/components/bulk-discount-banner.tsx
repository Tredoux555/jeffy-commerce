'use client';

import { Package, Percent } from 'lucide-react';

interface BulkDiscountBannerProps {
  price: number;
  quantity: number;
}

export function BulkDiscountBanner({ price, quantity }: BulkDiscountBannerProps) {
  const discounts = [
    { qty: 3, discount: 5 },
    { qty: 5, discount: 10 },
    { qty: 10, discount: 15 },
  ];

  const activeDiscount = discounts.filter(d => quantity >= d.qty).pop();
  const nextDiscount = discounts.find(d => quantity < d.qty);

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Package className="h-5 w-5 text-purple-600" />
        <span className="font-semibold text-purple-800">Bulk Discounts</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        {discounts.map((d) => (
          <div
            key={d.qty}
            className={`p-2 rounded-lg ${
              activeDiscount?.qty === d.qty
                ? 'bg-purple-600 text-white'
                : quantity >= d.qty
                ? 'bg-purple-200 text-purple-800'
                : 'bg-white text-gray-600'
            }`}
          >
            <p className="font-bold">{d.qty}+</p>
            <p className="text-xs">{d.discount}% off</p>
          </div>
        ))}
      </div>

      {activeDiscount && (
        <p className="text-purple-700 text-sm mt-3 text-center font-medium">
          <Percent className="h-4 w-4 inline mr-1" />
          {activeDiscount.discount}% discount applied!
        </p>
      )}

      {nextDiscount && (
        <p className="text-gray-600 text-xs mt-2 text-center">
          Add {nextDiscount.qty - quantity} more for {nextDiscount.discount}% off
        </p>
      )}
    </div>
  );
}
