'use client';

import { useState } from 'react';
import { Activity, User, Package, ShoppingBag, Settings, Search, Filter, Download } from 'lucide-react';

interface ActivityEntry {
  id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  entityType: string;
  entityName: string;
  changes?: Record<string, { old: any; new: any }>;
  timestamp: string;
  ipAddress: string;
}

const mockActivity: ActivityEntry[] = [
  { id: '1', adminName: 'John Admin', adminEmail: 'john@jeffy.co.za', action: 'update', entityType: 'product', entityName: 'Wireless Earbuds Pro', changes: { price: { old: 299, new: 249 } }, timestamp: '2024-12-26 14:32', ipAddress: '192.168.1.1' },
  { id: '2', adminName: 'Jane Admin', adminEmail: 'jane@jeffy.co.za', action: 'create', entityType: 'product', entityName: 'New Smart Watch', timestamp: '2024-12-26 13:15', ipAddress: '192.168.1.2' },
  { id: '3', adminName: 'John Admin', adminEmail: 'john@jeffy.co.za', action: 'update', entityType: 'order', entityName: 'JEF-001234', changes: { status: { old: 'pending', new: 'shipped' } }, timestamp: '2024-12-26 12:45', ipAddress: '192.168.1.1' },
  { id: '4', adminName: 'Jane Admin', adminEmail: 'jane@jeffy.co.za', action: 'delete', entityType: 'discount', entityName: 'OLD20', timestamp: '2024-12-26 11:30', ipAddress: '192.168.1.2' },
  { id: '5', adminName: 'John Admin', adminEmail: 'john@jeffy.co.za', action: 'export', entityType: 'orders', entityName: 'December 2024 Orders', timestamp: '2024-12-26 10:00', ipAddress: '192.168.1.1' },
];

export function AdminActivityLog() {
  const [activity] = useState(mockActivity);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  const getActionIcon = (entityType: string) => {
    const icons: Record<string, any> = {
      product: Package,
      order: ShoppingBag,
      settings: Settings,
      default: Activity,
    };
    return icons[entityType] || icons.default;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'text-green-600 bg-green-50',
      update: 'text-blue-600 bg-blue-50',
      delete: 'text-red-600 bg-red-50',
      export: 'text-purple-600 bg-purple-50',
      login: 'text-gray-600 bg-gray-50',
    };
    return colors[action] || colors.update;
  };

  const filtered = activity.filter(a => {
    if (filterType !== 'all' && a.entityType !== filterType) return false;
    if (search && !a.entityName.toLowerCase().includes(search.toLowerCase()) && !a.adminName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Activity Log</h2>
          <p className="text-gray-500">Track all admin actions</p>
        </div>
        <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">
          <Download className="h-5 w-5" /> Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search activity..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border rounded-lg px-4 py-2">
          <option value="all">All Types</option>
          <option value="product">Products</option>
          <option value="order">Orders</option>
          <option value="discount">Discounts</option>
          <option value="settings">Settings</option>
        </select>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="divide-y">
          {filtered.map((entry) => {
            const Icon = getActionIcon(entry.entityType);
            return (
              <div key={entry.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${getActionColor(entry.action)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{entry.adminName}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionColor(entry.action)}`}>
                        {entry.action}
                      </span>
                      <span className="text-gray-600">{entry.entityType}</span>
                    </div>
                    <p className="text-gray-800">
                      <span className="font-medium">{entry.entityName}</span>
                    </p>
                    {entry.changes && (
                      <div className="mt-2 text-sm bg-gray-50 rounded p-2">
                        {Object.entries(entry.changes).map(([field, { old, new: newVal }]) => (
                          <p key={field} className="text-gray-600">
                            <span className="font-medium">{field}:</span>{' '}
                            <span className="text-red-600 line-through">{old}</span>{' '}
                            → <span className="text-green-600">{newVal}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{entry.timestamp}</p>
                    <p className="text-xs">{entry.ipAddress}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
