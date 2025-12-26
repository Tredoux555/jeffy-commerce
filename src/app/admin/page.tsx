import { createClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';
import { Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get stats
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_cents')
    .eq('payment_status', 'completed');

  const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_cents, 0) || 0;

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Health Check Button */}
      <div className="mb-8 flex gap-4">
        <a 
          href="/health" 
          target="_blank"
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#ff6b35] text-white hover:bg-orange-600 transition font-semibold shadow-lg"
        >
          🏥 System Health Check
        </a>
        <a 
          href="/admin/survey" 
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition font-semibold shadow-lg"
        >
          📊 Product Survey Results
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Package className="h-6 w-6 text-jeffy-orange" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Products</p>
              <p className="text-2xl font-bold">{productCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Orders</p>
              <p className="text-2xl font-bold">{orderCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Order</p>
              <p className="text-2xl font-bold">
                {orderCount ? formatCurrency(totalRevenue / orderCount) : 'R0.00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="font-semibold">Recent Orders</h2>
        </div>
        <div className="divide-y">
          {recentOrders && recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(order.total_cents)}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'paid' || order.status === 'delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
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
