'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, QrCode, CheckCircle, AlertCircle, Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRScanner } from '@/components/qr-scanner';
import { createClient } from '@/lib/supabase/client';

export default function ScanPage() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    delivery?: any;
    previousStatus?: string;
    newStatus?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  useEffect(() => {
    getPartnerId();
  }, []);

  const getPartnerId = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data: partner } = await supabase
      .from('zone_partners')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (partner) {
      setPartnerId(partner.id);
    }
  };

  const handleScan = async (qrCode: string) => {
    setShowScanner(false);
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/delivery/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode, partnerId }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          delivery: data.delivery,
          previousStatus: data.previousStatus,
          newStatus: data.newStatus,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to process scan',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please try again.',
      });
    }

    setLoading(false);
  };

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Pending Pickup',
    loaded: 'Loaded',
    in_transit: 'In Transit',
    arrived: 'Arrived',
    delivered: 'Delivered',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/partner/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold">Scan Delivery</h1>
              <p className="text-sm text-gray-500">Scan QR code to update status</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Scanner Button */}
        {!showScanner && !result && !loading && (
          <div className="text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode className="h-12 w-12 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Ready to Scan</h2>
              <p className="text-gray-600 mb-6">
                Scan the QR code on the package to update delivery status
              </p>
              <Button
                onClick={() => setShowScanner(true)}
                className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-yellow-500"
              >
                <QrCode className="h-5 w-5 mr-2" />
                Open Scanner
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Each scan advances the delivery to the next status
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-gray-600">Processing scan...</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="text-center">
            <div className={`rounded-2xl p-8 shadow-lg ${
              result.success ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                result.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {result.success ? (
                  <CheckCircle className="h-10 w-10 text-green-600" />
                ) : (
                  <AlertCircle className="h-10 w-10 text-red-600" />
                )}
              </div>
              
              <h2 className={`text-xl font-bold mb-2 ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Success!' : 'Error'}
              </h2>
              
              <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                {result.message}
              </p>

              {result.success && result.delivery && (
                <div className="mt-6 p-4 bg-white rounded-xl text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">{result.delivery.orders?.order_number}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Status changed:</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-100 rounded text-gray-600">
                        {STATUS_LABELS[result.previousStatus || ''] || result.previousStatus}
                      </span>
                      <span>→</span>
                      <span className="px-2 py-1 bg-orange-100 rounded text-orange-700 font-medium">
                        {STATUS_LABELS[result.newStatus || ''] || result.newStatus}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setResult(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Scan Another
                </Button>
                {result.success && result.delivery && (
                  <Link href={`/partner/delivery/${result.delivery.id}`} className="flex-1">
                    <Button className="w-full bg-orange-500">
                      View Details
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}



