'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';

interface BundleProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
}

interface BundleSuggestionsProps {
  mainProduct: BundleProduct;
  relatedProducts: BundleProduct[];
  discountPercent?: number;
}

export function BundleSuggestions({ mainProduct, relatedProducts, discountPercent = 10 }: BundleSuggestionsProps) {
  const addItem = useCartStore((state) => state.addItem);

  if (relatedProducts.length === 0) return null;

  const bundleProducts = [mainProduct, ...relatedProducts.slice(0, 2)];
  const totalPrice = bundleProducts.reduce((sum, p) => sum + p.price, 0);
  const bundlePrice = Math.round(totalPrice * (1 - discountPercent / 100));
  const savings = totalPrice - bundlePrice;

  const handleBuyBundle = () => {
    bundleProducts.forEach((product) => {
      addItem(product as any, 1);
    });
  };

  return (
    <div className="border rounded-xl p-4 bg-gradient-to-r from-orange-50 to-yellow-50">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        🔥 Frequently Bought Together
        <span className="text-sm font-normal text-[#ff6b35]">Save {discountPercent}%!</span>
      </h3>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {bundleProducts.map((product, index) => (
          <div key={product.id} className="flex items-center">
            <Link href={`/products/${product.slug}`} className="flex-shrink-0">
              <div className="w-20 h-20 bg-white rounded-lg border overflow-hidden">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
                )}
              </div>
            </Link>
            {index < bundleProducts.length - 1 && (
              <Plus className="h-5 w-5 text-gray-400 mx-1" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div>
          <p className="text-sm text-gray-500 line-through">{formatCurrency(totalPrice)}</p>
          <p className="text-lg font-bold text-[#ff6b35]">{formatCurrency(bundlePrice)}</p>
          <p className="text-xs text-green-600">You save {formatCurrency(savings)}</p>
        </div>
        <Button onClick={handleBuyBundle} size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add Bundle
        </Button>
      </div>
    </div>
  );
}
