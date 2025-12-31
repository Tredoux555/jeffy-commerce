'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Package, CheckCircle, Gift, X, MessageCircle, Filter, Users, Link2, Copy, Check, HelpCircle, ThumbsUp, ArrowRight, Sparkles, Heart, Share2, MapPin } from 'lucide-react';
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
    setWants(prev => prev.map(w => 
      w.id === wantId ? { ...w, popularity_clicks: (w.popularity_clicks || 0) + 1 } : w
    ));
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      
      {/* ============ CO-CREATOR HERO ============ */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[150px] opacity-20" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px] opacity-15" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-sm font-medium mb-8">
            <Heart className="h-4 w-4" />
            Your role to play
          </div>

          <h2 className="text-3xl md:text-5xl font-black mb-6">
            You&apos;re not a customer.
            <br />
            <span className="text-orange-400">You&apos;re a co-creator.</span>
          </h2>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12">
            You help us build the catalogue with products people <span className="italic">actually</span> want.
            Not what some buyer in Johannesburg thinks you want. What <span className="text-white font-semibold">you</span> want.
          </p>

          {/* The reward */}
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl p-8 border border-green-500/30 max-w-xl mx-auto">
            <p className="text-slate-400 text-lg mb-2">For your help?</p>
            <p className="text-3xl font-black text-white">
              Your product. <span className="text-green-400">100% free.</span>
            </p>
            <p className="text-lg text-slate-400 mt-2">Gratis. No strings attached.</p>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-orange-400 font-semibold uppercase tracking-wider mb-4">All you need to do</p>
            <h2 className="text-3xl md:text-4xl font-black">Prove there&apos;s demand.</h2>
            <p className="text-xl text-slate-400 mt-2">We do the rest.</p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-start gap-4 bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-black text-black shrink-0 text-sm">1</div>
              <div>
                <h3 className="font-bold mb-1">Request any product you want</h3>
                <p className="text-slate-400 text-sm">Something you saw on TikTok. Something a friend has. Anything.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-black text-black shrink-0 text-sm">2</div>
              <div>
                <h3 className="font-bold mb-1">Get your unique link</h3>
                <p className="text-slate-400 text-sm">Every verification through it counts toward your goal.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-black text-black shrink-0 text-sm">3</div>
              <div>
                <h3 className="font-bold mb-1">Share it with 10 people</h3>
                <p className="text-slate-400 text-sm">Friends. Family. Your WhatsApp group.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-slate-800/50 rounded-2xl p-5 border border-slate-700">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-black text-black shrink-0 text-sm">4</div>
              <div>
                <h3 className="font-bold mb-1">They verify they&apos;re real</h3>
                <p className="text-slate-400 text-sm">Email or phone. Proving they&apos;re actual people with real interest.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-5 border border-green-500/30">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <Gift className="h-5 w-5 text-black" />
              </div>
              <div>
                <h3 className="font-bold mb-1 text-green-400">You get your product free. It gets added to the catalogue.</h3>
                <p className="text-slate-300 text-sm">You proved there&apos;s a market. You earned it.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FOR YOUR FRIENDS ============ */}
      <section className="px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 text-center">
            <Users className="h-8 w-8 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-3">And your friends?</h3>
            <p className="text-slate-300">
              They can <span className="text-white font-semibold">preorder at a discount</span> — or create their own Want and get theirs free.
            </p>
            <p className="text-lg text-white font-semibold mt-4">
              The loop continues. The catalogue grows. Prices drop.
            </p>
          </div>
        </div>
      </section>

      {/* ============ CTA TO CREATE WANT ============ */}
      <section className="px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to request something?
          </h2>
          <p className="text-slate-400 mb-8">
            Create your want, get your 10 verifications, and it&apos;s yours — 100% free.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-xl px-10 py-5 rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all hover:scale-105"
          >
            <Plus className="h-6 w-6" />
            Create Your Want
          </button>
        </div>
      </section>

      {/* ============ ZONE PARTNER BONUS ============ */}
      <section className="px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl p-8 border border-purple-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Bonus for early believers
              </div>
              
              <h3 className="text-2xl font-black mb-4">Want more than a free product?</h3>
              
              <p className="text-slate-300 mb-2">
                <span className="text-white font-bold">Become a Zone Partner.</span> Secure your territory. Build something real.
              </p>
              <p className="text-xl text-white font-black mb-6">
                This could change your life. <span className="text-purple-400">Your destiny.</span>
              </p>
              
              <Link 
                href="/partner"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold px-6 py-3 rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105"
              >
                <MapPin className="h-5 w-5" />
                See Zone Partner Opportunities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CURRENT WANTS LIST ============ */}
      <section className="bg-gray-50 text-gray-900 rounded-t-[3rem] mt-8">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Current Wants</h2>
              <p className="text-sm text-gray-500">Products people are rallying for</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-medium rounded-xl hover:bg-orange-600 transition"
            >
              <Plus className="h-4 w-4" /> Request
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {[
              { key: 'voting', label: 'Voting', count: stats.voting, color: 'text-blue-600' },
              { key: 'sourcing', label: 'Being Sourced', count: stats.sourcing, color: 'text-amber-600' },
              { key: 'available', label: 'Available', count: stats.available, color: 'text-green-600' },
            ].map(({ key, label, count, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition text-sm ${
                  filter === key ? 'bg-gray-200 font-medium' : 'bg-white hover:bg-gray-100'
                }`}
              >
                <span className={color}>{label}</span>
                <span className="text-gray-400">({count})</span>
              </button>
            ))}
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition text-sm ${
                filter === 'all' ? 'bg-gray-200 font-medium' : 'bg-white hover:bg-gray-100'
              }`}
            >
              All
            </button>
          </div>

          {/* Wants List */}
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
                  <div key={want.id} className="bg-white rounded-xl border p-4 hover:shadow-sm transition">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center min-w-[60px] p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                        <Users className="h-4 w-4 text-orange-500 mb-1" />
                        <span className="font-bold text-lg text-gray-900">{verifiedCount}</span>
                        <span className="text-[9px] text-gray-500 uppercase tracking-wide">verified</span>
                      </div>

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

                        {want.status === 'voting' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>{verifiedCount}/10 verifications</span>
                              <span>{remaining > 0 ? `${remaining} more needed` : '🎉 Ready!'}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          <span className="text-xs text-gray-400">{want.category}</span>
                          <button onClick={() => copyShareLink(want)} className="text-xs text-gray-500 hover:text-orange-600 flex items-center gap-1">
                            {copiedId === want.id ? <><Check className="h-3 w-3 text-green-500" /> Copied!</> : <><Link2 className="h-3 w-3" /> Copy Link</>}
                          </button>
                          <button onClick={() => shareViaWhatsApp(want)} className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" /> WhatsApp
                          </button>
                          <button onClick={() => handlePopularityClick(want.id)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 ml-auto">
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
      </section>

      {/* ============ NEW WANT MODAL ============ */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white text-gray-900 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Create Your Want</h2>
              <button onClick={() => { setShowForm(false); setSubmitMessage(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitMessage?.type === 'success' && submitMessage.want ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Want Created!</h3>
                <p className="text-gray-500 mb-4">Now share your link to get 10 verifications.</p>
                
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">Your verification link:</p>
                  <div className="flex items-center gap-2">
                    <input type="text" readOnly value={getShareLink(submitMessage.want)} className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm" />
                    <button onClick={() => copyShareLink(submitMessage.want!)} className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button onClick={() => shareViaWhatsApp(submitMessage.want!)} className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 flex items-center justify-center gap-2">
                  <MessageCircle className="h-5 w-5" /> Share on WhatsApp
                </button>

                <button onClick={() => { setShowForm(false); setSubmitMessage(null); }} className="w-full mt-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">
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
                      <button onClick={() => { shareViaWhatsApp(s); setShowForm(false); }} className="text-orange-600 font-medium text-sm">
                        Share ({s.verified_count || 0}/10)
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setSubmitMessage(null)} className="w-full py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
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

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                  {submitting ? 'Creating...' : 'Create Want'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
