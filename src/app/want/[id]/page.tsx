'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, Users, ArrowRight, Gift, AlertCircle, Sparkles, MessageCircle } from 'lucide-react';
import Link from 'next/link';

interface Want {
  id: string;
  product_name: string;
  description: string | null;
  category: string;
  verified_count: number;
  status: string;
  creator_referral_code: string;
  creator_name?: string;
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
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [alreadyHelped, setAlreadyHelped] = useState(false);

  useEffect(() => {
    fetchWant();
    checkIfAlreadyHelped();
  }, [wantId]);

  const checkIfAlreadyHelped = () => {
    const helpedWants = JSON.parse(localStorage.getItem('jeffy_helped_wants') || '[]');
    if (helpedWants.includes(wantId)) {
      setAlreadyHelped(true);
    }
  };

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

  const handleHelp = async () => {
    if (alreadyHelped || verifying) return;
    
    setVerifying(true);

    try {
      const res = await fetch('/api/wants/quick-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          want_id: wantId,
          ref_code: refCode || want?.creator_referral_code,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setVerified(true);
        setVerifyResult(data);
        
        const helpedWants = JSON.parse(localStorage.getItem('jeffy_helped_wants') || '[]');
        helpedWants.push(wantId);
        localStorage.setItem('jeffy_helped_wants', JSON.stringify(helpedWants));
      } else {
        if (data.alreadyVerified) {
          setAlreadyHelped(true);
          setVerifyResult({ alreadyVerified: true, verified_count: data.verified_count });
        } else {
          setError(data.error || 'Something went wrong');
        }
      }
    } catch (err) {
      setError('Failed to verify. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  // Generate personalized WhatsApp message
  const getWhatsAppMessage = () => {
    const shareUrl = `${window.location.origin}/want/${wantId}`;
    const firstName = want?.creator_name?.split(' ')[0] || 'my friend';
    const product = want?.product_name || 'something';
    
    // Clean, personal message - no marketing
    return `${firstName} wants a ${product} - help them get it free?\n\n${shareUrl}`;
  };

  const shareViaWhatsApp = () => {
    const message = getWhatsAppMessage();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const progress = want ? Math.min((want.verified_count / 10) * 100, 100) : 0;
  const remaining = want ? Math.max(0, 10 - want.verified_count) : 10;
  
  // Get first name for personal touch
  const firstName = want?.creator_name?.split(' ')[0] || 'Your friend';
  const productName = want?.product_name || 'this product';

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
          <h1 className="text-xl font-bold text-gray-900 mb-2">Oops!</h1>
          <p className="text-gray-500">{error || 'This link may have expired.'}</p>
        </div>
      </div>
    );
  }

  // ============ SUCCESS STATE ============
  // Clean, personal messaging - no marketing push
  if (verified || alreadyHelped) {
    const count = verifyResult?.verified_count || want.verified_count;
    const isComplete = count >= 10;
    const stepsRemaining = Math.max(0, 10 - count);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          {/* Simple checkmark */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          {/* Core message - personal, not salesy */}
          {isComplete ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-3">
                {firstName} got it free!
              </h1>
              <p className="text-gray-600">
                Thanks to you and 9 others, {firstName} is getting a free {productName}.
              </p>
            </>
          ) : alreadyHelped && !verified ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-3">
                You already helped {firstName}
              </h1>
              <p className="text-gray-600">
                They're {stepsRemaining} {stepsRemaining === 1 ? 'step' : 'steps'} away from getting a free {productName}.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-3">
                You verified this for {firstName}
              </h1>
              <p className="text-gray-600">
                They're {stepsRemaining === 1 ? 'one step' : `${stepsRemaining} steps`} closer to getting a free {productName}.
              </p>
            </>
          )}
          
          {/* Simple progress indicator */}
          <div className="mt-6 mb-8">
            <div className="flex justify-center gap-1">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < count ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-2">{count} of 10</p>
          </div>

          {/* WhatsApp share - the only action */}
          {!isComplete && (
            <button
              onClick={shareViaWhatsApp}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl flex items-center justify-center gap-3 transition-all"
            >
              <MessageCircle className="h-5 w-5" />
              Help spread the word
            </button>
          )}
        </div>
      </div>
    );
  }

  // ============ MAIN VIEW ============
  // Simple ask - help your friend
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <main className="max-w-lg mx-auto px-4 py-12">
        {/* Product Card */}
        <div className="bg-white rounded-2xl overflow-hidden mb-6">
          {/* Product Image */}
          {want.image_url && (
            <div className="w-full aspect-video bg-gray-100">
              <img 
                src={want.image_url} 
                alt={want.product_name}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          
          <div className="p-6">
            {/* Personal ask */}
            <p className="text-gray-500 mb-1">{firstName} wants:</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{want.product_name}</h1>
            
            {want.description && (
              <p className="text-gray-500 text-sm mb-4">{want.description}</p>
            )}

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-2.5 h-2.5 rounded-full ${
                      i < want.verified_count ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-400">{want.verified_count}/10</span>
            </div>
          </div>
        </div>

        {/* THE BUTTON - Simple, personal */}
        <button
          onClick={handleHelp}
          disabled={verifying}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl p-6 transition-all hover:scale-[1.01] disabled:opacity-70"
        >
          <div className="flex items-center justify-center gap-3">
            {verifying ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Sparkles className="h-6 w-6" />
                <span className="text-xl font-medium">Help {firstName} get it free</span>
              </>
            )}
          </div>
        </button>

        {/* Subtle explanation */}
        <p className="text-center text-gray-500 text-sm mt-4">
          {remaining} more {remaining === 1 ? 'person' : 'people'} needed
        </p>
      </main>
    </div>
  );
}