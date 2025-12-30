'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, CheckCircle, XCircle, Package, Loader2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface ScannedOrder {
  id: string;
  order_number: string;
  customer_name: string;
  delivery_address: string;
  status: string;
}

export default function PartnerScanPage() {
  const [scanning, setScanning] = useState(false);
  const [scannedOrders, setScannedOrders] = useState<ScannedOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<any>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setError(null);
    setScanning(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      
      if (!videoRef.current) return;
      
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Pause scanning while processing
          await scanner.pause();
          await handleScan(decodedText);
          // Resume after processing
          setTimeout(() => {
            if (scannerRef.current) {
              scanner.resume();
            }
          }, 2000);
        },
        () => {} // Ignore errors during scanning
      );
    } catch (err: any) {
      setError('Failed to start camera: ' + err.message);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScan = async (data: string) => {
    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      // Parse QR code - could be URL or JSON
      let orderNumber = '';
      let verificationCode = '';

      // Try URL format: /delivery/scan/ORDER_NUMBER/CODE
      const urlMatch = data.match(/\/delivery\/scan\/([^\/]+)\/([^\/]+)/);
      if (urlMatch) {
        orderNumber = urlMatch[1];
        verificationCode = urlMatch[2];
      } else {
        // Try JEFFY-ORDER-CODE format
        const parts = data.split('-');
        if (parts.length >= 3 && parts[0] === 'JEFFY') {
          orderNumber = parts[1];
          verificationCode = parts[2];
        }
      }

      if (!orderNumber) {
        setError('Invalid QR code format');
        setProcessing(false);
        return;
      }

      // Look up order in database
      const supabase = createClient();
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, delivery_address, status, verification_code')
        .eq('order_number', orderNumber)
        .single();

      if (orderError || !order) {
        setError(`Order ${orderNumber} not found`);
        setProcessing(false);
        return;
      }

      // Verify code if we have one stored
      if (order.verification_code && verificationCode !== order.verification_code) {
        setError('Verification code mismatch');
        setProcessing(false);
        return;
      }

      // Check if already scanned
      if (scannedOrders.find(o => o.id === order.id)) {
        setError('Order already scanned');
        setProcessing(false);
        return;
      }

      // Add to scanned list
      setScannedOrders(prev => [...prev, order]);
      setSuccess(`Order ${orderNumber} added!`);
    } catch (err: any) {
      setError('Scan error: ' + err.message);
    }

    setProcessing(false);
  };

  const dispatchOrders = async () => {
    if (scannedOrders.length === 0) return;
    
    setProcessing(true);
    setError(null);

    try {
      const supabase = createClient();
      const now = new Date().toISOString();

      // Update all scanned orders to "out_for_delivery"
      for (const order of scannedOrders) {
        // Get full order details including phone
        const { data: fullOrder } = await supabase
          .from('orders')
          .select('customer_phone, customer_name')
          .eq('id', order.id)
          .single();

        await supabase
          .from('orders')
          .update({
            status: 'out_for_delivery',
            shipped_at: now,
          })
          .eq('id', order.id);

        // Send WhatsApp notification
        if (fullOrder?.customer_phone) {
          try {
            const res = await fetch('/api/notify/whatsapp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'out_for_delivery',
                orderId: order.id,
                phone: fullOrder.customer_phone,
                data: {
                  orderNumber: order.order_number,
                  customerName: fullOrder.customer_name || 'Customer',
                }
              })
            });
            const notifyData = await res.json();
            // Open WhatsApp in new tab
            if (notifyData.whatsappUrl) {
              window.open(notifyData.whatsappUrl, '_blank');
            }
          } catch (e) {
            console.error('WhatsApp notification failed:', e);
          }
        }
      }

      setSuccess(`${scannedOrders.length} orders dispatched!`);
      
      // Redirect to route page after short delay
      setTimeout(() => {
        window.location.href = '/partner/route';
      }, 1500);

    } catch (err: any) {
      setError('Failed to dispatch: ' + err.message);
    }

    setProcessing(false);
  };

  const removeOrder = (orderId: string) => {
    setScannedOrders(prev => prev.filter(o => o.id !== orderId));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/partner/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-400">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-xl">Scan & Pack</h1>
            <p className="text-sm text-gray-400">Scan order labels before dispatch</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Scanner */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Scanner
            </h2>
            {!scanning ? (
              <Button onClick={startScanner} className="bg-orange-500 hover:bg-orange-600">
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button onClick={stopScanner} variant="outline">
                Stop Camera
              </Button>
            )}
          </div>

          {/* Camera View */}
          <div 
            id="qr-reader" 
            ref={videoRef}
            className={`w-full max-w-md mx-auto rounded-lg overflow-hidden ${scanning ? '' : 'hidden'}`}
          />

          {!scanning && (
            <div className="w-full max-w-md mx-auto aspect-square bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Camera off</p>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {processing && (
            <div className="mt-4 flex items-center justify-center gap-2 text-yellow-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2 text-red-400">
              <XCircle className="h-5 w-5" />
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              {success}
            </div>
          )}
        </div>

        {/* Scanned Orders List */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Scanned Orders ({scannedOrders.length})
            </h2>
          </div>

          {scannedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No orders scanned yet</p>
              <p className="text-sm">Scan QR codes on package labels</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scannedOrders.map((order) => (
                <div key={order.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-mono font-bold">{order.order_number}</p>
                    <p className="text-sm text-gray-400">{order.customer_name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">
                      {order.delivery_address}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeOrder(order.id)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dispatch Button */}
        {scannedOrders.length > 0 && (
          <Button
            onClick={dispatchOrders}
            disabled={processing}
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
          >
            {processing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Dispatch {scannedOrders.length} Order{scannedOrders.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}



