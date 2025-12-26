'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface AnalyticsData {
  revenue: { value: number; change: number; period: string };
  orders: { value: number; change: number; period: string };
  customers: { value: number; change: number; period: string };
  avgOrder: { value: number; change: number; period: string };
  visitors: { value: number; change: number; period: string };
  conversionRate: { value: number; change: number; period: string };
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image?: string;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  topProducts: TopProduct[];
  recentOrders: Array<{ id: string; customer: string; total: number; status: string; date: string }>;
}

export function AnalyticsDashboard({ data, topProducts, recentOrders }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('week');

  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(cents / 100);

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    format = 'number' 
  }: { 
    title: string; 
    value: number; 
    change: number; 
    icon: any;
    format?: 'number' | 'currency' | 'percent';
  }) => {
    const isPositive = change >= 0;
    const formattedValue = format === 'currency' 
      ? formatCurrency(value)
      : format === 'percent'
      ? `${value.toFixed(1)}%`
      : value.toLocaleString();

    return (
      <div className="bg-white rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Icon className="h-5 w-5 text-[#ff6b35]" />
          </div>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        </div>
        <p className="text-2xl font-bold">{formattedValue}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['today', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                period === p ? 'bg-white shadow' : 'hover:bg-white/50'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Revenue" value={data.revenue.value} change={data.revenue.change} icon={DollarSign} format="currency" />
        <StatCard title="Orders" value={data.orders.value} change={data.orders.change} icon={ShoppingCart} />
        <StatCard title="Customers" value={data.customers.value} change={data.customers.change} icon={Users} />
        <StatCard title="Avg Order" value={data.avgOrder.value} change={data.avgOrder.change} icon={Package} format="currency" />
        <StatCard title="Visitors" value={data.visitors.value} change={data.visitors.change} icon={Eye} />
        <StatCard title="Conversion" value={data.conversionRate.value} change={data.conversionRate.change} icon={TrendingUp} format="percent" />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold mb-4">Top Products</h2>
          <div className="space-y-4">
            {topProducts.slice(0, 5).map((product, i) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.sales} sales</p>
                </div>
                <p className="font-bold text-[#ff6b35]">{formatCurrency(product.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">#{order.id.slice(-6)}</p>
                  <p className="text-sm text-gray-500">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini stat for header/sidebar
export function MiniStat({ label, value, change }: { label: string; value: string; change?: number }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {change !== undefined && (
        <p className={`text-xs ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
        </p>
      )}
    </div>
  );
}
