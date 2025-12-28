'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Package, Truck, MapPin, CheckCircle, Clock, Phone, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  delivery_address: string;
  total_cents: number;
  created_at: string;
  payment_status: string;
  tracking_number: string;
}

interface DeliveryData {
  id: string;
  status: string;
  scheduled_date: string;
  delivered_at: string | null;
  recipient_name: string;
  recipient_phone: string;
  photo_url: string | null;
}

const ORDER_STATUSES = [
  { key: 'pending_payment', label: 'Awaiting Payment', icon: Clock },
  { key: 'paid', label: 'Payment Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

const DELIVERY_TO_ORDER_STATUS: Record<string, string> = {
  'pending': 'processing',
  'loaded': 'processing',
  'in_transit': 'out_for_delivery',
  'arrived': 'out_for_delivery',
  'delivered': 'delivered',
};

export default function TrackOrderPage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [delivery, setDelivery] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
  }, [params.orderNumber]);

  const fetchOrder = async () => {
    const supabase = createClient();
    
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', params.orderNumber)
      .single();

    if (orderError || !orderData) {
      setError('Order not found. Please check your order number.');
      setLoading(false);
      return;
    }

    setOrder(orderData);

    // Get delivery status
    const { data: deliveryData } = await supabase
      .from('deliveries')
      .select('*')
      .eq('order_id', orderData.id)
      .single();

    if (deliveryData) {
      setDelivery(deliveryData);
    }

    setLoading(false);
  };

  const getCurrentStatus = (): string => {
    if (delivery?.status === 'delivered') return 'delivered';
    if (delivery?.status) {
      return DELIVERY_TO_ORDER_STATUS[delivery.status] || order?.status || 'pending_payment';
    }
    if (order?.payment_status === 'paid') return 'paid';
    return order?.status || 'pending_payment';
  };

  const getStatusIndex = (status: string): number => {
    return ORDER_STATUSES.findIndex(s => s.key === status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500">
              Back to Store
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStatus = getCurrentStatus();
  const currentStatusIndex = getStatusIndex(currentStatus);

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold">Track Order</h1>
              <p className="text-sm text-gray-500">{order.order_number}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Status Timeline */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <h2 className="font-semibold mb-6">Order Status</h2>
          <div className="space-y-4">
            {ORDER_STATUSES.map((status, index) => {
              const Icon = status.icon;
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              
              return (
                <div key={status.key} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {status.label}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-orange-600">Current status</p>
                    )}
                  </div>
                  {isCompleted && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Info */}
        {delivery && (
          <div className="bg-white rounded-xl p-6 mb-4">
            <h2 className="font-semibold mb-4">Delivery Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Scheduled Date</span>
                <span>{new Date(delivery.scheduled_date).toLocaleDateString()}</span>
              </div>
              {delivery.delivered_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivered At</span>
                  <span>{new Date(delivery.delivered_at).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Proof of Delivery */}
        {delivery?.photo_url && (
          <div className="bg-white rounded-xl p-6 mb-4">
            <h2 className="font-semibold mb-4">Proof of Delivery</h2>
            <img 
              src={delivery.photo_url} 
              alt="Delivery proof" 
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <h2 className="font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order Number</span>
              <span className="font-mono">{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tracking Number</span>
              <span className="font-mono text-xs">{order.tracking_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Address</span>
              <span className="text-right max-w-[200px]">{order.delivery_address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Order Date</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-t pt-3 mt-3">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">R{(order.total_cents / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white">
          <h2 className="font-semibold mb-2">Need Help?</h2>
          <p className="text-sm opacity-90 mb-4">Contact our support team for any questions about your order.</p>
          <a href="tel:+27123456789">
            <Button variant="outline" className="w-full bg-white">
              <Phone className="h-4 w-4 mr-2" />
              Call Support
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

