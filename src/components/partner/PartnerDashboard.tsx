'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wallet, Truck, TrendingUp, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface Earning {
  orderId: string;
  orderNumber: string;
  status: string;
  deliveredAt: string | null;
  createdAt: string;
  orderTotal: number;
  profitShare: number;
  deliveryBonus: number;
  totalEarning: number;
  isPaid: boolean;
}

interface EarningsData {
  partner: { id: string; name: string; zone: string; status: string };
  summary: {
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    totalDeliveries: number;
    completedDeliveries: number;
    profitSharePercent: number;
  };
  deliveries: Earning[];
}

export default function PartnerDashboard({ partnerId }: { partnerId: string }) {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    fetchEarnings();
  }, [partnerId]);

  const fetchEarnings = async () => {
    const res = await fetch(`/api/partner/earnings?partnerId=${partnerId}`);
    const json = await res.json();
    if (json.success) setData(json);
    setLoading(false);
  };

  const filteredDeliveries = data?.deliveries.filter(d => {
    if (tab === 'pending') return !d.isPaid;
    if (tab === 'completed') return d.isPaid;
    return true;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Could not load earnings data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/partner/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">My Earnings</h1>
              <p className="text-sm text-gray-400">{data.partner.name} • {data.partner.zone}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Wallet className="h-4 w-4" />
              <span className="text-sm">Total Earned</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(data.summary.totalEarnings)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{formatCurrency(data.summary.pendingEarnings)}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Truck className="h-4 w-4" />
              <span className="text-sm">Deliveries</span>
            </div>
            <p className="text-2xl font-bold">{data.summary.completedDeliveries}/{data.summary.totalDeliveries}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Profit Share</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{data.summary.profitSharePercent}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['all', 'pending', 'completed'] as const).map((t) => (
            <Button
              key={t}
              variant={tab === t ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTab(t)}
              className={tab === t ? 'bg-orange-500' : 'border-gray-600 text-gray-300'}
            >
              {t === 'all' ? 'All' : t === 'pending' ? 'Pending' : 'Completed'}
            </Button>
          ))}
        </div>

        {/* Deliveries List */}
        <div className="bg-gray-800 rounded-xl overflow-hidden">
          {filteredDeliveries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No deliveries yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredDeliveries.map((delivery) => (
                <div key={delivery.orderId} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-medium">{delivery.orderNumber}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      delivery.isPaid 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {delivery.isPaid ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Order Value</p>
                      <p>{formatCurrency(delivery.orderTotal)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Your Share (50%)</p>
                      <p className="text-green-400">{formatCurrency(delivery.profitShare)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Delivery Bonus</p>
                      <p className="text-orange-400">{formatCurrency(delivery.deliveryBonus)}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between">
                    <span className="text-gray-500 text-sm">
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </span>
                    <span className="font-bold text-green-400">
                      Total: {formatCurrency(delivery.totalEarning)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payout Info */}
        <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xl p-6 border border-orange-500/30">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-orange-400" />
            How Payouts Work
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• You earn 50% of profit on every delivery</li>
            <li>• Plus the full delivery fee as bonus</li>
            <li>• Payouts processed weekly on Fridays</li>
            <li>• Minimum payout: R100</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
