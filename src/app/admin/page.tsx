import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { Package, ShoppingCart, DollarSign, TrendingUp, Gift, Bell, Users, ArrowUpRight } from 'lucide-react';
import { LowStockAlert } from '@/components/low-stock-alert';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Basic stats
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: draftCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft');

  const { count: activeCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_cents')
    .eq('payment_status', 'completed');

  const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_cents, 0) || 0;

  // Today's stats
  const today = new Date().toISOString().split('T')[0];
  const { count: todayOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today);

  const { data: todayRevenue } = await supabase
    .from('orders')
    .select('total_cents')
    .gte('created_at', today)
    .eq('payment_status', 'completed');

  const todayTotal = todayRevenue?.reduce((sum, o) => sum + o.total_cents, 0) || 0;

  // Wants stats
  const { count: activeWants } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: readyWants } = await supabase
    .from('wants')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'threshold_reached');

  // Pending notifications
  const { count: pendingNotifications } = await supabase
    .from('want_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // Low stock products
  const { data: allProducts } = await supabase
    .from('products')
    .select('id, name, slug, quantity, low_stock_threshold')
    .eq('status', 'active')
    .eq('track_inventory', true);

  const lowStockProducts = (allProducts || []).filter(p => p.quantity <= p.low_stock_threshold);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert products={lowStockProducts} />

      {/* Action Required Banner */}
      {(readyWants || 0) > 0 || (pendingNotifications || 0) > 0 ? (
        <div className="mb-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 animate-pulse" />
              <div>
                <p className="font-bold">Action Required!</p>
                <p className="text-sm text-white/90">
                  {readyWants || 0} wants ready to source • {pendingNotifications || 0} WhatsApp to send
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {(readyWants || 0) > 0 && (
                <Link href="/admin/wants" className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
                  View Wants
                </Link>
              )}
              {(pendingNotifications || 0) > 0 && (
                <Link href="/admin/notifications" className="bg-white/20 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition">
                  Send Messages
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick Links */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Link href="/health" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#ff6b35] text-white hover:bg-orange-600 transition font-medium text-sm">
          🏥 Health Check
        </Link>
        <Link href="/admin/products/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium text-sm">
          + Add Product
        </Link>
        <Link href="/admin/notifications" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white hover:bg-green-600 transition font-medium text-sm">
          💬 WhatsApp Queue
        </Link>
      </div>

      {/* Today's Snapshot */}
      <div className="mb-8 p-4 bg-gradient-to-r from-[#0f172a] to-slate-800 rounded-xl text-white">
        <h3 className="text-sm text-white/70 mb-2">Today's Snapshot</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-3xl font-bold">{todayOrders || 0}</p>
            <p className="text-sm text-white/70">Orders</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{formatCurrency(todayTotal)}</p>
            <p className="text-sm text-white/70">Revenue</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <Package className="h-8 w-8 text-[#ff6b35]" />
            <ArrowUpRight className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-2">{productCount || 0}</p>
          <p className="text-sm text-gray-500">Products</p>
          <div className="mt-1 flex gap-2 text-xs">
            <span className="text-green-600">{activeCount || 0} live</span>
            <span className="text-orange-600">{draftCount || 0} draft</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <ShoppingCart className="h-8 w-8 text-green-600" />
            <ArrowUpRight className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-2">{orderCount || 0}</p>
          <p className="text-sm text-gray-500">Orders</p>
        </div>

        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <ArrowUpRight className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-2">{formatCurrency(totalRevenue)}</p>
          <p className="text-sm text-gray-500">Revenue</p>
        </div>

        <div className="bg-white rounded-xl p-4 border hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <Gift className="h-8 w-8 text-[#ff6b35]" />
            <ArrowUpRight className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold mt-2">{activeWants || 0}</p>
          <p className="text-sm text-gray-500">Active Wants</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-[#ff6b35] hover:underline">View All →</Link>
        </div>
        <div className="divide-y">
          {recentOrders && recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(order.total_cents)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'paid' || order.status === 'delivered'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
