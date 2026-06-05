import { createClient } from '@/lib/supabase/server';
import { TrendingUp, Users, Gift, Clock, CheckCircle, AlertTriangle, DollarSign, Target } from 'lucide-react';

export default async function AnalyticsPage() {
  const supabase = await createClient();

  // Fetch all data
  const [wantsRes, grantsRes, ordersRes, productsRes] = await Promise.all([
    supabase.from('wants').select('*'),
    supabase.from('wishlist_grants').select('*'),
    supabase.from('orders').select('*'),
    supabase.from('products').select('*'),
  ]);

  const wants = wantsRes.data || [];
  const grants = grantsRes.data || [];
  const orders = ordersRes.data || [];
  const products = productsRes.data || [];

  // Calculate stats
  const totalWants = wants.length;
  const activeWants = totalWants; // every submitted wish is a live entry in the weekly draw
  const successfulWants = grants.length; // wishes granted free via the draw
  const expiredWants = 0;

  const totalAgrees = grants.length;
  const avgAgreesPerWant = 0;
  const conversionRate = totalWants > 0 ? ((successfulWants / totalWants) * 100).toFixed(1) : 0;

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_cents || 0), 0) / 100;

  // Top wanted products
  const wantsByTitle = wants.reduce((acc: Record<string, number>, w) => {
    acc[w.title] = (acc[w.title] || 0) + 1;
    return acc;
  }, {});
  const topWanted = Object.entries(wantsByTitle)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentWants = wants.filter(w => new Date(w.created_at) > sevenDaysAgo).length;
  const recentAgrees = grants.filter(a => new Date(a.created_at) > sevenDaysAgo).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
        <p className="text-gray-600">Overview of your Jeffy Commerce performance</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Gift className="h-5 w-5 text-[#ff6b35]" />
            </div>
            <span className="text-gray-500 text-sm">Total Wishes</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalWants}</p>
          <p className="text-xs text-gray-500 mt-1">+{recentWants} this week</p>
        </div>

        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-gray-500 text-sm">Granted Free</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{successfulWants}</p>
          <p className="text-xs text-gray-500 mt-1">{conversionRate}% of wishes</p>
        </div>

        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-gray-500 text-sm">Live Entries</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{activeWants}</p>
          <p className="text-xs text-gray-500 mt-1">in the weekly draw</p>
        </div>

        <div className="bg-white rounded-xl p-5 border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="h-5 w-5 text-purple-600" />
            </div>
            <span className="text-gray-500 text-sm">Granted This Week</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">{recentAgrees}</p>
          <p className="text-xs text-gray-500 mt-1">via the weekly draw</p>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-2 text-yellow-700">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Active</span>
          </div>
          <p className="text-2xl font-bold text-yellow-700 mt-2">{activeWants}</p>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">Expired</span>
          </div>
          <p className="text-2xl font-bold text-red-700 mt-2">{expiredWants}</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">Orders</span>
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-2">{totalOrders}</p>
        </div>

        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-green-700 mt-2">R{totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Top Wanted Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">🔥 Most Wanted Products</h3>
          {topWanted.length > 0 ? (
            <div className="space-y-3">
              {topWanted.map(([title, count], index) => (
                <div key={title} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-300 text-orange-900' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="flex-1 text-gray-700 truncate">{title}</span>
                  <span className="text-sm font-medium text-gray-500">{count} want{count > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No wants yet</p>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">📈 Conversion Funnel</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Wants Created</span>
                <span className="font-medium">{totalWants}</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#ff6b35] rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">With 5+ Agrees</span>
                <span className="font-medium">{wants.filter(w => w.current_agrees >= 5).length}</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-400 rounded-full" 
                  style={{ width: `${totalWants > 0 ? (wants.filter(w => w.current_agrees >= 5).length / totalWants * 100) : 0}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Reached Goal (10)</span>
                <span className="font-medium">{successfulWants}</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full" 
                  style={{ width: `${totalWants > 0 ? (successfulWants / totalWants * 100) : 0}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Fulfilled</span>
                <span className="font-medium">{wants.filter(w => w.status === 'delivered').length}</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${totalWants > 0 ? (wants.filter(w => w.status === 'delivered').length / totalWants * 100) : 0}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
