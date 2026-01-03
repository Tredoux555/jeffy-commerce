'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, Users, ArrowRight, Gift, AlertCircle, Sparkles, Share2, MessageCircle } from 'lucide-react';
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
    // Check localStorage for previous verification
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
        
        // Save to localStorage
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

  const shareViaWhatsApp = () => {
    const shareUrl = `${window.location.origin}/want/${wantId}`;
    const creatorName = want?.creator_name || 'My friend';
    const productName = want?.product_name || 'something cool';
    
    const message = `Hey! ${creatorName} wants a ${productName} and needs help getting it FREE! 🎁\n\nIf 10 people click "Help", they get it for free. I already helped - can you?\n\n${shareUrl}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const progress = want ? Math.min((want.verified_count / 10) * 100, 100) : 0;
  const remaining = want ? Math.max(0, 10 - want.verified_count) : 10;
  const creatorName = want?.creator_name || 'Your friend';

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
          <p className="text-gray-500 mb-6">{error || 'This product request may have been removed.'}</p>
          <Link href="/wants/create" className="text-orange-600 font-medium hover:underline">
            Create your own want →
          </Link>
        </div>
      </div>
    );
  }

  // SUCCESS STATE - Show WhatsApp share
  if (verified || alreadyHelped) {
    const count = verifyResult?.verified_count || want.verified_count;
    const isComplete = count >= 10;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className={`w-20 h-20 ${isComplete ? 'bg-green-100' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {isComplete ? (
              <Gift className="h-10 w-10 text-green-600" />
            ) : (
              <CheckCircle className="h-10 w-10 text-orange-600" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {alreadyHelped && !verified ? 'You already helped!' : isComplete ? '🎉 They got it FREE!' : 'You're awesome!'}
          </h1>
          <p className="text-gray-500 mb-6">
            {isComplete 
              ? `${creatorName} hit 10 helpers and their ${want.product_name} is being sourced!`
              : `You helped ${creatorName} get closer to their free ${want.product_name}!`
            }
          </p>
          
          {/* Progress */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-bold text-gray-900">{count}/10 helpers</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-orange-400 to-orange-500'}`}
                style={{ width: `${Math.min((count / 10) * 100, 100)}%` }}
              />
            </div>
            {!isComplete && (
              <p className="text-sm text-gray-500 mt-2">
                {10 - count} more {10 - count === 1 ? 'person' : 'people'} needed!
              </p>
            )}
          </div>

          {/* WhatsApp Share - THE KEY VIRAL ELEMENT */}
          <button
            onClick={shareViaWhatsApp}
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center gap-3 text-lg mb-4 transition-all hover:scale-[1.02]"
          >
            <MessageCircle className="h-6 w-6" />
            Share on WhatsApp
          </button>
          <p className="text-sm text-gray-500 mb-6">Help spread the word!</p>

          {/* Create Own Want */}
          <div className="border-t pt-6">
            <p className="text-gray-600 mb-3">Want something for FREE?</p>
            <Link 
              href="/wants/create"
              className="block w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Create Your Own Want
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MAIN VIEW - Simple one-click help
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
                <p className="text-sm text-gray-500 mb-1">{creatorName} wants:</p>
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
                  <span className="text-gray-600">Helpers so far</span>
                </div>
                <span className="font-bold text-gray-900">{want.verified_count}/10</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {remaining > 0 
                  ? `${remaining} more ${remaining === 1 ? 'person' : 'people'} needed to get it FREE!`
                  : '🎉 Goal reached! Being sourced now.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* THE BIG BUTTON - One Click Help */}
        <button
          onClick={handleHelp}
          disabled={verifying}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl p-6 text-left transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <p className="font-bold text-xl">Help {creatorName.split(' ')[0]} get it FREE!</p>
                <p className="text-purple-200 text-sm">One tap - that's all it takes</p>
              </div>
            </div>
            {verifying ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <ArrowRight className="h-8 w-8" />
            )}
          </div>
        </button>

        {/* How it works - subtle */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>When 10 people help, {creatorName.split(' ')[0]} gets this product FREE.</p>
          <p className="mt-1">Then YOU can create your own want!</p>
        </div>

        {/* Create Your Own */}
        <div className="mt-8 text-center">
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