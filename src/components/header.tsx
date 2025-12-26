'use client';

import Link from 'next/link';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { AuthButtons } from '@/components/auth-buttons';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a] border-b border-white/10 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">Jeffy</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-white hover:text-jeffy-orange transition-colors">
              Products
            </Link>
            <Link href="/categories" className="text-white hover:text-jeffy-orange transition-colors">
              Categories
            </Link>
            <Link href="/track" className="text-white hover:text-jeffy-orange transition-colors">
              Track Order
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button className="hidden md:flex p-2 rounded-lg text-white hover:bg-white/10 transition-all">
              <Search className="h-5 w-5 text-white" />
            </button>

            <AuthButtons />
            
            <Link href="/cart">
              <button className="relative p-2 rounded-lg text-white hover:bg-white/10 transition-all">
                <ShoppingCart className="h-5 w-5 text-white" />
                {mounted && itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-jeffy-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>
            </Link>

            <button
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-all"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/products"
                className="text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/categories"
                className="text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link
                href="/track"
                className="text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Track Order
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
