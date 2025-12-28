'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';

export function MobileBottomNav() {
  const pathname = usePathname();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Don't show on admin, checkout, or partner pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout') || pathname.startsWith('/partner')) {
    return null;
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/products', icon: Search, label: 'Shop' },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { href: '/wishlist', icon: Heart, label: 'Wishlist' },
    { href: '/account', icon: User, label: 'Account' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                isActive ? 'text-[#ff6b35]' : 'text-gray-500'
              }`}
            >
              <div className="relative">
                <item.icon className={`h-6 w-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                {item.badge ? (
                  <span className="absolute -top-2 -right-2 bg-[#ff6b35] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
