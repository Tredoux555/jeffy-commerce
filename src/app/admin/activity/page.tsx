'use client';

import { useState } from 'react';
import { Activity, Search, Filter, Package, ShoppingBag, User, Settings, Tag, Download, Clock } from 'lucide-react';

const mockActivity = [
  { id: '1', admin_name: 'Admin', action: 'create', resource_type: 'product', resource_name: 'Wireless Earbuds', created_at: '2024-12-26T15:30:00' },
  { id: '2', admin_name: 'Admin', action: 'update', resource_type: 'order', resource_name: 'JEF-001234', created_at: '2024-12-26T15:25:00' },
  { id: '3', admin_name: 'Admin', action: 'delete', resource_type: 'product', resource_name: 'Old Product', created_at: '2024-12-26T15:20:00' },
  { id: '4', admin_name: 'Admin', action: 'export', resource_type: 'orders', resource_name: 'December Export', created_at: '2024-12-26T15:15:00' },
  { id: '5', admin_name: 'Admin', action: 'update', resource_type: 'settings', resource_name: 'Shipping Rates', created_at: '2024-12-26T15:10:00' },
  { id: '6', admin_name: 'Admin', action: 'login', resource_type: 'auth', resource_name: null, created_at: '2024-12-26T14:00:00' },
];

const resourceIcons: Record<string, any> = {
  product: Package,
  order: ShoppingBag,
  customer: User,
  settings: Settings,
  discount: Tag,
  auth: User,
  orders: Download,
};

const actionColors: Record<string, string> = {
  create: 'text-green-600 bg-green-50',
  update: 'text-blue-600 bg-blue-50',
  delete: 'text-red-600 bg-red-50',
  export: 'text-purple-600 bg-purple-50',
  login: 'text-gray-600 bg-gray-50',
};

export default function ActivityLogPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = mockActivity.filter(item => {
    if (filter !== 'all' && item.resource_type !== filter) return false;
    if (search && !item.resource_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-gray-400" />
          Activity Log
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="all">All Activity</option>
          <option value="product">Products</option>
          <option value="order">Orders</option>
          <option value="customer">Customers</option>
          <option value="settings">Settings</option>
        </select>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="divide-y">
          {filtered.map((item) => {
            const Icon = resourceIcons[item.resource_type] || Activity;
            return (
              <div key={item.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50">
                <div className={`p-2 rounded-lg ${actionColors[item.action] || 'bg-gray-50'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    <span className="text-gray-900">{item.admin_name}</span>
                    <span className="text-gray-500"> {item.action}d </span>
                    {item.resource_name && (
                      <span className="text-gray-900">{item.resource_name}</span>
                    )}
                    {!item.resource_name && item.action === 'login' && (
                      <span className="text-gray-500">to admin panel</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{item.resource_type}</p>
                </div>
                <div className="text-right text-sm text-gray-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatTime(item.created_at)}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No activity found</p>
          </div>
        )}
      </div>
    </div>
  );
}
