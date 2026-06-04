'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Clock, CheckCircle, AlertTriangle, Users, ExternalLink, Plus } from 'lucide-react';

interface Want {
  id: string;
  title: string;
  share_code: string;
  threshold: number;
  current_agrees: number;
  status: string;
  created_at: string;
  max_price_cents: number | null;
}

export default function MyWantsPage() {
  const [phone, setPhone] = useState('');
  const [wants, setWants] = useState<Want[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const getExpiryInfo = (createdAt: string) => {
    const created = new Date(createdAt);
    const expiry = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { daysLeft, expired: daysLeft <= 0 };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError('');
    setSearched(false);

    try {
      const res = await fetch(`/api/wants/my?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();

      if (data.success) {
        setWants(data.wants || []);
        setSearched(true);
      } else {
        setError(data.error || 'Failed to fetch wants');
      }
    } catch (err: any) {
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (want: Want) => {
    const { daysLeft, expired } = getExpiryInfo(want.created_at);
    const reached = want.current_agrees >= want.threshold;

    if (want.status === 'delivered') {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">✓ Delivered</span>;
    }
    if (want.status === 'shipped') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">🚚 Shipped</span>;
    }
    if (want.status === 'sourced' || want.status === 'sourcing') {
      return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">📦 Processing</span>;
    }
    if (reached) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">🎉 Goal Reached!</span>;
    }
    if (expired) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">⏰ Expired</span>;
    }
    if (daysLeft <= 2) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">⚡ {daysLeft}d left</span>;
    }
    return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{daysLeft}d left</span>;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-[#ff6b35] mb-2">My Wishes</h1>
        <p className="text-gray-400 mb-8">Track the progress of your wishes</p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-white text-[#0f172a] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#ff6b35] text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              <Search className="h-5 w-5" />
              {loading ? 'Searching...' : 'Find'}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {/* Results */}
        {searched && (
          <>
            {wants.length > 0 ? (
              <div className="space-y-4">
                <p className="text-gray-400 text-sm mb-4">Found {wants.length} want{wants.length > 1 ? 's' : ''}</p>
                
                {wants.map((want) => {
                  const progress = (want.current_agrees / want.threshold) * 100;
                  const { expired } = getExpiryInfo(want.created_at);
                  const reached = want.current_agrees >= want.threshold;

                  return (
                    <div 
                      key={want.id} 
                      className={`bg-white/5 border rounded-xl p-5 ${
                        reached ? 'border-green-500/50' : expired ? 'border-red-500/50' : 'border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{want.title}</h3>
                          <p className="text-gray-500 text-sm">#{want.share_code}</p>
                        </div>
                        {getStatusBadge(want)}
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="font-bold">{want.current_agrees}/{want.threshold} agrees</span>
                        </div>
                        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              reached ? 'bg-green-500' : 'bg-[#ff6b35]'
                            }`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link 
                          href={`/wants/${want.share_code}`}
                          className="flex-1 bg-[#ff6b35] text-white py-2 rounded-lg font-bold text-center hover:bg-orange-600 transition flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View & Share
                        </Link>
                        {expired && !reached && (
                          <Link 
                            href="/wants/create"
                            className="bg-gray-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-600 transition flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Retry
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-gray-600">
                <p className="text-gray-400 mb-4">No wishes found for this phone number</p>
                <Link
                  href="/wants"
                  className="inline-flex items-center gap-2 bg-[#ff6b35] text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
                >
                  <Plus className="h-5 w-5" />
                  Make Your First Wish
                </Link>
              </div>
            )}
          </>
        )}

        {/* Not Searched Yet */}
        {!searched && !loading && (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-gray-600">
            <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 mb-2">Enter your phone number to see your wishes</p>
            <p className="text-gray-500 text-sm">Use the same number you used when adding wishes</p>
          </div>
        )}

        {/* Add New Wish Link */}
        <div className="mt-8 text-center">
          <Link href="/wants" className="text-[#ff6b35] hover:underline font-medium">
            + Add a new wish
          </Link>
        </div>
      </div>
    </div>
  );
}
