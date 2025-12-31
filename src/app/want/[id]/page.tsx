'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, Users, Mail, Phone, ArrowRight, Gift, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Want {
  id: string;
  product_name: string;
  description: string | null;
  category: string;
  verified_count: number;
  status: string;
  creator_referral_code: string;
  image_url?: string | null;
}

export default function WantVerificationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const wantId = params.id as string;
  const refCode = searchParams.get('ref');

  const [want, setWant] = useState<Want | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verification form
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // OTP verification (for SMS)
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);

  useEffect(() => {
    fetchWant();
  }, [wantId]);

  const fetchWant = async () => {
    try {
      const res = await fetch(`/api/wants/${wantId}`);
      const data = await res.json();
      
      if (data.success) {
        setWant(data.want);
      } else {
        setError(data.error || 'Product not found');
      }
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact) return;

    setSending(true);
    setSendError(null);

    try {
      const res = await fetch('/api/wants/request-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          want_id: wantId,
          ref_code: refCode || want?.creator_referral_code,
          method,
          contact,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
        if (method === 'sms') {
          setShowOtp(true);
        }
      } else {
        if (data.alreadyVerified) {
          setVerified(true);
          setVerifyResult({ alreadyVerified: true });
        } else {
          setSendError(data.error || 'Failed to send verification');
        }
      }
    } catch (err) {
      setSendError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;

    setVerifying(true);

    try {
      const res = await fetch('/api/wants/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          want_id: wantId,
          phone: contact,
          otp,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setVerified(true);
        setVerifyResult(data);
      } else {
        setSendError(data.error || 'Invalid code');
      }
    } catch (err) {
      setSendError('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const progress = want ? Math.min((want.verified_count / 10) * 100, 100) : 0;
  const remaining = want ? Math.max(0, 10 - want.verified_count) : 10;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !want) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-500 mb-6">{error || 'This product request may have been removed.'}</p>
          <Link href="/wants" className="text-orange-600 font-medium hover:underline">
            Browse other requests →
          </Link>
        </div>
      </div>
    );
  }

  // Already verified or success state
  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {verifyResult?.alreadyVerified ? 'Already Verified!' : 'Verified!'}
          </h1>
          <p className="text-gray-500 mb-6">
            {verifyResult?.alreadyVerified 
              ? 'You have already verified this product request.'
              : verifyResult?.thresholdReached
                ? '🎉 This product hit 10 verifications and is being sourced!'
                : `Thanks! ${verifyResult?.remaining || remaining} more people needed.`
            }
          </p>
          
          {/* Progress */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Verification Progress</span>
              <span className="font-bold text-gray-900">
                {verifyResult?.verified_count || want.verified_count}/10
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
                style={{ width: `${Math.min(((verifyResult?.verified_count || want.verified_count) / 10) * 100, 100)}%` }}
              />
            </div>
          </div>

          <Link 
            href="/wants"
            className="inline-flex items-center gap-2 text-orange-600 font-medium hover:underline"
          >
            Browse more products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Email sent - waiting for click
  if (sent && method === 'email') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email!</h1>
          <p className="text-gray-500 mb-4">
            We sent a verification link to <strong>{contact}</strong>
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Click the link in the email to confirm you want this product.
          </p>
          <button
            onClick={() => { setSent(false); setContact(''); }}
            className="text-gray-500 text-sm hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  // SMS OTP entry
  if (showOtp && method === 'sms') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="h-8 w-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter Code</h1>
            <p className="text-gray-500">
              We sent a 6-digit code to <strong>{contact}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              autoFocus
            />

            {sendError && (
              <p className="text-red-600 text-sm text-center">{sendError}</p>
            )}

            <button
              type="submit"
              disabled={verifying || otp.length !== 6}
              className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {verifying ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>Verify <CheckCircle className="h-5 w-5" /></>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setShowOtp(false); setSent(false); setOtp(''); }}
              className="w-full text-gray-500 text-sm hover:underline"
            >
              Use a different number
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main verification form
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="p-4">
        <Link href="/" className="text-2xl font-bold text-white">Jeffy</Link>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Product Card with Image */}
        <div className="bg-white rounded-2xl overflow-hidden mb-6">
          {/* Product Image */}
          {want.image_url && (
            <div className="w-full aspect-video bg-gray-100 relative">
              <img 
                src={want.image_url} 
                alt={want.product_name}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start gap-3 mb-4">
              {!want.image_url && (
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center shrink-0">
                  <Gift className="h-6 w-6 text-orange-600" />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-1">Someone wants your opinion on:</p>
                <h1 className="text-xl font-bold text-gray-900">{want.product_name}</h1>
                {want.description && (
                  <p className="text-gray-500 text-sm mt-1">{want.description}</p>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Verification Progress</span>
                </div>
                <span className="font-bold text-gray-900">{want.verified_count}/10</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {remaining > 0 
                  ? `${remaining} more ${remaining === 1 ? 'person' : 'people'} needed to source this product`
                  : '🎉 Threshold reached! Being sourced now.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Value Prop */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-medium">Would you buy this too?</p>
              <p className="text-sm text-purple-200">
                If 10 people verify, Jeffy will source it — and the person who requested it gets theirs FREE!
              </p>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <div className="bg-white rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Verify Your Interest</h2>

          {/* Method Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMethod('email')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                method === 'email' 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Mail className="h-4 w-4" /> Email
            </button>
            <button
              onClick={() => setMethod('sms')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
                method === 'sms' 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Phone className="h-4 w-4" /> Phone
            </button>
          </div>

          <form onSubmit={handleSendVerification} className="space-y-4">
            {method === 'email' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="082 123 4567"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">South African numbers only</p>
              </div>
            )}

            {sendError && (
              <p className="text-red-600 text-sm">{sendError}</p>
            )}

            <button
              type="submit"
              disabled={sending || !contact}
              className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Yes, I&apos;d Buy This! <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            We&apos;ll only contact you about this product. No spam.
          </p>
        </div>
      </main>
    </div>
  );
}
