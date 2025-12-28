'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, Clock, ShoppingCart, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';

interface FlashSaleProduct {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  originalPrice: number;
  salePrice: number;
  quantity: number;
  sold: number;
}

interface FlashSaleBannerProps {
  endTime: Date;
  products: FlashSaleProduct[];
}

export function FlashSaleBanner({ endTime, products }: FlashSaleBannerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, mins: 0, secs: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const diff = endTime.getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (expired) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-2xl p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 animate-pulse" />
          <div>
            <h2 className="text-2xl font-bold">Flash Sale!</h2>
            <p className="text-white/80 text-sm">Limited time only</p>
          </div>
        </div>
        
        {/* Timer */}
        <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg">
          <Clock className="h-5 w-5" />
          <div className="flex gap-1 font-mono text-lg">
            <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span>:</span>
            <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.mins).padStart(2, '0')}</span>
            <span>:</span>
            <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.secs).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <FlashSaleCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function FlashSaleCard({ product }: { product: FlashSaleProduct }) {
  const addItem = useCartStore((state) => state.addItem);
  const soldPercent = Math.round((product.sold / (product.sold + product.quantity)) * 100);
  const discount = Math.round((1 - product.salePrice / product.originalPrice) * 100);

  return (
    <div className="flex-shrink-0 w-48 bg-white rounded-xl overflow-hidden text-gray-900">
      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square bg-gray-100">
          {product.image ? (
            <Image src={product.image} alt={product.name} fill className="object-cover" />
          ) : null}
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </span>
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/products/${product.slug}`}>
          <p className="text-sm font-medium line-clamp-2 hover:text-[#ff6b35]">{product.name}</p>
        </Link>
        
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold text-red-600">{formatCurrency(product.salePrice)}</span>
          <span className="text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
        </div>

        {/* Stock Bar */}
        <div className="mt-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-red-500 transition-all"
              style={{ width: `${soldPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{soldPercent}% sold</p>
        </div>

        {/* Add Button */}
        <Button 
          size="sm" 
          className="w-full mt-2 bg-red-500 hover:bg-red-600"
          onClick={() => addItem(product as any, 1)}
          disabled={product.quantity <= 0}
        >
          {product.quantity > 0 ? (
            <>
              <ShoppingCart className="h-3 w-3 mr-1" />
              Buy Now
            </>
          ) : (
            'Sold Out'
          )}
        </Button>
      </div>
    </div>
  );
}

// Stock urgency indicator
export function StockUrgency({ quantity, threshold = 10 }: { quantity: number; threshold?: number }) {
  if (quantity <= 0) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Out of Stock</span>
      </div>
    );
  }

  if (quantity <= threshold) {
    return (
      <div className="flex items-center gap-2 text-orange-600">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">Only {quantity} left - order soon!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-green-600">
      <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
      <span className="text-sm font-medium">In Stock</span>
    </div>
  );
}
