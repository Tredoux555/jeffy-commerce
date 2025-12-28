'use client';

import { useState } from 'react';
import { FileText, Download, Filter, Calendar, Search, Eye, Printer, MoreHorizontal, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  shippingAddress: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderManagerProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => Promise<void>;
  onExport: (orderIds: string[]) => void;
  onViewOrder: (order: Order) => void;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

const paymentColors = {
  pending: 'text-yellow-600',
  paid: 'text-green-600',
  refunded: 'text-blue-600',
  failed: 'text-red-600'
};

export function OrderManager({ orders, onUpdateStatus, onExport, onViewOrder }: OrderManagerProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    let matchesDate = true;
    if (dateRange.from) {
      matchesDate = new Date(order.createdAt) >= new Date(dateRange.from);
    }
    if (dateRange.to && matchesDate) {
      matchesDate = new Date(order.createdAt) <= new Date(dateRange.to);
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    revenue: orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
  };

  const toggleSelect = (id: string) => {
    setSelectedOrders(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <FileText className="h-5 w-5 text-[#ff6b35] mb-2" />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <Clock className="h-5 w-5 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <Truck className="h-5 w-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{stats.processing}</p>
          <p className="text-sm text-gray-600">Processing</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats.shipped}</p>
          <p className="text-sm text-gray-600">Shipped</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <FileText className="h-5 w-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
          <p className="text-sm text-gray-600">Revenue</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          className="px-3 py-2 border rounded-lg"
          placeholder="From"
        />

        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          className="px-3 py-2 border rounded-lg"
          placeholder="To"
        />

        {selectedOrders.length > 0 && (
          <Button onClick={() => onExport(selectedOrders)}>
            <Download className="h-4 w-4 mr-2" />
            Export ({selectedOrders.length})
          </Button>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  onChange={(e) => setSelectedOrders(e.target.checked ? filteredOrders.map(o => o.id) : [])}
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                />
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium">Order</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Customer</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Items</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Total</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Payment</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Date</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleSelect(order.id)}
                  />
                </td>
                <td className="px-4 py-3">
                  <button 
                    onClick={() => onViewOrder(order)}
                    className="font-medium text-[#ff6b35] hover:underline"
                  >
                    #{order.orderNumber}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-gray-500">{order.customerEmail}</p>
                </td>
                <td className="px-4 py-3">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </td>
                <td className="px-4 py-3 font-medium">{formatCurrency(order.total)}</td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${statusColors[order.status]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-medium ${paymentColors[order.paymentStatus]}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onViewOrder(order)} className="p-1 hover:bg-gray-100 rounded">
                      <Eye className="h-4 w-4 text-gray-500" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Printer className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
