'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Package, Truck, DollarSign, RefreshCw, MapPin, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface PartnerData {
  id: string;
  full_legal_name: string;
  email: string;
  zone_name?: string;
  application_status: string;
  agreed_to_terms: boolean;
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

  useEffect(() => {
    loadPartner();
  }, []);

  const loadPartner = async () => {
    try {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login?redirect=/partner/dashboard');
        return;
      }

      // Get their zone partner record
      const { data: partnerData, error } = await supabase
        .from('zone_partners')
        .select('id, full_legal_name, email, zone_name, application_status, agreed_to_terms')
        .eq('user_id', user.id)
        .single();

      if (error || !partnerData) {
        // Not a partner yet - redirect to apply
        router.push('/partner/apply');
        return;
      }

      // Check if they've agreed to terms
      if (!partnerData.agreed_to_terms) {
        router.push(`/partner/agreement/${partnerData.id}`);
        return;
      }

      // Check if approved
      if (partnerData.application_status !== 'approved' && partnerData.application_status !== 'pending') {
        setLoading(false);
        return;
      }

      setPartner(partnerData);
      
      // Store in localStorage for other pages
      localStorage.setItem('zonePartnerId', partnerData.id);
      
      // Fetch earnings
      await fetchEarnings(partnerData.id);
    } catch (err) {
      console.error('Error loading partner:', err);
    }
    setLoading(false);
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

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
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

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-4">Zone Partner Dashboard</h1>
        <p className="text-gray-400 mb-6">You need to be an approved Zone Partner to access this page</p>
        <div className="space-y-3">
        <Link href="/partner/apply">
            <Button className="w-full bg-orange-500">Apply to be a Zone Partner</Button>
          </Link>
          <Link href="/auth/login?redirect=/partner/dashboard">
            <Button variant="outline" className="w-full">Login</Button>
        </Link>
        </div>
      </div>
    );
  }

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
              <p className="text-sm text-gray-400">{partner.zone_name || 'Zone Partner'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => fetchEarnings(partner.id)} variant="outline" size="sm" disabled={refreshing}>
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
              <h2 className="text-xl font-bold text-white">{partner.full_legal_name}</h2>
            </div>
          </div>
        </div>

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
