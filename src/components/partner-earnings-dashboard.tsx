'use client';

import { useEffect, useState } from 'react';
import { getPartnerEarnings, getCommissionHistory } from '@/lib/commission-service';

interface Earnings {
  total_commissions_cents: number;
  paid_commissions_cents: number;
  pending_commissions_cents: number;
  total_orders: number;
  paid_orders: number;
  pending_orders: number;
}

interface Commission {
  id: string;
  created_at: string;
  order_profit_cents: number;
  partner_commission_cents: number;
  status: 'pending' | 'paid' | 'refunded';
}

export default function PartnerEarningsDashboard({
  zonePartnerId,
}: {
  zonePartnerId: string;
}) {
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  useEffect(() => {
    loadData();
  }, [zonePartnerId]);

  const loadData = async () => {
    setLoading(true);
    const [earningsRes, commissionsRes] = await Promise.all([
      getPartnerEarnings(zonePartnerId),
      getCommissionHistory(zonePartnerId),
    ]);

    if (earningsRes.success) setEarnings(earningsRes.earnings);
    if (commissionsRes.success) setCommissions(commissionsRes.commissions || []);
    setLoading(false);
  };

  const filteredCommissions = commissions.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const formatCurrency = (cents: number) => `R${(cents / 100).toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-ZA');

  if (loading) {
    return <div className="min-h-screen bg-[#0f172a] text-white p-8 flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#ff6b35] mb-2">💰 Your Earnings</h1>
        <p className="text-gray-400 mb-8">Track your 50/50 profit share commissions</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 rounded-lg p-6 border-l-4 border-[#ff6b35]">
            <div className="text-sm text-gray-400 mb-2">Total Earned</div>
            <div className="text-3xl font-bold text-[#ff6b35]">
              {formatCurrency(earnings?.total_commissions_cents || 0)}
            </div>
            <div className="text-xs text-gray-500 mt-2">{earnings?.total_orders || 0} orders</div>
          </div>

          <div className="bg-green-500/20 rounded-lg p-6 border-l-4 border-green-500">
            <div className="text-sm text-green-400 mb-2">Paid Out</div>
            <div className="text-3xl font-bold text-green-400">
              {formatCurrency(earnings?.paid_commissions_cents || 0)}
            </div>
            <div className="text-xs text-green-300 mt-2">{earnings?.paid_orders || 0} orders</div>
          </div>

          <div className="bg-yellow-500/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <div className="text-sm text-yellow-400 mb-2">Pending</div>
            <div className="text-3xl font-bold text-yellow-400">
              {formatCurrency(earnings?.pending_commissions_cents || 0)}
            </div>
            <div className="text-xs text-yellow-300 mt-2">{earnings?.pending_orders || 0} orders</div>
          </div>

          <div className="bg-blue-500/20 rounded-lg p-6 border-l-4 border-blue-500">
            <div className="text-sm text-blue-400 mb-2">Average Order</div>
            <div className="text-3xl font-bold text-blue-400">
              {formatCurrency(
                (earnings?.total_orders || 0) > 0
                  ? Math.round((earnings?.total_commissions_cents || 0) / (earnings?.total_orders || 1))
                  : 0
              )}
            </div>
            <div className="text-xs text-blue-300 mt-2">Commission</div>
          </div>
        </div>

        {/* Commission History */}
        <div className="bg-white/5 rounded-lg border border-gray-600 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Commission History</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === 'all'
                    ? 'bg-[#ff6b35] text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === 'paid'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Pending
              </button>
            </div>
          </div>

          {filteredCommissions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No {filter !== 'all' ? filter : ''} commissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-600">
                  <tr>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-right py-3 px-4">Profit</th>
                    <th className="text-right py-3 px-4">Your Commission (50%)</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommissions.map(commission => (
                    <tr key={commission.id} className="border-b border-gray-700 hover:bg-white/5 transition">
                      <td className="py-3 px-4">{formatDate(commission.created_at)}</td>
                      <td className="text-right py-3 px-4">{formatCurrency(commission.order_profit_cents)}</td>
                      <td className="text-right py-3 px-4 font-bold text-[#ff6b35]">
                        {formatCurrency(commission.partner_commission_cents)}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          commission.status === 'paid'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {commission.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

