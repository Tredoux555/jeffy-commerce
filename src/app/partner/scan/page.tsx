'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, Package, Check, AlertCircle, Truck, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ScannedOrder {
  orderId: string;
  orderNumber: string;
  customerName: string;
  address: string;
  status: 'pending' | 'scanned' | 'error';
  message?: string;
}

export default function PartnerScanPage() {
  const [scanning, setScanning] = useState(false);
  const [scannedOrders, setScannedOrders] = useState<ScannedOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = () => {
    setScanning(true);
    setError(null);

    setTimeout(() => {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanError);
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText: string) => {
    // Prevent duplicate scans
    if (processing) return;
    setProcessing(true);

    try {
      // Parse the QR code - expecting URL format: /delivery/scan/ORDER_NUMBER/VERIFICATION_CODE
      const urlMatch = decodedText.match(/\/delivery\/scan\/([^\/]+)\/([^\/]+)/);
      
      let orderNumber: string;
      let verificationCode: string;

      if (urlMatch) {
        orderNumber = urlMatch[1];
        verificationCode = urlMatch[2];
      } else if (decodedText.startsWith('JEFFY-')) {
        // Legacy format: JEFFY-ORDER_NUMBER-CODE
        const parts = decodedText.split('-');
        orderNumber = parts[1];
        verificationCode = parts[2];
      } else {
        throw new Error('Invalid QR code format');
      }

      // Check if already scanned
      if (scannedOrders.some(o => o.orderNumber === orderNumber)) {
        setError('This order has already been scanned');
        setProcessing(false);
        return;
      }

      // Call API to mark as out for delivery
      const res = await fetch('/api/partner/scan-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, verificationCode }),
      });

      const data = await res.json();

      if (data.success) {
        setScannedOrders(prev => [...prev, {
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          customerName: data.customerName,
          address: data.address,
          status: 'scanned',
        }]);
        
        // Play success sound/vibrate
        if (navigator.vibrate) navigator.vibrate(200);
        
      } else {
        setScannedOrders(prev => [...prev, {
          orderId: '',
          orderNumber,
          customerName: 'Unknown',
          address: '',
          status: 'error',
          message: data.error,
        }]);
      }
    } catch (err: any) {
      setError(err.message || 'Scan failed');
    }

    setProcessing(false);
  };

  const onScanError = (error: string) => {
    // Ignore frequent scan errors
    console.log('Scan error:', error);
  };

  const startDeliveries = () => {
    const successfulOrders = scannedOrders.filter(o => o.status === 'scanned');
    if (successfulOrders.length === 0) return;
    
    // Navigate to route page with scanned orders
    const orderIds = successfulOrders.map(o => o.orderId).join(',');
    window.location.href = `/partner/route?orders=${orderIds}`;
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
            <p className="text-sm text-gray-400">Scan order QR codes to start delivery</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Scanner Section */}
        <div className="bg-gray-800 rounded-xl p-6">
          {!scanning ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="h-10 w-10 text-orange-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Ready to Scan</h2>
              <p className="text-gray-400 mb-6">Scan each package's QR code before loading into your vehicle</p>
              <Button onClick={startScanner} className="bg-orange-500 hover:bg-orange-600">
                <Camera className="h-4 w-4 mr-2" /> Start Scanner
              </Button>
            </div>
          ) : (
            <div>
              <div id="qr-reader" className="mx-auto max-w-sm rounded-lg overflow-hidden"></div>
              <div className="flex justify-center mt-4">
                <Button onClick={stopScanner} variant="outline">
                  Stop Scanner
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-200">{error}</span>
            </div>
          )}

          {processing && (
            <div className="mt-4 flex items-center justify-center gap-2 text-orange-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing...
            </div>
          )}
        </div>
