'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Commission {
  id: string;
  order_id: string;
  zone_partner_id: string;
  zone_id: string;
  order_profit_cents: number;
  partner_commission_cents: number;
  jeffy_commission_cents: number;
  status: 'pending' | 'paid' | 'refunded';
  created_at: string;
  paid_at: string | null;
}

export default function AdminCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('pending');
  const [selectedCommissions, setSelectedCommissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCommissions(data);
    setLoading(false);
  };

  const filteredCommissions = commissions.filter(c => filter === 'all' || c.status === filter);
  const formatCurrency = (cents: number) => `R${(cents / 100).toFixed(2)}`;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-ZA');

  const totalPending = filteredCommissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.partner_commission_cents, 0);

  const handleSelectAll = () => {
    if (selectedCommissions.size === filteredCommissions.length) {
      setSelectedCommissions(new Set());
    } else {
      setSelectedCommissions(new Set(filteredCommissions.map(c => c.id)));
    }
  };

  const handleSelectCommission = (id: string) => {
    const newSelected = new Set(selectedCommissions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCommissions(newSelected);
  };

  const handleMarkAsPaid = async () => {
    if (selectedCommissions.size === 0) return;
    try {
      await supabase
        .from('commissions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .in('id', Array.from(selectedCommissions));
      await loadData();
      setSelectedCommissions(new Set());
      alert(`✅ Marked ${selectedCommissions.size} commissions as paid`);
    } catch (err) {
      alert('❌ Failed to mark as paid');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0f172a] text-white p-8 flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[#ff6b35] mb-2">💳 Commission Management</h1>
        <p className="text-gray-400 mb-8">Track and process partner commissions</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 rounded-lg p-6 border-l-4 border-gray-400">
            <div className="text-sm text-gray-400 mb-2">Total Commissions</div>
            <div className="text-3xl font-bold">
              {formatCurrency(commissions.reduce((sum, c) => sum + c.partner_commission_cents, 0))}
            </div>
          </div>

          <div className="bg-yellow-500/20 rounded-lg p-6 border-l-4 border-yellow-500">
            <div className="text-sm text-yellow-400 mb-2">Pending Payment</div>
            <div className="text-3xl font-bold text-yellow-400">{formatCurrency(totalPending)}</div>
          </div>

          <div className="bg-green-500/20 rounded-lg p-6 border-l-4 border-green-500">
            <div className="text-sm text-green-400 mb-2">Paid Out</div>
            <div className="text-3xl font-bold text-green-400">
              {formatCurrency(commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.partner_commission_cents, 0))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/5 rounded-lg border border-gray-600 p-6 mb-8 flex items-center justify-between">
          <div className="flex gap-2">
            {['all', 'pending', 'paid'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === f
                    ? f === 'all' ? 'bg-[#ff6b35]' : f === 'pending' ? 'bg-yellow-600' : 'bg-green-600'
                    : 'bg-gray-700'
                } text-white`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>

          {selectedCommissions.size > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                Selected: {selectedCommissions.size}
              </span>
              <button
                onClick={handleMarkAsPaid}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition"
              >
                ✓ Mark As Paid
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white/5 rounded-lg border border-gray-600 overflow-hidden">
          {filteredCommissions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 p-6">
              <p>No commissions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/10 border-b border-gray-600">
                  <tr>
                    <th className="text-left py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedCommissions.size === filteredCommissions.length && filteredCommissions.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="text-left py-4 px-6 font-semibold">Order ID</th>
                    <th className="text-right py-4 px-6 font-semibold">Profit</th>
                    <th className="text-right py-4 px-6 font-semibold">Partner (50%)</th>
                    <th className="text-right py-4 px-6 font-semibold">Jeffy (50%)</th>
                    <th className="text-left py-4 px-6 font-semibold">Date</th>
                    <th className="text-center py-4 px-6 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommissions.map(commission => (
                    <tr key={commission.id} className="border-b border-gray-700 hover:bg-white/5 transition">
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedCommissions.has(commission.id)}
                          onChange={() => handleSelectCommission(commission.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 px-6 text-gray-300 font-mono text-xs">{commission.order_id.slice(0, 8)}...</td>
                      <td className="text-right py-4 px-6 font-semibold">{formatCurrency(commission.order_profit_cents)}</td>
                      <td className="text-right py-4 px-6 font-bold text-[#ff6b35]">{formatCurrency(commission.partner_commission_cents)}</td>
                      <td className="text-right py-4 px-6 text-gray-300">{formatCurrency(commission.jeffy_commission_cents)}</td>
                      <td className="py-4 px-6 text-gray-300">{formatDate(commission.created_at)}</td>
                      <td className="text-center py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          commission.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
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

