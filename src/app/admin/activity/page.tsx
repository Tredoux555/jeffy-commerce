'use client';

import { useState } from 'react';
import { Activity, User, Package, ShoppingCart, Settings, Search, Filter, Clock } from 'lucide-react';

// Mock data
const mockActivities = [
  { id: '1', admin: 'admin@jeffy.co.za', action: 'update', entity: 'product', entityName: 'Wireless Earbuds', changes: { price: { old: 299, new: 249 } }, time: '5 minutes ago' },
  { id: '2', admin: 'admin@jeffy.co.za', action: 'create', entity: 'order', entityName: 'JEF-001234', changes: null, time: '15 minutes ago' },
  { id: '3', admin: 'manager@jeffy.co.za', action: 'delete', entity: 'product', entityName: 'Old Product', changes: null, time: '1 hour ago' },
  { id: '4', admin: 'admin@jeffy.co.za', action: 'export', entity: 'orders', entityName: 'December Orders', changes: null, time: '2 hours ago' },
  { id: '5', admin: 'manager@jeffy.co.za', action: 'update', entity: 'setting', entityName: 'Shipping Rates', changes: { standard: { old: 99, new: 79 } }, time: '3 hours ago' },
  { id: '6', admin: 'admin@jeffy.co.za', action: 'login', entity: 'system', entityName: 'Admin Panel', changes: null, time: '4 hours ago' },
];

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  export: 'bg-purple-100 text-purple-700',
  login: 'bg-gray-100 text-gray-700',
};

const entityIcons: Record<string, any> = {
  product: Package,
  order: ShoppingCart,
  user: User,
  setting: Settings,
  system: Activity,
  orders: ShoppingCart,
};

export default function ActivityLogPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredActivities = mockActivities.filter(a => {
    if (filter !== 'all' && a.action !== filter) return false;
    if (search && !a.entityName.toLowerCase().includes(search.toLowerCase()) && !a.admin.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-gray-400" />
          Activity Log
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search activities..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
        <div className="flex gap-2">
          {['all', 'create', 'update', 'delete', 'export', 'login'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-[#ff6b35] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="divide-y">
          {filteredActivities.map((activity) => {
            const Icon = entityIcons[activity.entity] || Activity;
            return (
              <div key={activity.id} className="p-4 hover:bg-gray-50 flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{activity.admin}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColors[activity.action]}`}>
                      {activity.action}
                    </span>
                    <span className="text-gray-500">{activity.entity}</span>
                  </div>
                  <p className="text-gray-600">{activity.entityName}</p>
                  {activity.changes && (
                    <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                      {Object.entries(activity.changes).map(([key, val]: [string, any]) => (
                        <p key={key}>
                          <span className="text-gray-500">{key}:</span>{' '}
                          <span className="text-red-500 line-through">{val.old}</span>{' '}
                          → <span className="text-green-600">{val.new}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-gray-400 text-sm flex-shrink-0">
                  <Clock className="h-4 w-4" />
                  {activity.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No activities found</p>
        </div>
      )}
    </div>
  );
}
