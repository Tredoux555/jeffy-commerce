'use client';

import { useState } from 'react';
import { Users, DollarSign, MousePointer, ShoppingBag, Copy, Check, ExternalLink, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AffiliateStats {
  totalClicks: number;
  totalOrders: number;
  totalRevenue: number;
  totalCommission: number;
  pendingCommission: number;
  conversionRate: number;
}

interface AffiliateDashboardProps {
  affiliateCode: string;
  stats: AffiliateStats;
  recentCommissions?: Array<{ orderId: string; amount: number; date: string; status: string }>;
}

export function AffiliateDashboard({ affiliateCode, stats, recentCommissions = [] }: AffiliateDashboardProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://jeffy.co.za?ref=${affiliateCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Referral Link */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <h3 className="font-bold text-lg mb-2">Your Referral Link</h3>
        <p className="text-green-100 text-sm mb-4">Share this link and earn 10% on every sale!</p>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/20 rounded-lg px-4 py-3 font-mono text-sm truncate">
            {referralLink}
          </div>
          <button
            onClick={copyLink}
            className="bg-white text-green-600 px-4 py-3 rounded-lg font-bold hover:bg-green-50 transition flex items-center gap-2"
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Code: {affiliateCode}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MousePointer} label="Total Clicks" value={stats.totalClicks.toLocaleString()} color="blue" />
        <StatCard icon={ShoppingBag} label="Orders" value={stats.totalOrders.toLocaleString()} color="green" />
        <StatCard icon={DollarSign} label="Commission Earned" value={formatCurrency(stats.totalCommission)} color="purple" />
        <StatCard icon={TrendingUp} label="Conversion Rate" value={`${stats.conversionRate.toFixed(1)}%`} color="orange" />
      </div>

      {/* Pending Payout */}
      {stats.pendingCommission > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-amber-800">Pending Commission</p>
            <p className="text-amber-600 text-sm">Available for payout once approved</p>
          </div>
          <p className="text-2xl font-bold text-amber-700">{formatCurrency(stats.pendingCommission)}</p>
        </div>
      )}

      {/* Recent Commissions */}
      {recentCommissions.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-bold">Recent Commissions</h3>
          </div>
          <div className="divide-y">
            {recentCommissions.map((c, i) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Order #{c.orderId.slice(0, 8)}</p>
                  <p className="text-gray-500 text-xs">{c.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(c.amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === 'paid' ? 'bg-green-100 text-green-700' :
                    c.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color as keyof typeof colors]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

// Affiliate Signup Form
export function AffiliateSignupForm({ onSubmit }: { onSubmit?: (data: any) => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', code: '', website: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    onSubmit?.(form);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 rounded-xl">
          <Users className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Become an Affiliate</h2>
          <p className="text-gray-500 text-sm">Earn 10% on every sale you refer</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-4 py-3" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-4 py-3" placeholder="john@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border rounded-lg px-4 py-3" placeholder="082 123 4567" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Preferred Affiliate Code</label>
          <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })} className="w-full border rounded-lg px-4 py-3 uppercase" placeholder="JOHN20" maxLength={10} />
          <p className="text-xs text-gray-500 mt-1">Leave blank for auto-generated code</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Website/Social Media (optional)</label>
          <input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full border rounded-lg px-4 py-3" placeholder="https://instagram.com/yourhandle" />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50">
          {loading ? 'Submitting...' : 'Apply to Join'}
        </button>
      </form>
    </div>
  );
}
