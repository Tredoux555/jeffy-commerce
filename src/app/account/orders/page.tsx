'use client';

import { useState } from 'react';
import { Package, Search, Filter, Download, Eye, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

// Mock data
const mockOrders = [
  { id: '1', number: 'JEF-001234', date: '2024-12-24', status: 'delivered', total: 45900, items: 3 },
  { id: '2', number: 'JEF-001189', date: '2024-12-20', status: 'shipped', total: 12500, items: 1 },
  { id: '3', number: 'JEF-001145', date: '2024-12-15', status: 'delivered', total: 78900, items: 5 },
  { id: '4', number: 'JEF-001098', date: '2024-12-10', status: 'delivered', total: 23400, items: 2 },
];

export default function OrdersPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredOrders = mockOrders.filter(order => {
    if (filter !== 'all' && order.status !== filter) return false;
    if (search && !order.number.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <span className="text-gray-500">{mockOrders.length} orders</span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number..."
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
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="divide-y">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold">{order.number}</p>
                      <p className="text-sm text-gray-500">{order.date} • {order.items} item{order.items > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(order.total)}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link href={`/account/orders/${order.id}`} className="flex items-center gap-1 text-sm text-[#ff6b35] hover:underline">
                    <Eye className="h-4 w-4" /> View Details
                  </Link>
                  <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 ml-4">
                    <Download className="h-4 w-4" /> Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No orders found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
