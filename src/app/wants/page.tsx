'use client';

import { useState, useEffect } from 'react';
import { Loader2, ThumbsUp, Plus, Search, TrendingUp, Package, CheckCircle, Gift, ChevronUp, X, Share2, MessageCircle, Filter } from 'lucide-react';

interface Want {
  id: string;
  product_name: string;
  description: string | null;
  category: string;
  vote_count: number;
  status: string;
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
  const [voterEmail, setVoterEmail] = useState('');
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [voting, setVoting] = useState<string | null>(null);
  
  // New want form
  const [showForm, setShowForm] = useState(false);
  const [newWant, setNewWant] = useState({ product_name: '', description: '', category: 'General', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error' | 'similar'; text: string; similar?: Want[] } | null>(null);

  // Load email from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('jeffy_voter_email');
    if (stored) {
      setVoterEmail(stored);
      setNewWant(prev => ({ ...prev, email: stored }));
    }
    const storedVotes = localStorage.getItem('jeffy_voted_wants');
    if (storedVotes) {
      setVotedIds(new Set(JSON.parse(storedVotes)));
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

  const handleVote = async (wantId: string) => {
    if (!voterEmail) {
      // Prompt for email
      const email = prompt('Enter your email to vote:');
      if (!email || !email.includes('@')) return;
      setVoterEmail(email);
      localStorage.setItem('jeffy_voter_email', email);
    }

    setVoting(wantId);
    try {
      const res = await fetch('/api/wants/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ want_id: wantId, voter_email: voterEmail })
      });
      const data = await res.json();

      if (data.success) {
        // Update local state
        setWants(prev => prev.map(w => 
          w.id === wantId ? { ...w, vote_count: data.want.vote_count, status: data.want.status } : w
        ));
        setVotedIds(prev => {
          const newSet = new Set(prev);
          newSet.add(wantId);
          localStorage.setItem('jeffy_voted_wants', JSON.stringify([...newSet]));
          return newSet;
        });
      } else if (data.alreadyVoted) {
        setVotedIds(prev => new Set(prev).add(wantId));
      }
    } catch (error) {
      console.error('Vote error:', error);
    } finally {
      setVoting(null);
    }
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
        setSubmitMessage({ type: 'success', text: 'Product requested! Share it to get votes.' });
        setNewWant({ product_name: '', description: '', category: 'General', email: newWant.email });
        localStorage.setItem('jeffy_voter_email', newWant.email);
        setVoterEmail(newWant.email);
        fetchWants();
        setTimeout(() => setShowForm(false), 2000);
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

  const shareWant = (want: Want) => {
    const url = `https://jeffy.co.za/wants?highlight=${want.id}`;
    const message = `🔥 I want "${want.product_name}" on Jeffy! Vote to help make it happen: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Requests</h1>
            <p className="text-sm text-gray-500">Vote for products you want. First requester gets it FREE!</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition"
          >
            <Plus className="h-4 w-4" /> Request
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex gap-4 overflow-x-auto">
          {[
            { key: 'voting', label: 'Voting', count: stats.voting, icon: ThumbsUp, color: 'text-blue-600' },
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
            <option value="votes">Most Votes</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Wants List */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
          </div>
        ) : wants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border">
            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No products in this category yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-amber-600 font-medium hover:underline"
            >
              Be the first to request one!
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wants.map((want) => {
              const status = STATUS_CONFIG[want.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.voting;
              const StatusIcon = status.icon;
              const hasVoted = votedIds.has(want.id);
              const isVoting = voting === want.id;
              const progress = Math.min((want.vote_count / 50) * 100, 100);

              return (
                <div
                  key={want.id}
                  className="bg-white rounded-xl border p-4 hover:shadow-sm transition"
                >
                  <div className="flex items-start gap-4">
                    {/* Vote Button */}
                    <button
                      onClick={() => !hasVoted && handleVote(want.id)}
                      disabled={hasVoted || isVoting || want.status !== 'voting'}
                      className={`flex flex-col items-center min-w-[60px] p-2 rounded-xl transition ${
                        hasVoted
                          ? 'bg-amber-100 text-amber-600'
                          : want.status !== 'voting'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-600'
                      }`}
                    >
                      {isVoting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <ChevronUp className={`h-5 w-5 ${hasVoted ? 'text-amber-600' : ''}`} />
                      )}
                      <span className="font-bold text-lg">{want.vote_count}</span>
                    </button>

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

                      {/* Progress to 50 votes */}
                      {want.status === 'voting' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>{want.vote_count}/50 votes to source</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-gray-400">{want.category}</span>
                        <button
                          onClick={() => shareWant(want)}
                          className="text-xs text-gray-500 hover:text-amber-600 flex items-center gap-1"
                        >
                          <MessageCircle className="h-3 w-3" /> Share
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
            <span className="font-medium">First person to request a product gets it FREE when sourced!</span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-1.5 bg-white text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition"
          >
            Request Now
          </button>
        </div>
      </div>

      {/* New Want Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Request a Product</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitMessage?.type === 'similar' ? (
              <div>
                <p className="text-amber-600 mb-4">{submitMessage.text}</p>
                <div className="space-y-2 mb-4">
                  {submitMessage.similar?.map((s) => (
                    <div key={s.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <span className="font-medium">{s.product_name}</span>
                      <button
                        onClick={() => { handleVote(s.id); setShowForm(false); }}
                        className="text-amber-600 font-medium text-sm"
                      >
                        Vote ({s.vote_count})
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
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newWant.category}
                    onChange={(e) => setNewWant(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">We&apos;ll notify you when it&apos;s available + you get it FREE!</p>
                </div>

                {submitMessage && (
                  <p className={`text-sm ${submitMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {submitMessage.text}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
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
