'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Package, Truck, CheckCircle, Clock, XCircle, FileText, Printer, UserCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  product: {
    name: string;
    sku: string;
    primary_image_url: string;
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_cents: number;
  subtotal_cents: number;
  delivery_fee_cents: number;
  delivery_address: string;
  delivery_notes: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  created_at: string;
  paid_at: string;
  shipped_at: string;
  delivered_at: string;
  notes: string;
  assigned_partner_id: string | null;
  order_items: OrderItem[];
}

interface ZonePartner {
  id: string;
  full_name: string;
  zone_name: string;
}

const STATUS_FLOW = [
  { key: 'pending_payment', label: 'Pending Payment', icon: Clock },
  { key: 'paid', label: 'Paid', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          quantity,
          unit_price_cents,
          total_cents,
          product:products (name, sku, primary_image_url)
        )
      `)
      .eq('id', orderId)
      .single();

    if (data) {
      setOrder(data as Order);
      setNotes(data.notes || '');
    }
    setLoading(false);
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    const supabase = createClient();
    
    const updates: any = { status: newStatus };
    
    if (newStatus === 'paid' || newStatus === 'processing') {
      updates.payment_status = 'paid';
      if (!order?.paid_at) updates.paid_at = new Date().toISOString();
    }
    if (newStatus === 'out_for_delivery') {
      updates.shipped_at = new Date().toISOString();
    }
    if (newStatus === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (!error) {
      setOrder({ ...order!, ...updates });
    }
    setUpdating(false);
  };

  const saveNotes = async () => {
    const supabase = createClient();
    await supabase.from('orders').update({ notes }).eq('id', orderId);
  };

  const printInvoice = () => {
    window.open(`/admin/orders/${orderId}/invoice`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Order not found</p>
        <Link href="/admin/orders"><Button>Back to Orders</Button></Link>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
              </Link>
              <div>
                <h1 className="font-bold text-xl font-mono">{order.order_number}</h1>
                <p className="text-sm text-gray-500">{formatDateTime(order.created_at)}</p>
              </div>
            </div>
            <Button onClick={printInvoice} variant="outline">
              <FileText className="h-4 w-4 mr-2" /> Invoice
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Timeline */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-4">Order Status</h2>
            <div className="flex items-center justify-between mb-6">
              {STATUS_FLOW.map((status, idx) => {
                const Icon = status.icon;
                const isComplete = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                return (
                  <div key={status.key} className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs mt-2 text-center ${isComplete ? 'text-green-600 font-medium' : 'text-gray-400'}`}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
              {order.status === 'pending_payment' && (
                <Button onClick={() => updateStatus('paid')} disabled={updating} className="bg-green-600">
                  Mark as Paid
                </Button>
              )}
              {order.status === 'paid' && (
                <Button onClick={() => updateStatus('processing')} disabled={updating}>
                  Start Processing
                </Button>
              )}
              {order.status === 'processing' && (
                <Button onClick={() => updateStatus('out_for_delivery')} disabled={updating} className="bg-orange-500">
                  Out for Delivery
                </Button>
              )}
              {order.status === 'out_for_delivery' && (
                <Button onClick={() => updateStatus('delivered')} disabled={updating} className="bg-green-600">
                  Mark Delivered
                </Button>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-4">Items ({order.order_items?.length || 0})</h2>
            <div className="divide-y">
              {order.order_items?.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                    {item.product?.primary_image_url ? (
                      <img src={item.product.primary_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.product?.name || 'Unknown Product'}</p>
                    <p className="text-sm text-gray-500">SKU: {item.product?.sku || 'N/A'}</p>
                    <p className="text-sm">Qty: {item.quantity} × {formatCurrency(item.unit_price_cents)}</p>
                  </div>
                  <div className="text-right font-medium">
                    {formatCurrency(item.total_cents)}
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="border-t pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal_cents || order.total_cents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Delivery</span>
                <span>{formatCurrency(order.delivery_fee_cents || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatCurrency(order.total_cents)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-4">Internal Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="Add notes about this order..."
              className="w-full border rounded-lg p-3 min-h-[100px]"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-4">Customer</h2>
            <div className="space-y-3">
              <p className="font-medium">{order.customer_name || 'Guest'}</p>
              {order.customer_email && <p className="text-sm text-gray-600">{order.customer_email}</p>}
              {order.customer_phone && <p className="text-sm text-gray-600">{order.customer_phone}</p>}
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-4">Delivery Address</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">{order.delivery_address}</p>
            {order.delivery_notes && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs font-medium text-yellow-800 mb-1">Delivery Notes:</p>
                <p className="text-sm text-yellow-700">{order.delivery_notes}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="font-semibold mb-4">Timeline</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span>{formatDateTime(order.created_at)}</span>
              </div>
              {order.paid_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid</span>
                  <span>{formatDateTime(order.paid_at)}</span>
                </div>
              )}
              {order.shipped_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipped</span>
                  <span>{formatDateTime(order.shipped_at)}</span>
                </div>
              )}
              {order.delivered_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivered</span>
                  <span>{formatDateTime(order.delivered_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
