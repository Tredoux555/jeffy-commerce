'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package, Download, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Mock data
const salesData = {
  today: 125000,
  yesterday: 98000,
  thisWeek: 875000,
  lastWeek: 720000,
  thisMonth: 3250000,
  lastMonth: 2890000,
};

const topProducts = [
  { name: 'Wireless Earbuds Pro', sold: 145, revenue: 4350000 },
  { name: 'Smart Watch Series 5', sold: 89, revenue: 8010000 },
  { name: 'Portable Charger 20000mAh', sold: 234, revenue: 2340000 },
  { name: 'Bluetooth Speaker Mini', sold: 178, revenue: 1780000 },
  { name: 'USB-C Hub 7-in-1', sold: 156, revenue: 1560000 },
];

const topCategories = [
  { name: 'Electronics', orders: 456, revenue: 12500000 },
  { name: 'Home & Living', orders: 234, revenue: 5600000 },
  { name: 'Fashion', orders: 189, revenue: 3200000 },
  { name: 'Beauty', orders: 145, revenue: 2100000 },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month');

  const growth = ((salesData.thisMonth - salesData.lastMonth) / salesData.lastMonth * 100).toFixed(1);
  const isPositive = parseFloat(growth) > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex gap-2">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard icon={DollarSign} label="Total Revenue" value={formatCurrency(salesData.thisMonth)} change={growth} positive={isPositive} />
        <KPICard icon={ShoppingBag} label="Orders" value="1,234" change="8.2" positive />
        <KPICard icon={Users} label="New Customers" value="342" change="12.5" positive />
        <KPICard icon={Package} label="Products Sold" value="2,891" change="-2.1" positive={false} />
      </div>

      {/* Sales Comparison */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4">Today vs Yesterday</h3>
          <div className="space-y-4">
            <CompareBar label="Today" value={salesData.today} max={salesData.today} color="bg-green-500" />
            <CompareBar label="Yesterday" value={salesData.yesterday} max={salesData.today} color="bg-gray-300" />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {((salesData.today - salesData.yesterday) / salesData.yesterday * 100).toFixed(1)}% increase
          </p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4">This Week vs Last Week</h3>
          <div className="space-y-4">
            <CompareBar label="This Week" value={salesData.thisWeek} max={salesData.thisWeek} color="bg-blue-500" />
            <CompareBar label="Last Week" value={salesData.lastWeek} max={salesData.thisWeek} color="bg-gray-300" />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {((salesData.thisWeek - salesData.lastWeek) / salesData.lastWeek * 100).toFixed(1)}% increase
          </p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4">This Month vs Last Month</h3>
          <div className="space-y-4">
            <CompareBar label="This Month" value={salesData.thisMonth} max={salesData.thisMonth} color="bg-purple-500" />
            <CompareBar label="Last Month" value={salesData.lastMonth} max={salesData.thisMonth} color="bg-gray-300" />
          </div>
          <p className="text-sm text-gray-500 mt-4">{growth}% increase</p>
        </div>
      </div>

      {/* Top Products & Categories */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b"><h3 className="font-bold">Top Selling Products</h3></div>
          <div className="divide-y">
            {topProducts.map((product, idx) => (
              <div key={idx} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-bold">#{idx + 1}</span>
                  <span className="font-medium">{product.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(product.revenue)}</p>
                  <p className="text-sm text-gray-500">{product.sold} sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b"><h3 className="font-bold">Top Categories</h3></div>
          <div className="divide-y">
            {topCategories.map((cat, idx) => (
              <div key={idx} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 font-bold">#{idx + 1}</span>
                  <span className="font-medium">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(cat.revenue)}</p>
                  <p className="text-sm text-gray-500">{cat.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, change, positive }: { icon: any; label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5 text-gray-400" />
        <span className={`flex items-center gap-1 text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {change}%
        </span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function CompareBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percent = (value / max) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-bold">{formatCurrency(value)}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
