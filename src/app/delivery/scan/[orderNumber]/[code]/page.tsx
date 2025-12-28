'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, Package, AlertCircle, Loader2, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface Order {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  delivery_address: string;
  customer_phone: string;
  total_cents: number;
  delivered_at: string | null;
}

export default function DeliveryConfirmPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const code = params.code as string;

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    validateOrder();
  }, [orderNumber, code]);

  const validateOrder = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('id, order_number, status, customer_name, delivery_address, customer_phone, total_cents, delivered_at, verification_code')
        .eq('order_number', orderNumber)
        .single();

      if (orderError || !orderData) {
        setError('Order not found');
        setLoading(false);
        return;
      }

      // Verify code
      if (orderData.verification_code && orderData.verification_code !== code) {
        setError('Invalid verification code');
        setLoading(false);
        return;
      }

      // Check if already delivered
      if (orderData.status === 'delivered') {
        setConfirmed(true);
      }

      setOrder(orderData);
    } catch (err: any) {
      setError('Failed to load order: ' + err.message);
    }

    setLoading(false);
  };

  const confirmDelivery = async () => {
    if (!order) return;
    
    setConfirming(true);
    setError(null);

    try {
      const supabase = createClient();
      const now = new Date().toISOString();

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          delivered_at: now,
        })
        .eq('id', order.id);

      if (updateError) throw updateError;

      setConfirmed(true);
      setOrder({ ...order, status: 'delivered', delivered_at: now });

      // Send confirmation WhatsApp
      if (order.customer_phone) {
        try {
          await fetch('/api/notify/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'delivered',
              orderId: order.id,
              phone: order.customer_phone,
              data: {
                orderNumber: order.order_number,
                customerName: order.customer_name || 'Customer',
              }
            })
          });
        } catch (e) {
          console.error('WhatsApp notification failed:', e);
        }
      }
    } catch (err: any) {
      setError('Failed to confirm: ' + err.message);
    }

    setConfirming(false);
  };

  const formatCurrency = (cents: number) => {
    return `R${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p>Verifying delivery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
          <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <a href="/" className="text-orange-500 underline">Go to Jeffy Homepage</a>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-14 w-14 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Delivery Confirmed!</h1>
          <p className="text-gray-400 mb-2">Order {order?.order_number}</p>
          {order?.delivered_at && (
            <p className="text-sm text-gray-500">
              Delivered: {new Date(order.delivered_at).toLocaleString()}
            </p>
          )}
          <div className="mt-8">
            <a href="/" className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg font-medium">
              Shop More on Jeffy
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-orange-500 py-6 text-center">
        <h1 className="text-2xl font-bold">JEFFY</h1>
        <p className="text-orange-100">Delivery Confirmation</p>
      </div>

      <div className="p-6 max-w-md mx-auto space-y-6">
        {/* Order Info */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-6 w-6 text-orange-500" />
            <span className="font-mono font-bold text-lg">{order?.order_number}</span>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-400">Recipient</p>
              <p className="font-medium">{order?.customer_name}</p>
            </div>
            <div>
              <p className="text-gray-400">Address</p>
              <p className="flex items-start gap-1">
                <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                {order?.delivery_address}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Order Total</p>
              <p className="text-xl font-bold text-green-500">{formatCurrency(order?.total_cents || 0)}</p>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="space-y-3">
          <p className="text-center text-gray-400 text-sm">
            By confirming, you acknowledge that you have received this delivery in good condition.
          </p>
          <Button
            onClick={confirmDelivery}
            disabled={confirming}
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
          >
            {confirming ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Confirm Delivery Received
              </>
            )}
          </Button>
        </div>

        {/* Help */}
        <div className="text-center text-sm text-gray-500">
          <p>Problem with your delivery?</p>
          <a href="https://wa.me/27000000000" className="text-orange-500">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
