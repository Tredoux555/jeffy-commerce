'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
}

interface AIRecommendationsProps {
  userId?: string;
  currentProductId?: string;
  recentlyViewed?: string[];
  cartItems?: string[];
  title?: string;
  limit?: number;
}

// Smart recommendations based on user behavior
export function AIRecommendations({
  userId,
  currentProductId,
  recentlyViewed = [],
  cartItems = [],
  title = "Recommended for You",
  limit = 4
}: AIRecommendationsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          ...(userId && { userId }),
          ...(currentProductId && { excludeProduct: currentProductId }),
          ...(recentlyViewed.length && { recentlyViewed: recentlyViewed.join(',') }),
          ...(cartItems.length && { cartItems: cartItems.join(',') }),
          limit: limit.toString(),
        });

        const res = await fetch(`/api/recommendations?${params}`);
        const data = await res.json();
        
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId, currentProductId, recentlyViewed, cartItems, limit]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="font-bold">{title}</h3>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h3 className="font-bold">{title}</h3>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">AI Powered</span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition group">
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                )}
              </div>
              <div className="p-3">
                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                <p className="text-[#ff6b35] font-bold mt-1">{formatCurrency(product.price)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// "Frequently Bought Together" Component
interface FrequentlyBoughtProps {
  productId: string;
  productName: string;
  productPrice: number;
}

export function FrequentlyBoughtTogether({ productId, productName, productPrice }: FrequentlyBoughtProps) {
  const [companions, setCompanions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - would come from API based on order history analysis
    setCompanions([
      { id: '1', name: 'USB-C Cable', slug: 'usb-c-cable', price: 9900, image: '' },
      { id: '2', name: 'Screen Protector', slug: 'screen-protector', price: 4900, image: '' },
    ]);
    setLoading(false);
  }, [productId]);

  if (loading || companions.length === 0) return null;

  const totalPrice = productPrice + companions.reduce((sum, p) => sum + p.price, 0);
  const bundlePrice = Math.round(totalPrice * 0.9); // 10% discount

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" />
        Frequently Bought Together
      </h3>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-2xl">📱</div>
        <span className="text-2xl text-amber-400">+</span>
        {companions.map((item, idx) => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-2xl">📦</div>
            {idx < companions.length - 1 && <span className="text-2xl text-amber-400">+</span>}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Buy together for <span className="line-through">{formatCurrency(totalPrice)}</span>
          </p>
          <p className="text-xl font-bold text-amber-700">{formatCurrency(bundlePrice)}</p>
        </div>
        <button className="bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition">
          Add All to Cart
        </button>
      </div>
    </div>
  );
}

// "Because You Viewed" Component  
export function BecauseYouViewed({ viewedProductName, viewedCategoryId }: { viewedProductName: string; viewedCategoryId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Mock - would fetch similar products from same category
    setProducts([
      { id: '1', name: 'Similar Product 1', slug: 'similar-1', price: 29900, image: '' },
      { id: '2', name: 'Similar Product 2', slug: 'similar-2', price: 34900, image: '' },
      { id: '3', name: 'Similar Product 3', slug: 'similar-3', price: 24900, image: '' },
    ]);
  }, [viewedCategoryId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="font-bold mb-4">Because you viewed "{viewedProductName}"</h3>
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <div className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition">
              <div className="aspect-square bg-gray-100 flex items-center justify-center text-3xl">📦</div>
              <div className="p-3">
                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                <p className="text-[#ff6b35] font-bold">{formatCurrency(product.price)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
