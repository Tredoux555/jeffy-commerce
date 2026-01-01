'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Package, Truck, DollarSign, RefreshCw, MapPin, LogOut, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface PartnerData {
  id: string;
  full_name?: string;
  full_legal_name?: string;
  email: string;
  zone_name?: string;
  zone_id?: string;
  status?: string;
  application_status?: string;
  agreed_to_terms: boolean;
  is_active: boolean;
}

interface EarningsData {
  summary: {
    totalEarnings: number;
    totalDeliveries: number;
    totalOrderValue: number;
    pendingDeliveries: number;
  };
  earnings: Array<{
    orderId: string;
    orderNumber: string;
    deliveredAt: string;
    orderTotal: number;
    profit: number;
    partnerEarning: number;
  }>;
  pendingOrders: Array<{
    id: string;
    order_number: string;
    total_cents: number;
    delivery_address: string;
  }>;
}

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPartner();
  }, []);

  const loadPartner = async () => {
    try {
      const supabase = createClient();
      
      // First try: Get partner ID from localStorage (set after agreement signing)
      const storedPartnerId = localStorage.getItem('zonePartnerId');
      
      if (storedPartnerId) {
        // Load partner by ID
        const { data: partnerData, error: partnerError } = await supabase
          .from('zone_partners')
          .select('*')
          .eq('id', storedPartnerId)
          .single();

        if (partnerData && !partnerError) {
          // Check if they've agreed to terms
          if (!partnerData.agreed_to_terms) {
            router.push(`/partner/agreement/${partnerData.id}`);
            return;
          }

          setPartner(partnerData);
          await fetchEarnings(partnerData.id);
          setLoading(false);
          return;
        }
      }

      // Second try: Check if logged in via Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Try to find partner by user_id
        const { data: partnerByUserId } = await supabase
          .from('zone_partners')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (partnerByUserId) {
          if (!partnerByUserId.agreed_to_terms) {
            router.push(`/partner/agreement/${partnerByUserId.id}`);
            return;
          }

          localStorage.setItem('zonePartnerId', partnerByUserId.id);
          setPartner(partnerByUserId);
          await fetchEarnings(partnerByUserId.id);
          setLoading(false);
          return;
        }

        // Try to find by email
        const { data: partnerByEmail } = await supabase
          .from('zone_partners')
          .select('*')
          .eq('email', user.email)
          .single();

        if (partnerByEmail) {
          if (!partnerByEmail.agreed_to_terms) {
            router.push(`/partner/agreement/${partnerByEmail.id}`);
            return;
          }

          localStorage.setItem('zonePartnerId', partnerByEmail.id);
          setPartner(partnerByEmail);
          await fetchEarnings(partnerByEmail.id);
          setLoading(false);
          return;
        }
      }

      // No partner found - show apply prompt
      setError('Partner account not found');
      setLoading(false);

    } catch (err) {
      console.error('Error loading partner:', err);
      setError('Failed to load partner data');
      setLoading(false);
    }
  };

  const fetchEarnings = async (partnerId: string) => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/partner/earnings?partnerId=${partnerId}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
    }
    setRefreshing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('zonePartnerId');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-12 w-12 text-orange-500 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Zone Partner Dashboard</h1>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          {error || 'You need to be an approved Zone Partner to access this page.'}
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <Link href="/partner/apply">
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              Apply to be a Zone Partner
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check status
  const status = partner.status || partner.application_status;
  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mb-6">
          <Package className="h-10 w-10 text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Application Under Review</h1>
        <p className="text-gray-400 mb-6 text-center max-w-md">
          We're reviewing your application for <strong>{partner.zone_name || partner.zone_id}</strong>. 
          You'll receive an email once approved.
        </p>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const displayName = partner.full_legal_name || partner.full_name || 'Partner';

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">Partner Dashboard</h1>
              <p className="text-sm text-gray-400">{partner.zone_name || partner.zone_id || 'Zone Partner'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => partner && fetchEarnings(partner.id)} variant="outline" size="sm" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-400">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Welcome back,</p>
              <h2 className="text-xl font-bold text-white">{displayName}</h2>
            </div>
          </div>
        </div>

        {/* Status Banner - if not active yet */}
        {!partner.is_active && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 font-medium">🚀 Almost there!</p>
            <p className="text-sm text-gray-300">Complete your onboarding to start receiving orders.</p>
            <Link href="/partner/onboarding" className="text-blue-400 text-sm hover:underline mt-2 inline-block">
              View Onboarding Steps →
            </Link>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-gray-400 text-sm">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold text-green-500">
              {formatCurrency(data?.summary.totalEarnings || 0)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-5 w-5 text-blue-500" />
              <span className="text-gray-400 text-sm">Deliveries</span>
            </div>
            <p className="text-2xl font-bold">{data?.summary.totalDeliveries || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Truck className="h-5 w-5 text-orange-500" />
              <span className="text-gray-400 text-sm">Pending</span>
            </div>
            <p className="text-2xl font-bold text-orange-500">{data?.summary.pendingDeliveries || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="text-gray-400 text-sm">Order Value</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(data?.summary.totalOrderValue || 0)}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/partner/scan" className="bg-blue-600 hover:bg-blue-700 rounded-xl p-4 text-center transition">
            <Package className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-medium">Scan Orders</p>
          </Link>
          <Link href="/partner/route" className="bg-green-600 hover:bg-green-700 rounded-xl p-4 text-center transition">
            <MapPin className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-medium">Today's Route</p>
          </Link>
          <Link href="/partner/stock" className="bg-purple-600 hover:bg-purple-700 rounded-xl p-4 text-center transition">
            <TrendingUp className="h-6 w-6 mx-auto mb-2" />
            <p className="text-sm font-medium">My Stock</p>
          </Link>
        </div>

        {/* Pending Deliveries */}
        {data?.pendingOrders && data.pendingOrders.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Truck className="h-5 w-5 text-orange-500" />
              Pending Deliveries
            </h2>
            <div className="space-y-3">
              {data.pendingOrders.map((order) => (
                <Link 
                  key={order.id} 
                  href={`/partner/delivery/${order.id}`}
                  className="block bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono font-bold">{order.order_number}</p>
                      <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {order.delivery_address?.substring(0, 50) || 'No address'}...
                      </p>
                    </div>
                    <span className="font-bold text-green-500">{formatCurrency(order.total_cents)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Earnings History */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Earnings History</h2>
          {data?.earnings && data.earnings.length > 0 ? (
            <div className="space-y-3">
              {data.earnings.map((earning) => (
                <div key={earning.orderId} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-mono text-sm">{earning.orderNumber}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(earning.deliveredAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">+{formatCurrency(earning.partnerEarning)}</p>
                      <p className="text-xs text-gray-400">50% of {formatCurrency(earning.profit)} profit</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No completed deliveries yet</p>
              <p className="text-sm text-gray-500 mt-2">Complete your first delivery to see earnings here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
