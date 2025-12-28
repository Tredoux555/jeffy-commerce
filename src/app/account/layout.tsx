'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, ShoppingBag, Heart, Gift, MapPin, Bell, Settings, LogOut, Star } from 'lucide-react';

const menuItems = [
  { href: '/account', icon: User, label: 'Dashboard' },
  { href: '/account/orders', icon: ShoppingBag, label: 'My Orders' },
  { href: '/account/wishlist', icon: Heart, label: 'Wishlist' },
  { href: '/account/rewards', icon: Gift, label: 'Rewards' },
  { href: '/account/reviews', icon: Star, label: 'My Reviews' },
  { href: '/account/addresses', icon: MapPin, label: 'Addresses' },
  { href: '/account/notifications', icon: Bell, label: 'Notifications' },
  { href: '/account/settings', icon: Settings, label: 'Settings' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border p-4 sticky top-20">
            <div className="flex items-center gap-3 p-3 mb-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-[#ff6b35] rounded-full flex items-center justify-center text-white font-bold text-lg">
                J
              </div>
              <div>
                <p className="font-bold">John Doe</p>
                <p className="text-sm text-gray-500">john@example.com</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    pathname === item.href
                      ? 'bg-[#ff6b35] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full transition">
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
