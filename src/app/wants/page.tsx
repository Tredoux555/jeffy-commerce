'use client';

import { useState, useEffect } from 'react';
import { Loader2, ThumbsUp, Plus, Search, TrendingUp, Package, CheckCircle, Gift, ChevronUp, X, Share2, MessageCircle, Filter, Users, Link2, Copy, Check, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface Want {
  id: string;
  product_name: string;
  description: string | null;
  category: string;
  vote_count: number;
  verified_count: number;
  popularity_clicks: number;
  status: string;
  creator_referral_code: string;
  created_at: string;
}

interface Stats {
  voting: number;
  sourcing: number;
  available: number;
}

const STATUS_CONFIG = {
  voting: { label: 'Voting', color: 'bg-blue-100 text-blue-700', icon: ThumbsUp },
  sourcing: { label: 'Being Sourced', color: 'bg-amber-100 text-amber-700', icon: Package },
  available: { label: 'Available!', color: 'bg-green-100 text-green-700', icon: CheckCircle },
};

export default function WantsPage() {
  const [wants, setWants] = useState<Want[]>([]);
  const [stats, setStats] = useState<Stats>({ voting: 0, sourcing: 0, available: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'voting' | 'sourcing' | 'available'>('voting');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // New want form
  const [showForm, setShowForm] = useState(false);
  const [newWant, setNewWant] = useState({ product_name: '', description: '', category: 'General', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error' | 'similar'; text: string; similar?: Want[]; want?: Want } | null>(null);

  // Load email from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('jeffy_voter_email');
    if (stored) {
      setNewWant(prev => ({ ...prev, email: stored }));
    }
  }, []);

  // Fetch wants
  useEffect(() => {
    fetchWants();
  }, [filter, sortBy]);

  const fetchWants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wants/public?status=${filter}&sort=${sortBy}`);
      const data = await res.json();
      if (data.success) {
        setWants(data.wants);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePopularityClick = async (wantId: string) => {
    // Fun engagement metric - just increment locally for now
    setWants(prev => prev.map(w => 
      w.id === wantId ? { ...w, popularity_clicks: (w.popularity_clicks || 0) + 1 } : w
    ));
    // Could also send to server but it's just a fun metric
  };

  const handleSubmitWant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWant.product_name || !newWant.email) return;

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch('/api/wants/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: newWant.product_name,
          description: newWant.description,
          category: newWant.category,
          user_email: newWant.email
        })
      });
      const data = await res.json();

      if (data.success) {
        const shareLink = `https://jeffy.co.za/want/${data.want.id}?ref=${data.want.creator_referral_code}`;
        setSubmitMessage({ 
          type: 'success', 
          text: 'Product requested! Share your link to get verifications.',
          want: data.want
        });
        setNewWant({ product_name: '', description: '', category: 'General', email: newWant.email });
        localStorage.setItem('jeffy_voter_email', newWant.email);
        fetchWants();
      } else if (data.similar) {
        setSubmitMessage({ type: 'similar', text: data.message, similar: data.similar });
      } else {
        setSubmitMessage({ type: 'error', text: data.error || 'Failed to submit' });
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: 'Server error' });
    } finally {
      setSubmitting(false);
    }
  };

  const getShareLink = (want: Want) => {
    return `https://jeffy.co.za/want/${want.id}?ref=${want.creator_referral_code}`;
  };

  const copyShareLink = async (want: Want) => {
    const link = getShareLink(want);
    await navigator.clipboard.writeText(link);
    setCopiedId(want.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareViaWhatsApp = (want: Want) => {
    const link = getShareLink(want);
    const message = `🛒 I want "${want.product_name}" on Jeffy! If 10 people verify, they'll source it and I get mine FREE! Would you buy this too? ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Requests</h1>
            <p className="text-sm text-gray-500">Get 10 verifications → Jeffy sources it → You get it FREE!</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/wants/what-is-this"
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition"
            >
              <HelpCircle className="h-4 w-4" /> <span className="hidden sm:inline">What is this?</span>
            </Link>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition"
            >
              <Plus className="h-4 w-4" /> Request
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-4 overflow-x-auto">
          {[
            { key: 'voting', label: 'Voting', count: stats.voting, icon: Users, color: 'text-blue-600' },
            { key: 'sourcing', label: 'Being Sourced', count: stats.sourcing, icon: Package, color: 'text-amber-600' },
            { key: 'available', label: 'Available', count: stats.available, icon: CheckCircle, color: 'text-green-600' },
          ].map(({ key, label, count, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${
                filter === key ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
              }`}
            >
              <Icon className={`h-4 w-4 ${color}`} />
              <span>{label}</span>
              <span className="text-gray-400">({count})</span>
            </button>
          ))}
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
              filter === 'all' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Sort */}
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-500">{wants.length} products</p>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border-0 bg-transparent focus:ring-0 text-gray-600"
          >
            <option value="votes">Most Progress</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Wants List */}
      <div className="max-w-4xl mx-auto px-4 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
          </div>
        ) : wants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border">
            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No products in this category yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-orange-600 font-medium hover:underline"
            >
              Be the first to request one!
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wants.map((want) => {
              const status = STATUS_CONFIG[want.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.voting;
              const StatusIcon = status.icon;
              const verifiedCount = want.verified_count || 0;
              const progress = Math.min((verifiedCount / 10) * 100, 100);
              const remaining = Math.max(0, 10 - verifiedCount);

              return (
                <div
                  key={want.id}
                  className="bg-white rounded-xl border p-4 hover:shadow-sm transition"
                >
                  <div className="flex items-start gap-4">
                    {/* Verification Count Display */}
                    <div className="flex flex-col items-center min-w-[70px] p-3 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                      <Users className="h-4 w-4 text-orange-500 mb-1" />
                      <span className="font-bold text-xl text-gray-900">{verifiedCount}</span>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide">verified</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{want.product_name}</h3>
                          {want.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{want.description}</p>
                          )}
                        </div>
                        <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </div>

                      {/* Progress to 10 verifications */}
                      {want.status === 'voting' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>{verifiedCount}/10 verifications to source</span>
                            <span>{remaining > 0 ? `${remaining} more needed` : '🎉 Ready!'}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className="text-xs text-gray-400">{want.category}</span>
                        
                        {/* Share buttons */}
                        <button
                          onClick={() => copyShareLink(want)}
                          className="text-xs text-gray-500 hover:text-orange-600 flex items-center gap-1"
                        >
                          {copiedId === want.id ? (
                            <><Check className="h-3 w-3 text-green-500" /> Copied!</>
                          ) : (
                            <><Link2 className="h-3 w-3" /> Copy Link</>
                          )}
                        </button>
                        <button
                          onClick={() => shareViaWhatsApp(want)}
                          className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-1"
                        >
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </button>

                        {/* Fun popularity metric */}
                        <button
                          onClick={() => handlePopularityClick(want.id)}
                          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 ml-auto"
                        >
                          <ThumbsUp className="h-3 w-3" /> {want.popularity_clicks || 0}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* First Requester Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            <span className="font-medium text-sm sm:text-base">10 friends verify = Jeffy sources it = YOU get it FREE!</span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-1.5 bg-white text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition text-sm"
          >
            Request
          </button>
        </div>
      </div>

      {/* New Want Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Request a Product</h2>
              <button onClick={() => { setShowForm(false); setSubmitMessage(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitMessage?.type === 'success' && submitMessage.want ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Product Requested!</h3>
                <p className="text-gray-500 mb-4">Now share your link to get 10 verifications.</p>
                
                {/* Share Link */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Your verification link:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getShareLink(submitMessage.want)}
                      className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm"
                    />
                    <button
                      onClick={() => copyShareLink(submitMessage.want!)}
                      className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => shareViaWhatsApp(submitMessage.want!)}
                    className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" /> Share on WhatsApp
                  </button>
                </div>

                <button
                  onClick={() => { setShowForm(false); setSubmitMessage(null); }}
                  className="w-full mt-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  Done
                </button>
              </div>
            ) : submitMessage?.type === 'similar' ? (
              <div>
                <p className="text-amber-600 mb-4">{submitMessage.text}</p>
                <div className="space-y-2 mb-4">
                  {submitMessage.similar?.map((s) => (
                    <div key={s.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <span className="font-medium">{s.product_name}</span>
                      <button
                        onClick={() => { shareViaWhatsApp(s); setShowForm(false); }}
                        className="text-orange-600 font-medium text-sm"
                      >
                        Share ({s.verified_count || 0}/10)
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setSubmitMessage(null)}
                  className="w-full py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Request Anyway
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitWant} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={newWant.product_name}
                    onChange={(e) => setNewWant(prev => ({ ...prev, product_name: e.target.value }))}
                    placeholder="e.g., Stanley 40oz Tumbler Dupe"
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                  <textarea
                    value={newWant.description}
                    onChange={(e) => setNewWant(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Any specific features or details..."
                    rows={2}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newWant.category}
                    onChange={(e) => setNewWant(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option>General</option>
                    <option>Drinkware</option>
                    <option>Electronics</option>
                    <option>Beauty</option>
                    <option>Home</option>
                    <option>Fashion</option>
                    <option>Fitness</option>
                    <option>Kitchen</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Email *</label>
                  <input
                    type="email"
                    value={newWant.email}
                    onChange={(e) => setNewWant(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">We&apos;ll notify you when it&apos;s sourced + you get it FREE!</p>
                </div>

                {submitMessage?.type === 'error' && (
                  <p className="text-sm text-red-600">{submitMessage.text}</p>
                )}

                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-800">
                    <strong>How it works:</strong> Request a product → Share your link with 10 friends → They verify → Jeffy sources it → You get it FREE!
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
