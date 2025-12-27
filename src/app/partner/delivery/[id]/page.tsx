'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Package, CheckCircle, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  delivery_address: string;
  delivery_notes: string;
  customer_name: string;
  customer_phone: string;
  order_items: Array<{
    id: string;
    quantity: number;
    product: { name: string; primary_image_url: string };
  }>;
}

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, total_cents,
        delivery_address, delivery_notes,
        customer_name, customer_phone,
        order_items (
          id, quantity,
          product:products (name, primary_image_url)
        )
      `)
      .eq('id', orderId)
      .single();

    if (data) setOrder(data as unknown as Order);
    setLoading(false);
  };

  const markDelivered = async () => {
    setCompleting(true);
    const supabase = createClient();
    
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (!error) {
      router.push('/partner/dashboard');
    }
    setCompleting(false);
  };

  const openMaps = () => {
    if (order?.delivery_address) {
      const encoded = encodeURIComponent(order.delivery_address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
    }
  };

  const callCustomer = () => {
    if (order?.customer_phone) {
      window.location.href = `tel:${order.customer_phone}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <p className="mb-4">Order not found</p>
        <Link href="/partner/dashboard"><Button>Back to Dashboard</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-32">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/partner/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-400">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold font-mono">{order.order_number}</h1>
            <p className="text-sm text-gray-400">Delivery Details</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Customer & Address */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Delivery Info</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Customer</p>
              <p className="font-medium">{order.customer_name || 'Customer'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Address</p>
              <p className="whitespace-pre-line">{order.delivery_address}</p>
            </div>
            {order.delivery_notes && (
              <div className="bg-yellow-500/20 rounded-lg p-3">
                <p className="text-sm text-yellow-400 font-medium">Notes:</p>
                <p className="text-yellow-100">{order.delivery_notes}</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 mt-6">
            <Button onClick={openMaps} className="flex-1 bg-blue-600">
              <Navigation className="h-4 w-4 mr-2" /> Navigate
            </Button>
            {order.customer_phone && (
              <Button onClick={callCustomer} variant="outline" className="flex-1">
                <Phone className="h-4 w-4 mr-2" /> Call
              </Button>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Items to Deliver</h2>
          <div className="space-y-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-gray-700 rounded overflow-hidden">
                  {item.product?.primary_image_url ? (
                    <img src={item.product.primary_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.product?.name || 'Product'}</p>
                  <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-700 mt-4 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Order Total</span>
              <span className="text-green-500">{formatCurrency(order.total_cents)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      {order.status === 'out_for_delivery' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700 space-y-2">
          <Button 
            onClick={markDelivered} 
            disabled={completing}
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
          >
            {completing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Mark as Delivered
              </>
            )}
          </Button>
          <Link href={`/partner/delivery/${order.id}/photo-proof`} className="block">
            <Button variant="outline" className="w-full text-orange-500 border-orange-500">
              Customer Unavailable? Use Photo Proof
            </Button>
          </Link>
        </div>
      )}}
    </div>
  );
}
