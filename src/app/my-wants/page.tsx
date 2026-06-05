'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Copy, Check, MessageCircle, Share2, Gift, Sparkles, ChevronRight, LogOut, X, Smartphone, Share, Plus } from 'lucide-react';
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
  const [showPWAModal, setShowPWAModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Show PWA modal after auth check completes
  useEffect(() => {
    if (!loading && want) {
      const dismissed = localStorage.getItem('jeffy_pwa_dismissed');
      if (!dismissed) {
        // Small delay so page settles first
        setTimeout(() => setShowPWAModal(true), 500);
      }
    }
  }, [loading, want]);

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

  const dismissPWAModal = () => {
    setShowPWAModal(false);
    if (dontShowAgain) {
      localStorage.setItem('jeffy_pwa_dismissed', 'true');
    }
  };

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
    const message = `🛍️ I added "${want?.product_name}" to my Jeffy Wish List! No purchase, no catch — every week Jeffy draws winners at random and grants their wish free. Make a wish too:\n${link}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Draw-oriented status
  const getMotivation = (count: number) => {
    return { emoji: '🍀', text: "You're in this week's draw!" };
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
          <h1 className="text-2xl font-bold text-white mb-3">No Wishes Yet</h1>
          <p className="text-slate-400 mb-8 max-w-xs">
            Tell us what you want — no purchase, no catch. Every week Jeffy draws winners at random and grants their wish free.
          </p>
          <Link
            href="/wants"
            className="bg-orange-500 text-black font-bold px-8 py-4 rounded-full text-lg flex items-center gap-2"
          >
            Make a Wish <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  const verified = want.verified_count || 0;
  const remaining = Math.max(0, 10 - verified);
  const isComplete = verified >= 10;
  const motivation = getMotivation(verified);

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
      
      {/* PWA Modal */}
      {showPWAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-700">
            {/* Icon */}
            <div className="w-16 h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-orange-500" />
            </div>
            
            {/* Title */}
            <h2 className="text-xl font-bold text-white text-center mb-2">
              Track Your Progress
            </h2>
            <p className="text-slate-400 text-center text-sm mb-6">
              Add Jeffy to your home screen to check your wishes anytime
            </p>
            
            {/* Steps */}
            <div className="bg-slate-900/50 rounded-2xl p-4 mb-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold text-white">1</div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span>Tap</span>
                  <span className="bg-slate-700 px-2 py-1 rounded flex items-center gap-1">
                    <Share className="h-4 w-4" /> Share
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold text-white">2</div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span>Tap</span>
                  <span className="bg-slate-700 px-2 py-1 rounded flex items-center gap-1">
                    <Plus className="h-4 w-4" /> Add to Home Screen
                  </span>
                </div>
              </div>
            </div>
            
            {/* Don't show again checkbox */}
            <label className="flex items-center gap-3 mb-6 cursor-pointer">
              <input 
                type="checkbox" 
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-orange-500 focus:ring-orange-500 focus:ring-offset-slate-800"
              />
              <span className="text-slate-400 text-sm">Don't show this again</span>
            </label>
            
            {/* Close button */}
            <button
              onClick={dismissPWAModal}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-4 rounded-2xl transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Minimal Header */}
      <header className="p-4 flex items-center justify-between">
        <span className="text-2xl font-black text-orange-500">Jeffy</span>
        <button onClick={handleLogout} className="text-slate-500">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-4 pb-4">
        
        {/* Motivation Line */}
        {!isComplete && (
          <div className="text-center mb-4">
            <span className="text-3xl mb-1 block">{motivation.emoji}</span>
            <p className="text-white font-semibold text-lg">{motivation.text}</p>
          </div>
        )}

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

        {/* Draw Status Section */}
        <div className="bg-slate-800/50 rounded-3xl p-6 mb-6 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-green-400" />
          </div>
          <p className="text-green-400 font-bold text-lg mb-1">You&apos;re in this week&apos;s draw</p>
          <p className="text-slate-400 text-sm">
            Every week Jeffy draws winners at random and grants their wish free. No purchase, no catch — nothing to share.
          </p>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action Buttons - Thumb Zone */}
        <div className="space-y-3">
          {/* If a winner, show the heads-up */}
          {isComplete && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-5 text-center">
              <p className="text-green-400 font-medium">
                🏆 You won! We&apos;ll email you at <span className="font-bold">{user?.email}</span> with the details.
              </p>
            </div>
          )}

          {/* Primary CTA - Make another wish */}
          <Link href="/wants" className="block">
            <div className="w-full bg-orange-500 hover:bg-orange-600 text-black font-bold py-5 px-6 rounded-2xl text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform">
              <Gift className="h-6 w-6" />
              Make another Wish
            </div>
          </Link>
          <p className="text-center text-slate-500 text-sm">Each wish you add is another entry in the weekly draw</p>
        </div>
      </main>
    </div>
  );
}
