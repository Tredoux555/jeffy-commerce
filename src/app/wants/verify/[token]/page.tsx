'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, Clock, ArrowRight, Gift, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface VerifyResult {
  success: boolean;
  alreadyVerified?: boolean;
  expired?: boolean;
  invalid?: boolean;
  error?: string;
  verified_count?: number;
  remaining?: number;
  product_name?: string;
  thresholdReached?: boolean;
}

export default function VerifyTokenPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await fetch('/api/wants/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: 'Failed to verify. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-white text-lg">Verifying...</p>
        </div>
      </div>
    );
  }

  // Success states
  if (result?.success) {
    const isThresholdReached = result.thresholdReached || result.remaining === 0;

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          {/* Success Icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isThresholdReached ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-green-100'
          }`}>
            {isThresholdReached ? (
              <Sparkles className="h-10 w-10 text-white" />
            ) : (
              <CheckCircle className="h-10 w-10 text-green-600" />
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {result.alreadyVerified 
              ? 'Already Verified!' 
              : isThresholdReached 
                ? '🎉 Threshold Reached!' 
                : 'Verified!'
            }
          </h1>

          {/* Product Name */}
          {result.product_name && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4 inline-block">
              <p className="text-sm text-gray-500">Product</p>
              <p className="font-semibold text-gray-900">{result.product_name}</p>
            </div>
          )}

          {/* Message */}
          <p className="text-gray-500 mb-6">
            {result.alreadyVerified
              ? "You're already entered in this week's draw for this product."
              : "You're in! You're entered in this week's draw for this product."}
          </p>

          {/* Draw note */}
          <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
            <Gift className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 text-sm">
              Every week Jeffy draws winners at <strong>random</strong> and grants their wish <strong>free</strong> — no purchase, no catch.
            </p>
          </div>

          {/* CTA */}
          <Link 
            href="/wants"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition"
          >
            Browse More Products <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  // Expired token
  if (result?.expired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-500 mb-6">
            This verification link has expired. Please request a new one.
          </p>
          <Link 
            href="/wants"
            className="inline-flex items-center gap-2 text-orange-600 font-medium hover:underline"
          >
            Browse Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Invalid token or error
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
        <p className="text-gray-500 mb-6">
          {result?.error || 'This verification link is invalid or has already been used.'}
        </p>
        <Link 
          href="/wants"
          className="inline-flex items-center gap-2 text-orange-600 font-medium hover:underline"
        >
          Browse Products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
