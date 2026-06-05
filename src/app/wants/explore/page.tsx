'use client';

import { useState, useEffect } from 'react';
import { Loader2, Package, Users, Link2, Copy, Check, MessageCircle, ThumbsUp, ThumbsDown, ArrowLeft, Search, Flame, TrendingUp, Clock, Sparkles, Gift } from 'lucide-react';
import Link from 'next/link';

interface Want {
  id: string;
  product_name: string;
  description: string | null;
  category: string;
  verified_count: number;
  popularity_clicks: number;
  status: string;
  creator_referral_code: string;
  created_at: string;
  upvotes?: number;
  downvotes?: number;
}

export default function ExploreWantsPage() {
  const [wants, setWants] = useState<Want[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'trending'>('popular');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [votedIds, setVotedIds] = useState<Record<string, 'up' | 'down'>>({});

  useEffect(() => {
    // Load previous votes from localStorage
    const stored = localStorage.getItem('jeffy_want_votes');
    if (stored) {
      setVotedIds(JSON.parse(stored));
    }
    fetchWants();
  }, [sortBy]);

  const fetchWants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wants/public?status=all&sort=${sortBy === 'newest' ? 'newest' : 'votes'}`);
      const data = await res.json();
      if (data.success) {
        // Add mock upvotes/downvotes based on popularity_clicks for now
        const wantsWithVotes = data.wants.map((w: Want) => ({
          ...w,
          upvotes: w.popularity_clicks || Math.floor(Math.random() * 20),
          downvotes: Math.floor(Math.random() * 5)
        }));
        setWants(wantsWithVotes);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (wantId: string, voteType: 'up' | 'down') => {
    const currentVote = votedIds[wantId];
    
    // If same vote, remove it
    if (currentVote === voteType) {
      const newVotedIds = { ...votedIds };
      delete newVotedIds[wantId];
      setVotedIds(newVotedIds);
      localStorage.setItem('jeffy_want_votes', JSON.stringify(newVotedIds));
      
      // Update local count
      setWants(prev => prev.map(w => {
        if (w.id === wantId) {
          return {
            ...w,
            upvotes: voteType === 'up' ? (w.upvotes || 1) - 1 : w.upvotes,
            downvotes: voteType === 'down' ? (w.downvotes || 1) - 1 : w.downvotes
          };
        }
        return w;
      }));
      return;
    }
    
    // New vote or change vote
    const newVotedIds = { ...votedIds, [wantId]: voteType };
    setVotedIds(newVotedIds);
    localStorage.setItem('jeffy_want_votes', JSON.stringify(newVotedIds));
    
    // Update local counts
    setWants(prev => prev.map(w => {
      if (w.id === wantId) {
        let upvotes = w.upvotes || 0;
        let downvotes = w.downvotes || 0;
        
        // If changing vote, remove old vote
        if (currentVote === 'up') upvotes--;
        if (currentVote === 'down') downvotes--;
        
        // Add new vote
        if (voteType === 'up') upvotes++;
        if (voteType === 'down') downvotes++;
        
        return { ...w, upvotes, downvotes };
      }
      return w;
    }));

    // Track popularity click
    try {
      await fetch('/api/wants/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ want_id: wantId, vote_type: voteType })
      });
    } catch (e) {
      // Silent fail - votes are stored locally anyway
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
    const message = `🛒 Check out this product request on Jeffy: "${want.product_name}" - Would you buy this? ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredWants = wants.filter(w => 
    w.product_name.toLowerCase().includes(search.toLowerCase()) ||
    (w.description && w.description.toLowerCase().includes(search.toLowerCase())) ||
    w.category.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sourcing':
        return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">Being Sourced</span>;
      case 'available':
        return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Available!</span>;
      default:
        return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">{10 - (wants.find(w => w.status === status)?.verified_count || 0)} more needed</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/wants" className="flex items-center gap-2 text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Link
              href="/wants"
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-black font-medium rounded-xl hover:bg-orange-400 transition text-sm"
            >
              <Sparkles className="h-4 w-4" />
              Make a Wish
            </Link>
          </div>

          <h1 className="text-2xl font-black mb-2">Explore Wishes</h1>
          <p className="text-slate-400 text-sm mb-4">Back the products you&apos;d love to see. Help shape what Jeffy sources next!</p>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          {/* Sort Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('popular')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ${
                sortBy === 'popular' ? 'bg-orange-500 text-black font-medium' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="h-3 w-3" /> Popular
            </button>
            <button
              onClick={() => setSortBy('trending')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ${
                sortBy === 'trending' ? 'bg-orange-500 text-black font-medium' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="h-3 w-3" /> Trending
            </button>
            <button
              onClick={() => setSortBy('newest')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ${
                sortBy === 'newest' ? 'bg-orange-500 text-black font-medium' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="h-3 w-3" /> Newest
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
            <p className="text-slate-500 mt-4">Loading wants...</p>
          </div>
        ) : filteredWants.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-16 w-16 text-slate-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No wants found</h2>
            <p className="text-slate-400 mb-6">
              {search ? `No products matching "${search}"` : 'Be the first to wish for something!'}
            </p>
            <Link
              href="/wants"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-black font-bold rounded-full hover:bg-orange-400 transition"
            >
              <Sparkles className="h-5 w-5" />
              Make Your Wish
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWants.map((want) => {
              const verifiedCount = want.verified_count || 0;
              const progress = Math.min((verifiedCount / 10) * 100, 100);
              const remaining = Math.max(0, 10 - verifiedCount);
              const userVote = votedIds[want.id];
              const netVotes = (want.upvotes || 0) - (want.downvotes || 0);

              return (
                <div key={want.id} className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden hover:border-slate-600 transition">
                  <div className="flex">
                    {/* Vote Column */}
                    <div className="flex flex-col items-center justify-center px-3 py-4 bg-slate-900/50 border-r border-slate-700 min-w-[60px]">
                      <button
                        onClick={() => handleVote(want.id, 'up')}
                        className={`p-1.5 rounded-lg transition ${
                          userVote === 'up' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'text-slate-500 hover:text-green-400 hover:bg-green-500/10'
                        }`}
                      >
                        <ThumbsUp className="h-5 w-5" />
                      </button>
                      <span className={`font-bold text-lg my-1 ${
                        netVotes > 0 ? 'text-green-400' : netVotes < 0 ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {netVotes}
                      </span>
                      <button
                        onClick={() => handleVote(want.id, 'down')}
                        className={`p-1.5 rounded-lg transition ${
                          userVote === 'down' 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10'
                        }`}
                      >
                        <ThumbsDown className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{want.product_name}</h3>
                          {want.description && (
                            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{want.description}</p>
                          )}
                        </div>
                        {want.status === 'voting' ? (
                          <span className="shrink-0 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                            {remaining > 0 ? `${remaining} more` : 'Ready!'}
                          </span>
                        ) : (
                          getStatusBadge(want.status)
                        )}
                      </div>

                      {/* Draw status */}
                      {want.status === 'voting' && (
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1 text-xs text-green-400">
                            <Gift className="h-3 w-3" />
                            In this week&apos;s draw
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">{want.category}</span>
                        <button 
                          onClick={() => copyShareLink(want)} 
                          className="text-xs text-slate-400 hover:text-orange-400 flex items-center gap-1 transition"
                        >
                          {copiedId === want.id ? (
                            <><Check className="h-3 w-3 text-green-400" /> Copied!</>
                          ) : (
                            <><Link2 className="h-3 w-3" /> Copy Link</>
                          )}
                        </button>
                        <button 
                          onClick={() => shareViaWhatsApp(want)} 
                          className="text-xs text-slate-400 hover:text-green-400 flex items-center gap-1 transition"
                        >
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </button>
                        <span className="text-xs text-slate-600 ml-auto">
                          {new Date(want.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
