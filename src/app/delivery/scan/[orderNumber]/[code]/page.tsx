'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, AlertCircle, Loader2, Camera, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface Order {
  id: string;
  order_number: string;
  status: string;
  customer_name: string;
  delivery_address: string;
  total_cents: number;
  delivered_at: string | null;
}

export default function DeliveryConfirmPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;
  const code = params.code as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    verifyAndFetch();
  }, [orderNumber, code]);

  const verifyAndFetch = async () => {
    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, status, customer_name, delivery_address, total_cents, delivered_at, verification_code')
      .eq('order_number', orderNumber)
      .single();

    if (fetchError || !data) {
      setError('Order not found');
      setLoading(false);
      return;
    }

    // Verify code
    if (data.verification_code !== code) {
      setError('Invalid verification code');
      setLoading(false);
      return;
    }

    // Check if already delivered
    if (data.status === 'delivered') {
      setConfirmed(true);
    }

    setOrder(data);
    setLoading(false);
  };

  const confirmDelivery = async () => {
    if (!order) return;
    setConfirming(true);

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    if (updateError) {
      setError('Failed to confirm delivery');
      setConfirming(false);
      return;
    }

    setConfirmed(true);
    setConfirming(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-orange-500">Go to Jeffy</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">Delivery Confirmed!</h1>
          <p className="text-gray-600 mb-2">Order {order?.order_number}</p>
          <p className="text-sm text-gray-500 mb-6">
            Thank you for confirming receipt of your package.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500">Delivered to</p>
            <p className="font-medium">{order?.customer_name}</p>
          </div>
          <Link href="/wants">
            <Button className="w-full bg-orange-500">Create a Want & Get FREE Stuff!</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-orange-500" />
          </div>
          <h1 className="text-xl font-bold">Confirm Your Delivery</h1>
          <p className="text-gray-500 text-sm mt-1">Order {order?.order_number}</p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
          <div>
            <p className="text-xs text-gray-500 uppercase">Recipient</p>
            <p className="font-medium">{order?.customer_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Delivery Address</p>
            <p className="text-sm">{order?.delivery_address}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Status</p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
              {order?.status === 'out_for_delivery' ? '🚚 Out for Delivery' : order?.status}
            </span>
          </div>
        </div>

        {/* Confirm Button */}
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
              I Received My Package
            </>
          )}
        </Button>

        <p className="text-xs text-gray-400 text-center mt-4">
          By confirming, you acknowledge receipt of your order in good condition.
        </p>
      </div>

      {/* Jeffy Branding */}
      <div className="mt-8 text-center">
        <p className="text-2xl font-bold text-orange-500">JEFFY</p>
        <p className="text-xs text-gray-400">Eish, These Prices!</p>
      </div>
    </div>
  );
}
