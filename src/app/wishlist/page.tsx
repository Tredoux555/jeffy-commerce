'use client';

import { useWishlistStore } from '@/lib/wishlist-store';
import { useCartStore } from '@/lib/cart-store';
import { Heart, Trash2, ShoppingCart, ArrowRight, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (item: typeof items[0]) => {
    const product = {
      id: item.productId,
      name: item.name,
      slug: item.slug,
      primary_image_url: item.image,
      selling_price_cents: item.price,
    } as any;
    addToCart(product);
    removeItem(item.productId);
  };

  const handleShareWishlist = () => {
    if (items.length === 0) return;
    
    const baseUrl = window.location.origin;
    const itemList = items.map((item, i) => 
      `${i + 1}. ${item.name} - ${formatCurrency(item.price)}\n   ${baseUrl}/products/${item.slug}`
    ).join('\n\n');
    
    const total = items.reduce((sum, item) => sum + item.price, 0);
    
    const message = `🎁 Check out my Jeffy wishlist!\n\n${itemList}\n\n💰 Total: ${formatCurrency(total)}\n\nShop at ${baseUrl}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!mounted) {
    return <div className="container mx-auto px-4 py-16 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          My Wishlist ({items.length})
        </h1>
        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleShareWishlist}
              className="flex items-center gap-2 text-sm bg-[#25D366] text-white px-3 py-2 rounded-lg hover:bg-green-600 transition"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button onClick={clearWishlist} className="text-sm text-gray-500 hover:text-red-500">
              Clear All
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love for later!</p>
          <Link href="/products">
            <button className="bg-[#ff6b35] text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition inline-flex items-center gap-2">
              Browse Products <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-white rounded-xl border p-4 flex items-center gap-4">
              <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link href={`/products/${item.slug}`}>
                  <h3 className="font-medium text-gray-900 hover:text-[#ff6b35] truncate">{item.name}</h3>
                </Link>
                <p className="text-[#ff6b35] font-bold mt-1">{formatCurrency(item.price)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Added {new Date(item.addedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="hidden sm:inline">Add to Cart</span>
                </button>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-2 text-gray-400 hover:text-red-500 transition"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total value:</span>
              <span className="text-xl font-bold text-[#ff6b35]">
                {formatCurrency(items.reduce((sum, item) => sum + item.price, 0))}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <Link href="/products" className="text-[#ff6b35] hover:underline">
              ← Continue Shopping
            </Link>
            <Link href="/cart">
              <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition">
                View Cart
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
