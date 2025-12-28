import Link from 'next/link';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Gift, Truck, 
  FlaskConical, MapPin, UserCheck, RotateCcw, FileText,
  Megaphone, Rocket, BarChart3, Tag, Bell, Activity
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-65px)] p-4 overflow-y-auto">
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
              href="/admin/discounts"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Tag className="h-5 w-5" />
              Discounts
            </Link>
            
            {/* Wants Section */}
            <div className="pt-4 pb-2">
              <div className="px-4 text-xs font-semibold text-gray-400 uppercase">Wants</div>
            </div>
            <Link
              href="/admin/wants"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Gift className="h-5 w-5" />
              Wants
            </Link>
            <Link
              href="/admin/notifications"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="h-5 w-5" />
              Notifications
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <BarChart3 className="h-5 w-5" />
              Analytics
            </Link>
            
            {/* Operations Section */}
            <div className="pt-4 pb-2">
              <div className="px-4 text-xs font-semibold text-gray-400 uppercase">Operations</div>
            </div>
            <Link
              href="/admin/procurement"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Truck className="h-5 w-5" />
              Procurement
            </Link>
            <Link
              href="/admin/procurement/smart-finder"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg ml-4"
            >
              <span className="text-jeffy-orange">🤖</span>
              Smart Finder
            </Link>
            <Link
              href="/admin/partners"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <UserCheck className="h-5 w-5" />
              Zone Partners
            </Link>
            <Link
              href="/admin/zones"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <MapPin className="h-5 w-5" />
              Zones
            </Link>
            
            {/* Documentation Section */}
            <div className="pt-4 pb-2">
              <div className="px-4 text-xs font-semibold text-gray-400 uppercase">Documentation</div>
            </div>
            <Link
              href="/admin/documentation"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <FileText className="h-5 w-5" />
              Documentation
            </Link>
            
            {/* Growth Section */}
            <div className="pt-4 pb-2">
              <div className="px-4 text-xs font-semibold text-gray-400 uppercase">Growth</div>
            </div>
            <Link
              href="/admin/outreach"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Megaphone className="h-5 w-5" />
              Influencer Outreach
            </Link>
            <Link
              href="/admin/roadmap"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Rocket className="h-5 w-5" />
              Build Progress
            </Link>
            <Link
              href="/admin/activity"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Activity className="h-5 w-5" />
              Activity Log
            </Link>
            
            {/* Dev Tools Section */}
            <div className="pt-4 pb-2">
              <div className="px-4 text-xs font-semibold text-gray-400 uppercase">Dev Tools</div>
            </div>
            <Link
              href="/admin/e2e-test"
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <FlaskConical className="h-5 w-5 text-purple-600" />
              E2E Tests
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
