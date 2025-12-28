'use client';

import { useState } from 'react';
import { Package, AlertTriangle, RefreshCw, Truck, Warehouse, Plus, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Mock data
const mockInventory = [
  { id: '1', name: 'Wireless Earbuds Pro', sku: 'WEP-001', stock: 5, reorderPoint: 10, warehouse: 'JHB-MAIN', status: 'low' },
  { id: '2', name: 'Smart Watch Series 5', sku: 'SWS-005', stock: 45, reorderPoint: 20, warehouse: 'JHB-MAIN', status: 'ok' },
  { id: '3', name: 'USB-C Hub 7-in-1', sku: 'UCH-007', stock: 0, reorderPoint: 15, warehouse: 'JHB-MAIN', status: 'out' },
  { id: '4', name: 'Portable Charger 20K', sku: 'PC-020', stock: 8, reorderPoint: 10, warehouse: 'JHB-MAIN', status: 'low' },
];

const mockPendingOrders = [
  { id: '1', product: 'Wireless Earbuds Pro', quantity: 100, supplier: '1688 Supplier', status: 'shipped', eta: '2024-12-30' },
  { id: '2', product: 'USB-C Hub 7-in-1', quantity: 50, supplier: 'AliExpress', status: 'ordered', eta: '2025-01-05' },
];

export default function InventoryPage() {
  const [filter, setFilter] = useState('all');

  const lowStock = mockInventory.filter(i => i.status === 'low').length;
  const outOfStock = mockInventory.filter(i => i.status === 'out').length;

  const filtered = filter === 'all' ? mockInventory : mockInventory.filter(i => i.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <button className="flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          <Plus className="h-5 w-5" /> Create Reorder
        </button>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg"><AlertTriangle className="h-6 w-6 text-red-600" /></div>
          <div>
            <p className="text-2xl font-bold text-red-700">{outOfStock}</p>
            <p className="text-red-600 text-sm">Out of Stock</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-amber-100 rounded-lg"><Package className="h-6 w-6 text-amber-600" /></div>
          <div>
            <p className="text-2xl font-bold text-amber-700">{lowStock}</p>
            <p className="text-amber-600 text-sm">Low Stock</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg"><Truck className="h-6 w-6 text-blue-600" /></div>
          <div>
            <p className="text-2xl font-bold text-blue-700">{mockPendingOrders.length}</p>
            <p className="text-blue-600 text-sm">Pending Orders</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['all', 'low', 'out', 'ok'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-[#ff6b35] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : f === 'out' ? 'Out of Stock' : 'In Stock'}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">SKU</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Warehouse</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Reorder Point</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{item.name}</td>
                <td className="px-6 py-4 text-gray-500 font-mono text-sm">{item.sku}</td>
                <td className="px-6 py-4 text-gray-500">{item.warehouse}</td>
                <td className="px-6 py-4 text-center font-bold">{item.stock}</td>
                <td className="px-6 py-4 text-center text-gray-500">{item.reorderPoint}</td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={item.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[#ff6b35] hover:underline text-sm">Reorder</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pending Orders */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-2">
          <Truck className="h-5 w-5 text-gray-400" />
          <h2 className="font-bold">Pending Reorders</h2>
        </div>
        <div className="divide-y">
          {mockPendingOrders.map((order) => (
            <div key={order.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{order.product}</p>
                <p className="text-sm text-gray-500">{order.supplier} • {order.quantity} units</p>
              </div>
              <div className="text-right">
                <StatusBadge status={order.status} />
                <p className="text-sm text-gray-500 mt-1">ETA: {order.eta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ok: 'bg-green-100 text-green-700',
    low: 'bg-amber-100 text-amber-700',
    out: 'bg-red-100 text-red-700',
    ordered: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
  };
  const labels: Record<string, string> = {
    ok: 'In Stock',
    low: 'Low Stock',
    out: 'Out of Stock',
    ordered: 'Ordered',
    shipped: 'Shipped',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
}
