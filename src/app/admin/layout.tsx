'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Gift, Truck, MapPin } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-bold text-jeffy-orange">
            Jeffy Admin
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Store
          </Link>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-65px)] p-4">
          <nav className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Package className="h-5 w-5" />
              Products
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ShoppingCart className="h-5 w-5" />
              Orders
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Users className="h-5 w-5" />
              Categories
            </Link>
            <Link
              href="/admin/wants"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Gift className="h-5 w-5" />
              Wants
            </Link>
            <Link
              href="/admin/procurement"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Truck className="h-5 w-5" />
              Procurement
            </Link>
            <Link
              href="/admin/partners"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/partners' 
                  ? 'bg-jeffy-orange text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <Users className="h-5 w-5" />
              Zone Partners
            </Link>
            <Link
              href="/admin/zones"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/zones' 
                  ? 'bg-jeffy-orange text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <MapPin className="h-5 w-5" />
              Zones
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}