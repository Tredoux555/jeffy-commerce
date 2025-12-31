'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, Users, Copy, MessageCircle, Gift, ArrowRight, Share2, LogOut, Package, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Want {
  id: string;
  product_name: string;
  description: string | null;
  category: string;
  verified_count: number;
  status: string;
  creator_referral_code: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  name: string | null;
}

export default function MyWantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [wants, setWants] = useState<Want[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('jeffy_session');
    
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        setWants(data.wants || []);
      } else {
        // Invalid session
        localStorage.removeItem('jeffy_session');
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('jeffy_session');
    if (token) {
      await fetch('/api/auth/me', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    localStorage.removeItem('jeffy_session');
    router.push('/login');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white">Jeffy</Link>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-white flex items-center gap-2 text-sm"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Wants</h1>
          <p className="text-slate-400">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
            <p className="text-3xl font-bold text-white">{wants.length}</p>
            <p className="text-sm text-slate-400">Wants</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
            <p className="text-3xl font-bold text-orange-400">
              {wants.reduce((acc, w) => acc + (w.verified_count || 0), 0)}
            </p>
            <p className="text-sm text-slate-400">Verifications</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-slate-700">
            <p className="text-3xl font-bold text-green-400">
              {wants.filter(w => w.status === 'sourcing' || w.status === 'available').length}
            </p>
            <p className="text-sm text-slate-400">Earned</p>
          </div>
        </div>

        {/* Wants List */}
        {wants.length === 0 ? (
          <div className="bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-700">
            <Gift className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Wants Yet</h2>
            <p className="text-slate-400 mb-6">Create your first want and start collecting verifications!</p>
            <Link
              href="/wants"
              className="inline-flex items-center gap-2 bg-orange-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-orange-400"
            >
              Create a Want <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {wants.map((want) => {
              const progress = Math.min((want.verified_count / 10) * 100, 100);
              const remaining = Math.max(0, 10 - want.verified_count);
              const isComplete = want.verified_count >= 10;

              return (
                <div 
                  key={want.id} 
                  className={`rounded-2xl p-5 border ${
                    isComplete 
                      ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30' 
                      : 'bg-slate-800/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{want.product_name}</h3>
                      {want.description && (
                        <p className="text-sm text-slate-400 mt-1">{want.description}</p>
                      )}
                    </div>
                    {isComplete ? (
                      <span className="shrink-0 px-3 py-1 bg-green-500 text-black text-xs font-bold rounded-full flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> FREE!
                      </span>
                    ) : (
                      <span className="shrink-0 px-3 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded-full">
                        {want.status === 'sourcing' ? 'Sourcing' : 'Collecting'}
                      </span>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users className="h-4 w-4" /> Verifications
                      </span>
                      <span className="font-bold text-white">{want.verified_count}/10</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-orange-500'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {isComplete 
                        ? '🎉 You earned your free product!' 
                        : `${remaining} more ${remaining === 1 ? 'person' : 'people'} needed`
                      }
                    </p>
                  </div>

                  {/* Actions */}
                  {!isComplete && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyShareLink(want)}
                        className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2"
                      >
                        {copiedId === want.id ? (
                          <><CheckCircle className="h-4 w-4 text-green-400" /> Copied!</>
                        ) : (
                          <><Copy className="h-4 w-4" /> Copy Link</>
                        )}
                      </button>
                      <button
                        onClick={() => shareViaWhatsApp(want)}
                        className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" /> WhatsApp
                      </button>
                    </div>
                  )}

                  {isComplete && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-3 bg-green-500/20 rounded-xl text-center">
                        <p className="text-green-400 text-sm font-medium">
                          🎁 We&apos;ll contact you when it&apos;s ready!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Create More */}
        {wants.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/wants"
              className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 font-medium"
            >
              Create Another Want <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
