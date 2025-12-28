'use client';

import Link from 'next/link';
import { ShoppingCart, Menu, X, Gift, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { useWishlistStore } from '@/lib/wishlist-store';
import { AuthButtons } from '@/components/auth-buttons';
import { ProductSearch } from '@/components/product-search';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const cartCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.getCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a] border-b border-white/10 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-2xl font-bold text-white">Jeffy</span>
          </Link>

          {/* Search - Desktop */}
          <div className="hidden md:block flex-1 max-w-md">
            <ProductSearch />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/products" className="text-white hover:text-jeffy-orange transition-colors text-sm">
              Products
            </Link>
            <Link href="/wants" className="text-jeffy-orange hover:text-orange-400 transition-colors flex items-center gap-1 font-semibold text-sm">
              <Gift className="h-4 w-4" />
              Free Stuff!
            </Link>
            <Link href="/track" className="text-white hover:text-jeffy-orange transition-colors text-sm">
              Track
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <AuthButtons />

            {/* Wishlist */}
            <Link href="/wishlist">
              <button className="relative p-2 rounded-lg text-white hover:bg-white/10 transition-all">
                <Heart className="h-5 w-5" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <button className="relative p-2 rounded-lg text-white hover:bg-white/10 transition-all">
                <ShoppingCart className="h-5 w-5" />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-jeffy-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            </Link>

            <button
              className="lg:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <div className="mb-4">
              <ProductSearch />
            </div>
            
            <nav className="flex flex-col space-y-4">
              <Link href="/products" className="text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Products
              </Link>
              <Link href="/categories" className="text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Categories
              </Link>
              <Link href="/wants" className="text-jeffy-orange hover:text-orange-400 font-semibold flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Gift className="h-4 w-4" />
                Free Stuff!
              </Link>
              <Link href="/wishlist" className="text-gray-300 hover:text-white flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Heart className="h-4 w-4" />
                Wishlist {mounted && wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
              <Link href="/track" className="text-gray-300 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                Track Order
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
