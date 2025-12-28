'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Home, ShoppingBag, Heart, User, Search, ChevronRight, Phone, MapPin, HelpCircle } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: Array<{ label: string; href: string }>;
}

const defaultNavItems: NavItem[] = [
  { label: 'Home', href: '/', icon: <Home className="h-5 w-5" /> },
  { label: 'Shop', href: '/products', icon: <ShoppingBag className="h-5 w-5" />, children: [
    { label: 'All Products', href: '/products' },
    { label: 'New Arrivals', href: '/products?sort=newest' },
    { label: 'Best Sellers', href: '/products?sort=popular' },
    { label: 'On Sale', href: '/products?sale=true' },
  ]},
  { label: 'Wishlist', href: '/wishlist', icon: <Heart className="h-5 w-5" /> },
  { label: 'Account', href: '/account', icon: <User className="h-5 w-5" /> },
];

interface MobileNavProps {
  items?: NavItem[];
  categories?: Array<{ name: string; slug: string }>;
}

export function MobileNav({ items = defaultNavItems, categories = [] }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white z-50 transform transition-transform duration-300 lg:hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" onClick={closeMenu} className="text-2xl font-bold text-[#ff6b35]">
            Jeffy
          </Link>
          <button onClick={closeMenu} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <Link
            href="/search"
            onClick={closeMenu}
            className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg text-gray-500"
          >
            <Search className="h-5 w-5" />
            <span>Search products...</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <div className="py-2">
            {items.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  // Expandable item
                  <>
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${
                        expandedItem === item.label ? 'rotate-90' : ''
                      }`} />
                    </button>
                    {expandedItem === item.label && (
                      <div className="bg-gray-50 py-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={closeMenu}
                            className="block px-12 py-2 text-gray-600 hover:text-[#ff6b35]"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Simple link
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="border-t py-2">
              <p className="px-4 py-2 text-xs text-gray-500 uppercase">Categories</p>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/products?category=${cat.slug}`}
                  onClick={closeMenu}
                  className="block px-4 py-2 hover:bg-gray-50"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Footer Links */}
        <div className="border-t p-4 space-y-2">
          <Link href="/contact" onClick={closeMenu} className="flex items-center gap-3 py-2 text-gray-600 hover:text-[#ff6b35]">
            <Phone className="h-5 w-5" />
            <span>Contact Us</span>
          </Link>
          <Link href="/track" onClick={closeMenu} className="flex items-center gap-3 py-2 text-gray-600 hover:text-[#ff6b35]">
            <MapPin className="h-5 w-5" />
            <span>Track Order</span>
          </Link>
          <Link href="/help" onClick={closeMenu} className="flex items-center gap-3 py-2 text-gray-600 hover:text-[#ff6b35]">
            <HelpCircle className="h-5 w-5" />
            <span>Help Center</span>
          </Link>
        </div>
      </div>
    </>
  );
}

// Bottom Navigation for Mobile
export function MobileBottomNav() {
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-30 lg:hidden">
      <div className="flex justify-around py-2">
        <Link href="/" className="flex flex-col items-center py-1 px-3 text-gray-600 hover:text-[#ff6b35]">
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link href="/products" className="flex flex-col items-center py-1 px-3 text-gray-600 hover:text-[#ff6b35]">
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">Search</span>
        </Link>
        <Link href="/cart" className="flex flex-col items-center py-1 px-3 text-gray-600 hover:text-[#ff6b35] relative">
          <ShoppingBag className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 right-0 w-5 h-5 bg-[#ff6b35] text-white text-xs rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-xs mt-1">Cart</span>
        </Link>
        <Link href="/wishlist" className="flex flex-col items-center py-1 px-3 text-gray-600 hover:text-[#ff6b35]">
          <Heart className="h-6 w-6" />
          <span className="text-xs mt-1">Wishlist</span>
        </Link>
        <Link href="/account" className="flex flex-col items-center py-1 px-3 text-gray-600 hover:text-[#ff6b35]">
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Account</span>
        </Link>
      </div>
    </nav>
  );
}
