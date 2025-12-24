'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck, MapPin, Package, DollarSign, Clock, CheckCircle, Loader2, AlertCircle, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface PartnerData {
  id: string;
  full_legal_name: string;
  email: string;
  mobile: string;
  application_status: string;
  total_deliveries: number;
  total_earnings_cents: number;
  zone_id: string | null;
  zones?: { name: string; description: string } | null;
}

interface Delivery {
  id: string;
  order_id: string;
  status: string;
  scheduled_date: string;
  delivered_at: string | null;
}

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPartnerData();
  }, []);

  const fetchPartnerData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Get partner record
    const { data: partnerData, error: partnerError } = await supabase
      .from('zone_partners')
      .select('*, zones(name, description)')
      .eq('user_id', user.id)
      .single();

    if (partnerError || !partnerData) {
      setError('You are not registered as a partner. Please apply first.');
      setLoading(false);
      return;
    }

    setPartner(partnerData);

    // Get deliveries if approved
    if (partnerData.application_status === 'approved') {
      const { data: deliveryData } = await supabase
        .from('deliveries')
        .select('*')
        .eq('franchisee_id', partnerData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (deliveryData) {
        setDeliveries(deliveryData);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Not a Partner</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/partner/apply">
            <Button className="w-full bg-gradient-to-r from-orange-500 to-yellow-500">
              Apply to Become a Partner
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!partner) return null;

  // Pending application view
  if (partner.application_status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Pending</h1>
          <p className="text-gray-600 mb-6">
            Your application is being reviewed. We'll notify you once it's approved.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Store
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Rejected application view
  if (partner.application_status === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Rejected</h1>
          <p className="text-gray-600 mb-6">
            Unfortunately, your application was not approved. Please contact support for more information.
          </p>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Store
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Approved partner dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partner Dashboard</h1>
            <p className="text-gray-600">Welcome back, {partner.full_legal_name}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/partner/scan">
              <Button className="bg-gradient-to-r from-orange-500 to-yellow-500">
                <QrCode className="h-4 w-4 mr-2" />
                Scan QR
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Store</Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <MapPin className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Your Zone</p>
                <p className="text-lg font-bold">{partner.zones?.name || 'Unassigned'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Deliveries</p>
                <p className="text-lg font-bold">{partner.total_deliveries || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-lg font-bold">R{((partner.total_earnings_cents || 0) / 100).toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-bold text-green-600">Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Zone Info */}
        {partner.zones && (
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="h-6 w-6" />
              <h2 className="text-xl font-bold">{partner.zones.name}</h2>
            </div>
            <p className="opacity-90">{partner.zones.description || 'You are responsible for all deliveries in this zone.'}</p>
          </div>
        )}

        {!partner.zone_id && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">No Zone Assigned</h3>
                <p className="text-yellow-700 text-sm">You haven't been assigned to a zone yet. Please contact admin.</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Deliveries */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-bold">Recent Deliveries</h2>
          </div>
          {deliveries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p>No deliveries yet</p>
              <p className="text-sm text-gray-400 mt-1">Orders in your zone will appear here</p>
            </div>
          ) : (
            <div className="divide-y">
              {deliveries.map((delivery) => (
                <Link key={delivery.id} href={`/partner/delivery/${delivery.id}`} className="p-4 flex items-center justify-between hover:bg-gray-50 block">
                  <div>
                    <p className="font-medium">Order #{delivery.order_id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {delivery.scheduled_date ? new Date(delivery.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    delivery.status === 'delivered' 
                      ? 'bg-green-100 text-green-700'
                      : delivery.status === 'in_transit'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {delivery.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


