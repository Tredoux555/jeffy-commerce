'use client';

import { useState } from 'react';
import { Package, ShoppingCart, Check, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';

interface BundleProduct {
  id: string;
  name: string;
  image_url: string;
  price_cents: number;
  quantity: number;
}

interface ProductBundleProps {
  id: string;
  name: string;
  description?: string;
  bundlePrice: number;
  comparePrice: number;
  savingsPercent: number;
  imageUrl?: string;
  products: BundleProduct[];
  maxPerOrder?: number;
}

export function ProductBundleCard({
  id, name, description, bundlePrice, comparePrice, savingsPercent, imageUrl, products, maxPerOrder = 5
}: ProductBundleProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddBundle = () => {
    // Add bundle as a special cart item
    const bundleProduct = {
      id,
      name: `📦 ${name}`,
      slug: `bundle-${id}`,
      primary_image_url: imageUrl || products[0]?.image_url,
      selling_price_cents: bundlePrice,
    } as any;
    addItem(bundleProduct, quantity, 'bundle', `Bundle of ${products.length} items`);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-bold">Bundle Deal</span>
        </div>
        <span className="bg-white text-purple-600 px-3 py-1 rounded-full text-sm font-bold">
          Save {savingsPercent}%
        </span>
      </div>

      <div className="p-4">
        {/* Bundle Image or Product Grid */}
        {imageUrl ? (
          <div className="aspect-video bg-white rounded-xl overflow-hidden mb-4">
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {products.slice(0, 3).map((product, idx) => (
              <div key={idx} className="aspect-square bg-white rounded-lg overflow-hidden border">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Bundle Info */}
        <h3 className="font-bold text-lg mb-1">{name}</h3>
        {description && <p className="text-gray-600 text-sm mb-3">{description}</p>}

        {/* Products List */}
        <div className="bg-white rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 mb-2 font-medium">INCLUDES:</p>
          <div className="space-y-2">
            {products.map((product, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="flex-1 truncate">{product.quantity > 1 ? `${product.quantity}x ` : ''}{product.name}</span>
                <span className="text-gray-400 line-through text-xs">{formatCurrency(product.price_cents * product.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-gray-400 line-through text-sm">{formatCurrency(comparePrice)}</p>
            <p className="text-2xl font-bold text-purple-700">{formatCurrency(bundlePrice)}</p>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
            You save {formatCurrency(comparePrice - bundlePrice)}
          </div>
        </div>

        {/* Quantity & Add */}
        <div className="flex gap-3">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100">-</button>
            <span className="px-3 py-2 border-x">{quantity}</span>
            <button onClick={() => setQuantity(Math.min(maxPerOrder, quantity + 1))} className="px-3 py-2 hover:bg-gray-100">+</button>
          </div>
          <button
            onClick={handleAddBundle}
            disabled={added}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition ${
              added ? 'bg-green-500 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {added ? <><Check className="h-5 w-5" /> Added!</> : <><ShoppingCart className="h-5 w-5" /> Add Bundle</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// Compact horizontal bundle for product pages
export function BundleSuggestion({ bundle }: { bundle: ProductBundleProps }) {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-4">
      <Package className="h-8 w-8 text-purple-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-purple-800">{bundle.name}</p>
        <p className="text-sm text-purple-600">Save {bundle.savingsPercent}% when bought together</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-purple-700">{formatCurrency(bundle.bundlePrice)}</p>
        <p className="text-xs text-gray-400 line-through">{formatCurrency(bundle.comparePrice)}</p>
      </div>
    </div>
  );
}
