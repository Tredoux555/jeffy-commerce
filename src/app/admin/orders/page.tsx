'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, CheckCircle, Clock, Truck, Package, Filter, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_cents: number;
  delivery_address: string;
  created_at: string;
  user_id: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending_payment: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    const supabase = createClient();
    
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter !== 'all') {
      if (filter === 'unpaid') {
        query = query.eq('payment_status', 'pending');
      } else {
        query = query.eq('status', filter);
      }
    }

    const { data, error } = await query;
    
    if (data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const markAsPaid = async (orderId: string) => {
    setUpdating(orderId);
    const supabase = createClient();

    const { error } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid',
        status: 'processing',
        paid_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (!error) {
      setOrders(orders.map(o => 
        o.id === orderId 
          ? { ...o, payment_status: 'paid', status: 'processing' }
          : o
      ));
    }
    setUpdating(null);
  };

  const exportCSV = () => {
    const headers = ['Order Number', 'Status', 'Payment Status', 'Total (R)', 'Address', 'Date'];
    const rows = filteredOrders.map(o => [
      o.order_number,
      o.status,
      o.payment_status,
      (o.total_cents / 100).toFixed(2),
      `"${o.delivery_address.replace(/"/g, '""')}"`,
      new Date(o.created_at).toLocaleString(),
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jeffy-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredOrders = orders.filter(order => {
    if (!search) return true;
    return order.order_number.toLowerCase().includes(search.toLowerCase()) ||
           order.delivery_address.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-xl">Orders</h1>
                <p className="text-sm text-gray-500">{orders.length} orders</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={fetchOrders} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'unpaid', 'processing', 'out_for_delivery', 'delivered'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className={filter === f ? 'bg-orange-500' : ''}
              >
                {f === 'all' ? 'All' : f === 'unpaid' ? 'Unpaid' : f.replace('_', ' ')}
              </Button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-bold">{order.order_number}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${PAYMENT_STATUS_COLORS[order.payment_status] || 'bg-gray-100'}`}>
                          {order.payment_status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{order.delivery_address}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">R{(order.total_cents / 100).toFixed(2)}</p>
                      {order.payment_status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => markAsPaid(order.id)}
                          disabled={updating === order.id}
                          className="mt-2 bg-green-600 hover:bg-green-700"
                        >
                          {updating === order.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Paid
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
