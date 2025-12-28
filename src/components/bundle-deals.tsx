'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, Check, ShoppingCart, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';

interface BundleProduct {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  originalPrice?: number;
}

interface BundleDealProps {
  name: string;
  products: BundleProduct[];
  bundlePrice: number;
  savings: number;
}

export function BundleDeal({ name, products, bundlePrice, savings }: BundleDealProps) {
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const originalTotal = products.reduce((sum, p) => sum + (p.originalPrice || p.price), 0);
  const savingsPercent = Math.round((savings / originalTotal) * 100);

  const handleAddBundle = () => {
    setAdding(true);
    products.forEach((product) => {
      addItem(product as any, 1);
    });
    setTimeout(() => setAdding(false), 500);
  };

  return (
    <div className="border-2 border-dashed border-[#ff6b35] rounded-2xl p-6 bg-orange-50/50">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-[#ff6b35]" />
        <h3 className="font-bold text-lg">{name}</h3>
        <span className="ml-auto bg-[#ff6b35] text-white px-3 py-1 rounded-full text-sm font-bold">
          Save {savingsPercent}%
        </span>
      </div>

      <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center flex-shrink-0">
            <Link href={`/products/${product.slug}`} className="block">
              <div className="w-20 h-20 bg-white rounded-lg overflow-hidden border">
                {product.image ? (
                  <Image src={product.image} alt={product.name} width={80} height={80} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                )}
              </div>
              <p className="text-xs text-center mt-1 truncate w-20">{product.name}</p>
            </Link>
            {index < products.length - 1 && (
              <span className="text-2xl text-[#ff6b35] mx-2">+</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 line-through">{formatCurrency(originalTotal)}</p>
          <p className="text-2xl font-bold text-[#ff6b35]">{formatCurrency(bundlePrice)}</p>
          <p className="text-sm text-green-600 font-medium">You save {formatCurrency(savings)}</p>
        </div>
        <Button onClick={handleAddBundle} disabled={adding} size="lg">
          <ShoppingCart className="h-4 w-4 mr-2" />
          {adding ? 'Added!' : 'Add Bundle'}
        </Button>
      </div>
    </div>
  );
}

// Frequently Bought Together
export function FrequentlyBoughtTogether({ mainProduct, suggestions }: { 
  mainProduct: BundleProduct; 
  suggestions: BundleProduct[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set([mainProduct.id]));
  const addItem = useCartStore((state) => state.addItem);

  const toggleProduct = (id: string) => {
    if (id === mainProduct.id) return; // Can't deselect main product
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const allProducts = [mainProduct, ...suggestions];
  const selectedProducts = allProducts.filter(p => selected.has(p.id));
  const total = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const discount = selected.size >= 3 ? Math.round(total * 0.1) : 0;

  const handleAddAll = () => {
    selectedProducts.forEach(product => {
      addItem(product as any, 1);
    });
  };

  return (
    <div className="border rounded-xl p-6">
      <h3 className="font-bold mb-4">Frequently Bought Together</h3>
      
      <div className="flex flex-wrap gap-4 mb-6">
        {allProducts.map((product, index) => (
          <div key={product.id} className="flex items-center">
            <button
              onClick={() => toggleProduct(product.id)}
              className={`relative p-2 border-2 rounded-lg transition ${
                selected.has(product.id) ? 'border-[#ff6b35]' : 'border-gray-200'
              }`}
            >
              <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
                {product.image ? (
                  <Image src={product.image} alt={product.name} width={80} height={80} className="object-cover" />
                ) : null}
              </div>
              {selected.has(product.id) && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#ff6b35] text-white rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </button>
            {index < allProducts.length - 1 && (
              <span className="text-xl text-gray-300 mx-2">+</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm text-gray-600">{selected.size} items selected</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold">{formatCurrency(total - discount)}</span>
            {discount > 0 && (
              <>
                <span className="text-sm text-gray-400 line-through">{formatCurrency(total)}</span>
                <span className="text-sm text-green-600">Save {formatCurrency(discount)}</span>
              </>
            )}
          </div>
          {selected.size < 3 && (
            <p className="text-xs text-[#ff6b35]">Add 1 more for 10% off!</p>
          )}
        </div>
        <Button onClick={handleAddAll}>
          Add All to Cart
        </Button>
      </div>
    </div>
  );
}
