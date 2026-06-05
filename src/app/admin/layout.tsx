'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Gift, 
  MapPin, 
  Bell,
  Send, 
  Rocket, 
  Factory, 
  Folder,
  ChevronDown,
  ChevronRight,
  DollarSign,
  RotateCcw,
  Star,
  FileText,
  Scale,
  Activity,
  ShoppingBag,
  Truck,
  AlertTriangle,
  Megaphone
} from 'lucide-react';
import { AdminNotifications } from '@/components/admin-notifications';

// Badge component for counts
function CountBadge({ count, color = 'orange' }: { count: number; color?: 'orange' | 'green' | 'blue' }) {
  if (count === 0) return null;
  const colors = {
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500'
  };
  return (
    <span className={`ml-auto ${colors[color]} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
      {count}
    </span>
  );
}

// Nav section header
function NavSection({ title }: { title: string }) {
  return (
    <div className="mt-6 mb-2 px-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
    </div>
  );
}

// Nav link component
function NavLink({ 
  href, 
  icon: Icon, 
  children, 
  count,
  countColor,
  isActive 
}: { 
  href: string; 
  icon: any; 
  children: React.ReactNode;
  count?: number;
  countColor?: 'orange' | 'green' | 'blue';
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-jeffy-orange text-white' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1">{children}</span>
      {count !== undefined && <CountBadge count={count} color={countColor} />}
    </Link>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  
  // Live counts
  const [counts, setCounts] = useState({
    wantsReady: 0,
    partnersPending: 0,
    ordersNew: 0
  });

  // Fetch counts on mount and periodically
  useEffect(() => {
    const fetchCounts = async () => {
      const supabase = createClient();

      // Incoming wishes waiting to be reviewed / sourced
      const { count: wantsReady } = await supabase
        .from('wants')
        .select('*', { count: 'exact', head: true });

      // Pending reseller (distributor) applications
      const { count: partnersPending } = await supabase
        .from('distributors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // New orders (pending status)
      const { count: ordersNew } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setCounts({
        wantsReady: wantsReady || 0,
        partnersPending: partnersPending || 0,
        ordersNew: ordersNew || 0
      });
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Check if current path is in "More" section
  const isMoreSection = [
    '/admin/factories',
    '/admin/refunds',
    '/admin/reviews',
    '/admin/categories',
    '/admin/seed-docs',
    '/admin/activity',
    '/admin/customers',
    '/admin/inventory',
    '/admin/promotions',
    '/admin/analytics',
    '/admin/zones'
  ].some(path => pathname.startsWith(path));

  // Auto-expand "More" if we're in that section
  useEffect(() => {
    if (isMoreSection) setMoreOpen(true);
  }, [isMoreSection]);

  const isActive = (path: string) => {
    if (path === '/admin') return pathname === '/admin';
    return pathname.startsWith(path);
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-65px)] p-4 overflow-y-auto">
          <nav className="space-y-1">
            
            {/* Command Center */}
            <NavLink href="/admin" icon={LayoutDashboard} isActive={isActive('/admin') && pathname === '/admin'}>
              Command Center
            </NavLink>

            {/* ==================== SOURCING PIPELINE ==================== */}
            <NavSection title="Sourcing Pipeline" />
            
            <NavLink
              href="/admin/wants"
              icon={Gift}
              isActive={isActive('/admin/wants')}
              count={counts.wantsReady}
              countColor="green"
            >
              Wishes
            </NavLink>
            
            <NavLink href="/admin/products" icon={Package} isActive={isActive('/admin/products')}>
              Products
            </NavLink>

            {/* ==================== RESELLERS ==================== */}
            <NavSection title="Resellers" />

            <NavLink
              href="/admin/distributors"
              icon={Users}
              isActive={isActive('/admin/distributors')}
              count={counts.partnersPending}
              countColor="orange"
            >
              Distributors
            </NavLink>

            <NavLink href="/admin/wholesale" icon={DollarSign} isActive={isActive('/admin/wholesale')}>
              Wholesale prices
            </NavLink>

            <NavLink href="/admin/finance" icon={DollarSign} isActive={isActive('/admin/finance')}>
              Finance
            </NavLink>

            <NavLink href="/admin/zones" icon={MapPin} isActive={isActive('/admin/zones')}>
              Zones
            </NavLink>
            
            <NavLink href="/admin/starter-kit" icon={ShoppingBag} isActive={isActive('/admin/starter-kit')}>
              Starter Kit
            </NavLink>
            
            <NavLink href="/admin/agent-order" icon={Truck} isActive={isActive('/admin/agent-order')}>
              Agent Order
            </NavLink>

            {/* ==================== ORDERS ==================== */}
            <NavSection title="Orders" />
            
            <NavLink
              href="/admin/orders"
              icon={ShoppingCart}
              isActive={isActive('/admin/orders')}
              count={counts.ordersNew}
              countColor="blue"
            >
              All Orders
            </NavLink>

            {/* ==================== GROWTH ==================== */}
            <NavSection title="Growth" />

            <NavLink href="/admin/campaign" icon={Megaphone} isActive={isActive('/admin/campaign')}>
              Wishlist Campaign
            </NavLink>

            <NavLink href="/admin/followers" icon={Users} isActive={isActive('/admin/followers')}>
              Followers
            </NavLink>
            
            <NavLink href="/admin/launch" icon={Rocket} isActive={isActive('/admin/launch')}>
              Launch Playbook
            </NavLink>
            
            <NavLink href="/admin/outreach" icon={Send} isActive={isActive('/admin/outreach')}>
              Influencer Outreach
            </NavLink>
            
            <NavLink href="/admin/roadmap" icon={Rocket} isActive={isActive('/admin/roadmap')}>
              Launch Roadmap
            </NavLink>
            
            <NavLink href="/admin/growth/township-strategy" icon={MapPin} isActive={isActive('/admin/growth/township-strategy')}>
              Township Strategy
            </NavLink>

            {/* ==================== MORE (Collapsible) ==================== */}
            <div className="mt-6 mb-2">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
              >
                {moreOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                More Tools
              </button>
            </div>
            
            {moreOpen && (
              <div className="space-y-1 pl-2 border-l-2 border-gray-100 ml-4">
                {/* Research */}
                <p className="text-xs text-gray-400 px-4 pt-2">Research</p>
                <NavLink href="/admin/factories" icon={Factory} isActive={isActive('/admin/factories')}>
                  Factory Database
                </NavLink>
                <NavLink href="/admin/procurement" icon={Package} isActive={pathname === '/admin/procurement'}>
                  Procurement Hub
                </NavLink>
                
                {/* Finance */}
                <p className="text-xs text-gray-400 px-4 pt-4">Finance</p>
                <NavLink href="/admin/refunds" icon={RotateCcw} isActive={isActive('/admin/refunds')}>
                  Refunds
                </NavLink>
                
                {/* Content */}
                <p className="text-xs text-gray-400 px-4 pt-4">Content</p>
                <NavLink href="/admin/reviews" icon={Star} isActive={isActive('/admin/reviews')}>
                  Reviews
                </NavLink>
                <NavLink href="/admin/categories" icon={Folder} isActive={isActive('/admin/categories')}>
                  Categories
                </NavLink>
                
                {/* System */}
                <p className="text-xs text-gray-400 px-4 pt-4">System</p>
                <NavLink href="/admin/category-fixer" icon={AlertTriangle} isActive={isActive('/admin/category-fixer')}>
                  Category Fixer
                </NavLink>
                <NavLink href="/admin/seed-docs" icon={FileText} isActive={isActive('/admin/seed-docs')}>
                  Legal Docs
                </NavLink>
                <NavLink href="/admin/analytics" icon={Activity} isActive={isActive('/admin/analytics')}>
                  Analytics
                </NavLink>
              </div>
            )}

            {/* ==================== EXTERNAL LINKS ==================== */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-1">
              <Link
                href="/legal"
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Scale className="h-5 w-5" />
                Legal Pages
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition font-medium"
              >
                <span className="text-lg">🏥</span>
                Health Check
              </Link>
            </div>
            
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
