'use client';

import { useState, useEffect } from 'react';
import { Gift, Copy, Check, Share2, Users, MessageCircle, Mail, Twitter, Facebook } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ReferralStats {
  totalReferred: number;
  pendingRewards: number;
  earnedRewards: number;
  referralCode: string;
}

// Generate referral code from email
function generateReferralCode(email: string): string {
  const base = email.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${base}${suffix}`;
}

export function ReferralDashboard({ email }: { email: string }) {
  const [stats, setStats] = useState<ReferralStats>({
    totalReferred: 0,
    pendingRewards: 0,
    earnedRewards: 0,
    referralCode: generateReferralCode(email),
  });
  const [copied, setCopied] = useState(false);

  const referralLink = `https://jeffy.co.za?ref=${stats.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareVia = (platform: string) => {
    const message = encodeURIComponent(`Hey! Get R50 off your first order at Jeffy with my link: ${referralLink}`);
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${message}`,
      twitter: `https://twitter.com/intent/tweet?text=${message}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      email: `mailto:?subject=${encodeURIComponent('Get R50 off at Jeffy!')}&body=${message}`,
    };
    window.open(urls[platform], '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Gift className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Give R50, Get R50</h2>
            <p className="text-green-100">Share with friends and both of you save!</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="bg-white/20 rounded-xl p-4 mb-4">
          <label className="text-green-100 text-sm mb-2 block">Your Referral Link</label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 bg-white/30 text-white placeholder-white/60 rounded-lg px-4 py-3 text-sm font-mono"
            />
            <button
              onClick={copyLink}
              className="bg-white text-green-600 px-4 py-3 rounded-lg font-bold hover:bg-green-50 transition flex items-center gap-2"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2">
          <button onClick={() => shareVia('whatsapp')} className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl flex items-center justify-center gap-2 transition">
            <MessageCircle className="h-5 w-5" /> WhatsApp
          </button>
          <button onClick={() => shareVia('facebook')} className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl flex items-center justify-center gap-2 transition">
            <Facebook className="h-5 w-5" /> Facebook
          </button>
          <button onClick={() => shareVia('twitter')} className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl flex items-center justify-center gap-2 transition">
            <Twitter className="h-5 w-5" /> Twitter
          </button>
          <button onClick={() => shareVia('email')} className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl flex items-center justify-center gap-2 transition">
            <Mail className="h-5 w-5" /> Email
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 text-center">
          <Users className="h-6 w-6 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats.totalReferred}</p>
          <p className="text-gray-500 text-sm">Friends Referred</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <Gift className="h-6 w-6 mx-auto text-amber-500 mb-2" />
          <p className="text-2xl font-bold">{formatCurrency(stats.pendingRewards)}</p>
          <p className="text-gray-500 text-sm">Pending Rewards</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <Check className="h-6 w-6 mx-auto text-green-500 mb-2" />
          <p className="text-2xl font-bold">{formatCurrency(stats.earnedRewards)}</p>
          <p className="text-gray-500 text-sm">Total Earned</p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-bold mb-4">How It Works</h3>
        <div className="space-y-4">
          <Step number={1} title="Share your link" description="Send your unique link to friends via WhatsApp, email, or social media." />
          <Step number={2} title="Friend signs up & orders" description="Your friend gets R50 off their first order of R200 or more." />
          <Step number={3} title="You get R50" description="Once their order is delivered, you get R50 credit to use on your next purchase!" />
        </div>
      </div>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
        {number}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </div>
  );
}

// Compact referral banner for homepage/product pages
export function ReferralBanner() {
  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          <span><strong>Give R50, Get R50!</strong> Refer a friend and both of you save.</span>
        </div>
        <a href="/account/referrals" className="bg-white text-green-600 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-green-50 transition">
          Start Sharing →
        </a>
      </div>
    </div>
  );
}

// Popup for new visitors from referral link
export function ReferralWelcomePopup({ code, onClose }: { code: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">You've Been Invited!</h2>
        <p className="text-gray-600 mb-6">Your friend sent you R50 off your first order at Jeffy!</p>
        
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-700">Your discount will be applied automatically at checkout</p>
          <p className="text-sm text-green-600 mt-1">Minimum order R200</p>
        </div>

        <button onClick={onClose} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">
          Start Shopping with R50 Off
        </button>
      </div>
    </div>
  );
}
