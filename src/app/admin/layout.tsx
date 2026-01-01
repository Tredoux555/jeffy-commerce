'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, Users, Gift, Truck, MapPin, Activity, BarChart3, TrendingUp, Scale, Send, Rocket, Factory, Folder, Bell } from 'lucide-react';
import { AdminNotifications } from '@/components/admin-notifications';

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
          <div className="flex items-center gap-4">
            <AdminNotifications />
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to Store
            </Link>
          </div>
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
              href="/admin/analytics"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/analytics' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              Analytics
            </Link>
            <Link
              href="/admin/products"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/products' || pathname.startsWith('/admin/products/')
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package className="h-5 w-5" />
              Products
            </Link>
            <Link
              href="/admin/categories"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/categories' || pathname.startsWith('/admin/categories/')
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Folder className="h-5 w-5" />
              Categories
            </Link>
            <Link
              href="/admin/orders"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/orders' || pathname.startsWith('/admin/orders/')
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ShoppingCart className="h-5 w-5" />
              Orders
            </Link>
            <Link
              href="/admin/notifications"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/notifications'
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Bell className="h-5 w-5" />
              Notifications
            </Link>
            
            {/* Wants Section */}
            <div className="my-2 border-t border-gray-200 pt-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Wants</p>
            </div>
            <Link
              href="/admin/wants"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/wants' 
                  ? 'bg-[#ff6b35] text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Gift className="h-5 w-5" />
              Wants
            </Link>
            <Link
              href="/admin/survey"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/survey' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              Wants Stats
            </Link>
            
            {/* Operations Section */}
            <div className="my-2 border-t border-gray-200 pt-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Operations</p>
            </div>
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
            
            {/* Sourcing Section */}
            <div className="my-2 border-t border-gray-200 pt-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Sourcing</p>
            </div>
            <Link
              href="/admin/oem-research"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/oem-research' 
                  ? 'bg-amber-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Factory className="h-5 w-5" />
              OEM Research
            </Link>
            <Link
              href="/admin/factories"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/factories' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Factory className="h-5 w-5" />
              1688 Factories
            </Link>
            
            {/* Growth Section */}
            <div className="my-2 border-t border-gray-200 pt-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">Growth</p>
            </div>
            <Link
              href="/admin/outreach"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/outreach' 
                  ? 'bg-pink-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Send className="h-5 w-5" />
              Influencer Outreach
            </Link>
            <Link
              href="/admin/roadmap"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/admin/roadmap' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Rocket className="h-5 w-5" />
              Launch Roadmap
            </Link>
            
            {/* Divider */}
            <div className="my-2 border-t border-gray-200 pt-2">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase mb-2">External</p>
            </div>
            
            <Link
              href="/legal"
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                pathname === '/legal' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Scale className="h-5 w-5" />
              Legal Documents
            </Link>
            
            <Link
              href="/agent"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Activity className="h-5 w-5" />
              Agent Portal
            </Link>
            
            <Link
              href="/health"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff6b35] text-white hover:bg-orange-600 transition font-semibold"
            >
              <span className="text-lg">🏥</span>
              Health Check
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
