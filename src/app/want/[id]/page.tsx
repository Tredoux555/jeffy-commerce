'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, Users, Mail, Phone, ArrowRight, Gift, AlertCircle, Sparkles, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
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

  // Form expansion
  const [showForm, setShowForm] = useState(false);

  // Verification form
  const [method, setMethod] = useState<'email' | 'phone' | 'whatsapp'>('whatsapp');
  const [contact, setContact] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  // OTP verification
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
      // For WhatsApp, treat it same as SMS but with whatsapp flag
      const apiMethod = method === 'whatsapp' ? 'sms' : method;
      
      const res = await fetch('/api/wants/request-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          want_id: wantId,
          ref_code: refCode || want?.creator_referral_code,
          method: apiMethod,
          contact,
          via_whatsapp: method === 'whatsapp',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
        if (method === 'phone' || method === 'whatsapp') {
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

  // SUCCESS STATE
  if (verified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {verifyResult?.alreadyVerified ? 'Already Verified!' : '🎉 You\'re in!'}
          </h1>
          <p className="text-gray-500 mb-6">
            {verifyResult?.alreadyVerified 
              ? 'You have already verified this product request.'
              : verifyResult?.thresholdReached
                ? '🔥 This product hit 10 verifications and is being sourced!'
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
            href="/wants/create"
            className="block w-full py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 mb-3"
          >
            Create Your Own Want (Get FREE Stuff!)
          </Link>
          <Link 
            href="/wants"
            className="inline-flex items-center gap-2 text-gray-500 text-sm hover:underline"
          >
            Browse more products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // EMAIL SENT STATE
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
            Click the link in the email to confirm your interest.
          </p>
          <button
            onClick={() => { setSent(false); setContact(''); setShowForm(true); }}
            className="text-gray-500 text-sm hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  // OTP ENTRY STATE
  if (showOtp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {method === 'whatsapp' ? (
                <MessageCircle className="h-8 w-8 text-green-600" />
              ) : (
                <Phone className="h-8 w-8 text-orange-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter Code</h1>
            <p className="text-gray-500">
              We sent a 6-digit code to <strong>{contact}</strong>
              {method === 'whatsapp' && <span className="text-green-600"> via WhatsApp</span>}
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
              onClick={() => { setShowOtp(false); setSent(false); setOtp(''); setShowForm(true); }}
              className="w-full text-gray-500 text-sm hover:underline"
            >
              Use a different number
            </button>
          </form>
        </div>
      </div>
    );
  }

  // MAIN VIEW
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="p-4">
        <Link href="/" className="text-2xl font-bold text-white">Jeffy</Link>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Product Card */}
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

        {/* CLICKABLE PURPLE BANNER - Opens form when clicked */}
        <button 
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-5 mb-4 text-left hover:from-purple-700 hover:to-indigo-700 transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-bold text-lg">Would you buy this too?</p>
                <p className="text-sm text-purple-200">
                  Tap here to verify — help them get it FREE!
                </p>
              </div>
            </div>
            {showForm ? (
              <ChevronUp className="h-6 w-6 shrink-0" />
            ) : (
              <ChevronDown className="h-6 w-6 shrink-0 animate-bounce" />
            )}
          </div>
        </button>

        {/* EXPANDABLE VERIFICATION FORM */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 animate-in slide-in-from-top-2 duration-300">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Verify</h2>

            {/* Method Selection - 3 options */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => setMethod('whatsapp')}
                className={`py-3 px-2 rounded-xl font-medium flex flex-col items-center gap-1 transition ${
                  method === 'whatsapp' 
                    ? 'bg-green-100 text-green-700 ring-2 ring-green-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-xs">WhatsApp</span>
              </button>
              <button
                onClick={() => setMethod('phone')}
                className={`py-3 px-2 rounded-xl font-medium flex flex-col items-center gap-1 transition ${
                  method === 'phone' 
                    ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Phone className="h-5 w-5" />
                <span className="text-xs">SMS</span>
              </button>
              <button
                onClick={() => setMethod('email')}
                className={`py-3 px-2 rounded-xl font-medium flex flex-col items-center gap-1 transition ${
                  method === 'email' 
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Mail className="h-5 w-5" />
                <span className="text-xs">Email</span>
              </button>
            </div>

            <form onSubmit={handleSendVerification} className="space-y-4">
              {method === 'email' ? (
                <input
                  type="email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                  required
                  autoFocus
                />
              ) : (
                <div>
                  <input
                    type="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="082 123 4567"
                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                    required
                    autoFocus
                  />
                  {method === 'whatsapp' && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> We'll send the code to your WhatsApp
                    </p>
                  )}
                </div>
              )}

              {sendError && (
                <p className="text-red-600 text-sm">{sendError}</p>
              )}

              <button
                type="submit"
                disabled={sending || !contact}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
              >
                {sending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Yes, I'd Buy This! <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4">
              One verification per person. No spam, ever.
            </p>
          </div>
        )}

        {/* Create Your Own CTA */}
        <div className="mt-6 text-center">
          <Link 
            href="/wants/create"
            className="inline-flex items-center gap-2 text-orange-400 font-medium hover:text-orange-300"
          >
            Or create your own want & get it FREE <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}