'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Gift, Users, Link2, Copy, Check, MessageCircle, Mail, ArrowRight, Sparkles, CheckCircle, Package, Clock } from 'lucide-react';
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

export default function MyWantsPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [wants, setWants] = useState<Want[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Request access state
  const [requestEmail, setRequestEmail] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await fetch(`/api/auth/magic-link?token=${token}`);
      const data = await res.json();

      if (data.success) {
        setEmail(data.email);
        setWants(data.wants);
      } else {
        setError(data.error || 'Invalid link');
      }
    } catch (err) {
      setError('Could not verify link');
    } finally {
      setLoading(false);
    }
  };

  const requestMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestEmail) return;

    setRequesting(true);
    setRequestError(null);

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: requestEmail }),
      });
      const data = await res.json();

      if (data.success) {
        setRequestSent(true);
      } else {
        setRequestError(data.error || 'Could not send link');
      }
    } catch (err) {
      setRequestError('Server error');
    } finally {
      setRequesting(false);
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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'sourcing':
        return { label: 'Being Sourced', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Package };
      case 'available':
        return { label: 'Available!', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle };
      default:
        return { label: 'Collecting Verifications', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // No token - show request form
  if (!token || error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="max-w-md mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Gift className="h-16 w-16 text-orange-400 mx-auto mb-6" />
            <h1 className="text-3xl font-black mb-4">My Wants</h1>
            <p className="text-slate-400">
              {error || 'Enter your email to access your dashboard.'}
            </p>
          </div>

          {requestSent ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-green-400 mb-2">Check your email!</h2>
              <p className="text-slate-300">
                We sent a magic link to <span className="font-semibold">{requestEmail}</span>
              </p>
              <p className="text-slate-500 text-sm mt-4">
                Link expires in 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={requestMagicLink} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={requestEmail}
                  onChange={(e) => setRequestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              {requestError && (
                <p className="text-red-400 text-sm">{requestError}</p>
              )}

              <button
                type="submit"
                disabled={requesting}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {requesting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
                {requesting ? 'Sending...' : 'Send Magic Link'}
              </button>

              <p className="text-center text-slate-500 text-sm">
                Don&apos;t have a want yet?{' '}
                <Link href="/wants" className="text-orange-400 hover:underline">
                  Create one first
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Authenticated - show dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="px-4 py-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black">My Wants</h1>
              <p className="text-slate-400 text-sm">{email}</p>
            </div>
            <Link
              href="/wants"
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-black font-medium rounded-xl hover:bg-orange-400 transition"
            >
              <Sparkles className="h-4 w-4" />
              New Want
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {wants.length === 0 ? (
          <div className="text-center py-16">
            <Gift className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No wants yet</h2>
            <p className="text-slate-400 mb-6">Create your first want and start collecting verifications!</p>
            <Link
              href="/wants"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              Create Your First Want <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {wants.map((want) => {
              const verifiedCount = want.verified_count || 0;
              const progress = Math.min((verifiedCount / 10) * 100, 100);
              const remaining = Math.max(0, 10 - verifiedCount);
              const statusConfig = getStatusConfig(want.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={want.id}
                  className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden"
                >
                  {/* Want Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{want.product_name}</h3>
                        {want.description && (
                          <p className="text-slate-400 text-sm mt-1">{want.description}</p>
                        )}
                      </div>
                      <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">Verifications</span>
                        <span className="font-bold">
                          {verifiedCount}/10
                          {remaining > 0 && (
                            <span className="text-slate-500 font-normal ml-2">
                              ({remaining} more needed)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            verifiedCount >= 10
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                              : 'bg-gradient-to-r from-orange-400 to-amber-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      {verifiedCount >= 10 && (
                        <p className="text-green-400 text-sm font-medium mt-2">
                          🎉 Threshold reached! Jeffy is sourcing your product.
                        </p>
                      )}
                    </div>

                    {/* Share Section */}
                    {want.status === 'voting' && (
                      <div className="bg-slate-900/50 rounded-xl p-4">
                        <p className="text-sm text-slate-400 mb-3">
                          Share your link to get verifications:
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="text"
                            readOnly
                            value={getShareLink(want)}
                            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-300"
                          />
                          <button
                            onClick={() => copyShareLink(want)}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                          >
                            {copiedId === want.id ? (
                              <Check className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <button
                          onClick={() => shareViaWhatsApp(want)}
                          className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Share on WhatsApp
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 bg-slate-900/30 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
                    <span>{want.category}</span>
                    <span>Created {new Date(want.created_at).toLocaleDateString()}</span>
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
