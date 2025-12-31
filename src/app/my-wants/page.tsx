'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Copy, Check, MessageCircle, Share2, Gift, Sparkles, ChevronRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface Want {
  id: string;
  product_name: string;
  description: string | null;
  category: string;
  verified_count: number;
  status: string;
  creator_referral_code: string;
  created_at: string;
  image_url: string | null;
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
  const [want, setWant] = useState<Want | null>(null);
  const [copied, setCopied] = useState(false);
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Trigger confetti when they hit 10
  useEffect(() => {
    if (want && want.verified_count >= 10 && !celebrated) {
      setCelebrated(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f97316', '#22c55e', '#eab308', '#ffffff']
      });
    }
  }, [want, celebrated]);

  const checkAuth = async () => {
    const token = localStorage.getItem('jeffy_session');
    
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      
      const data = await res.json();

      if (data.success) {
        setUser(data.user);
        // Get the first (and only) want
        if (data.wants && data.wants.length > 0) {
          setWant(data.wants[0]);
        }
      } else {
        localStorage.removeItem('jeffy_session');
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jeffy_session');
    router.push('/');
  };

  const getShareLink = () => {
    if (!want) return '';
    return `https://jeffy.co.za/want/${want.id}?ref=${want.creator_referral_code}`;
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(getShareLink());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const link = getShareLink();
    const remaining = Math.max(0, 10 - (want?.verified_count || 0));
    const message = want?.verified_count === 0
      ? `🛍️ I found "${want?.product_name}" and if 10 people want it too, I get it FREE!\n\nWould you actually buy this? Takes 2 seconds to verify:\n${link}`
      : `🔥 I'm ${remaining} away from getting "${want?.product_name}" FREE!\n\nCan you help? Just verify you'd want this too:\n${link}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // No want yet - prompt to create one
  if (!want) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
        <header className="p-4 flex items-center justify-between">
          <span className="text-2xl font-black text-orange-500">Jeffy</span>
          <button onClick={handleLogout} className="text-slate-500 text-sm">
            <LogOut className="h-4 w-4" />
          </button>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mb-6">
            <Gift className="h-10 w-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">No Want Yet</h1>
          <p className="text-slate-400 mb-8 max-w-xs">
            Tell us what product you want. Get 10 friends to verify, and it's yours FREE.
          </p>
          <Link
            href="/wants"
            className="bg-orange-500 text-black font-bold px-8 py-4 rounded-full text-lg flex items-center gap-2"
          >
            Create Your Want <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  const verified = want.verified_count || 0;
  const remaining = Math.max(0, 10 - verified);
  const progress = Math.min((verified / 10) * 100, 100);
  const isComplete = verified >= 10;

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
      {/* Minimal Header */}
      <header className="p-4 flex items-center justify-between">
        <span className="text-2xl font-black text-orange-500">Jeffy</span>
        <button onClick={handleLogout} className="text-slate-500">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-4 pb-4">
        
        {/* Product Image */}
        <div className="relative mx-auto w-full max-w-sm aspect-square rounded-3xl overflow-hidden bg-slate-800/50 mb-6">
          {want.image_url ? (
            <img 
              src={want.image_url} 
              alt={want.product_name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Gift className="h-24 w-24 text-slate-600" />
            </div>
          )}
          
          {/* Complete Badge Overlay */}
          {isComplete && (
            <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-green-500 text-black font-black text-xl px-6 py-3 rounded-full flex items-center gap-2 shadow-lg shadow-green-500/50">
                <Sparkles className="h-6 w-6" />
                IT'S YOURS!
              </div>
            </div>
          )}
        </div>

        {/* Product Name */}
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          {want.product_name}
        </h1>

        {/* Progress Section */}
        <div className="bg-slate-800/50 rounded-3xl p-6 mb-6">
          {/* The Number - Big and Bold */}
          <div className="text-center mb-4">
            <div className="flex items-baseline justify-center gap-1">
              <span className={`text-7xl font-black ${isComplete ? 'text-green-400' : 'text-orange-500'}`}>
                {verified}
              </span>
              <span className="text-3xl font-bold text-slate-500">/10</span>
            </div>
            <p className="text-slate-400 text-sm mt-1">friends verified</p>
          </div>

          {/* Progress Bar - Discrete Steps */}
          <div className="flex gap-1.5 mb-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  i < verified 
                    ? isComplete ? 'bg-green-500' : 'bg-orange-500' 
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Stakes Line - Loss Framed */}
          <p className={`text-center font-semibold ${isComplete ? 'text-green-400' : 'text-white'}`}>
            {isComplete 
              ? "🎉 You did it! We're sourcing your product!"
              : remaining === 1
                ? "Just 1 more and it's yours FREE!"
                : `${remaining} more and it's yours FREE`
            }
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action Buttons - Thumb Zone */}
        {!isComplete ? (
          <div className="space-y-3">
            {/* Primary CTA - WhatsApp */}
            <button
              onClick={shareWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-5 px-6 rounded-2xl text-lg flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 active:scale-[0.98] transition-transform"
            >
              <MessageCircle className="h-6 w-6 fill-current" />
              Share on WhatsApp
            </button>

            {/* Secondary - Copy Link */}
            <button
              onClick={copyLink}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-4 px-6 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Completed State */}
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-5 text-center">
              <p className="text-green-400 font-medium">
                We'll email you at <span className="font-bold">{user?.email}</span> when your product is ready!
              </p>
            </div>
            
            {/* Share the win */}
            <button
              onClick={shareWhatsApp}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-4 px-6 rounded-2xl flex items-center justify-center gap-2"
            >
              <Share2 className="h-5 w-5" />
              Share Your Win
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
