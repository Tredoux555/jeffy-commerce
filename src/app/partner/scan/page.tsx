'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, Package, CheckCircle, AlertCircle, Loader2, QrCode } from 'lucide-react';
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
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [scannedOrders, setScannedOrders] = useState<ScannedOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
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
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {} // Ignore errors during scanning
      );
    } catch (err: any) {
      setError('Camera access denied or not available');
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
    // Parse QR code URL: /delivery/scan/ORDER_NUMBER/VERIFICATION_CODE
    const match = data.match(/\/delivery\/scan\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      // Try direct format: JEFFY-ORDER-CODE
      const directMatch = data.match(/JEFFY-([^-]+)-([^-]+)/);
      if (directMatch) {
        await processOrder(directMatch[1], directMatch[2]);
      }
      return;
    }
    
    await processOrder(match[1], match[2]);
  };

  const processOrder = async (orderNumber: string, verificationCode: string) => {
    // Check if already scanned
    if (scannedOrders.find(o => o.order_number === orderNumber)) {
      return;
    }

    setProcessing(true);
    const supabase = createClient();

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, delivery_address, status, verification_code')
      .eq('order_number', orderNumber)
      .single();

    if (fetchError || !order) {
      setError(`Order ${orderNumber} not found`);
      setProcessing(false);
      return;
    }

    // Verify code
    if (order.verification_code !== verificationCode) {
      setError('Invalid verification code');
      setProcessing(false);
      return;
    }

    // Add to scanned list
    setScannedOrders(prev => [...prev, {
      id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name || 'Customer',
      delivery_address: order.delivery_address,
      status: order.status,
    }]);

    setSuccess(`Order ${orderNumber} scanned!`);
    setTimeout(() => setSuccess(null), 2000);
    setProcessing(false);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    // Parse manual code (format: ORDER_NUMBER or ORDER_NUMBER-VERIFICATION)
    const parts = manualCode.trim().toUpperCase().split('-');
    const orderNumber = parts[0].startsWith('JFY') ? parts.slice(0, 2).join('-') : parts[0];
    const verificationCode = parts[parts.length - 1];

    await processOrder(orderNumber, verificationCode);
    setManualCode('');
  };

  const confirmAllDeliveries = async () => {
    if (scannedOrders.length === 0) return;

    setProcessing(true);
    const supabase = createClient();
    const partnerId = localStorage.getItem('zonePartnerId');

    for (const order of scannedOrders) {
      await supabase
        .from('orders')
        .update({
          status: 'out_for_delivery',
          zone_partner_id: partnerId,
          shipped_at: new Date().toISOString(),
        })
        .eq('id', order.id);

      // TODO: Trigger WhatsApp notification here
    }

    setProcessing(false);
    router.push('/partner/route');
  };

  const removeOrder = (orderNumber: string) => {
    setScannedOrders(prev => prev.filter(o => o.order_number !== orderNumber));
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
            <p className="text-sm text-gray-400">Scan orders for today's deliveries</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Scanner Section */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <QrCode className="h-5 w-5 text-orange-500" />
              QR Scanner
            </h2>
            {scanning ? (
              <Button onClick={stopScanner} variant="outline" size="sm">Stop Scanner</Button>
            ) : (
              <Button onClick={startScanner} className="bg-orange-500" size="sm">
                <Camera className="h-4 w-4 mr-2" /> Start Camera
              </Button>
            )}
          </div>

          {/* Camera View */}
          <div 
            id="qr-reader" 
            ref={videoRef}
            className={`w-full max-w-md mx-auto rounded-xl overflow-hidden bg-black ${scanning ? '' : 'hidden'}`}
            style={{ minHeight: scanning ? '300px' : '0' }}
          />

          {!scanning && (
            <div className="bg-gray-700 rounded-xl p-8 text-center">
              <Camera className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Click "Start Camera" to scan QR codes</p>
            </div>
          )}
        </div>

        {/* Manual Entry */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Manual Entry</h2>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter order number or verification code"
              className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
            />
            <Button type="submit" disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
            </Button>
          </form>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-400">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400">×</button>
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-green-400">{success}</span>
          </div>
        )}

        {/* Scanned Orders */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Scanned Orders ({scannedOrders.length})
            </h2>
          </div>

          {scannedOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders scanned yet</p>
              <p className="text-sm">Scan QR codes on package labels to add orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {scannedOrders.map((order) => (
                <div key={order.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono font-bold">{order.order_number}</p>
                      <p className="text-sm text-gray-400">{order.customer_name}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.delivery_address.substring(0, 50)}...</p>
                    </div>
                    <button
                      onClick={() => removeOrder(order.order_number)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Button */}
        {scannedOrders.length > 0 && (
          <Button
            onClick={confirmAllDeliveries}
            disabled={processing}
            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700"
          >
            {processing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Confirm {scannedOrders.length} Orders - Start Deliveries
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
