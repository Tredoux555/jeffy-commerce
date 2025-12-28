'use client';

import { useState } from 'react';
import { Gift, Copy, Check, Share2, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface ReferralDashboardProps {
  userId: string;
  referralCode: string;
  referrals: number;
  earnings: number;
}

export function ReferralDashboard({ userId, referralCode, referrals, earnings }: ReferralDashboardProps) {
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://jeffy.co.za';
  const referralLink = `${baseUrl}?ref=${referralCode}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const message = `Hey! Use my Jeffy referral link and we both get R50 off! 🎁\n\n${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#ff6b35] to-orange-500 rounded-xl p-4 text-white">
          <Users className="h-6 w-6 mb-2 opacity-80" />
          <p className="text-3xl font-bold">{referrals}</p>
          <p className="text-sm opacity-80">Friends Referred</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
          <Gift className="h-6 w-6 mb-2 opacity-80" />
          <p className="text-3xl font-bold">R{earnings}</p>
          <p className="text-sm opacity-80">Total Earned</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h3 className="font-medium mb-2">Your Referral Link</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm"
          />
          <Button onClick={copyLink} variant="outline">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Your code: <span className="font-mono font-bold">{referralCode}</span>
        </p>
      </div>

      {/* Share Buttons */}
      <div className="flex gap-3">
        <Button onClick={shareWhatsApp} className="flex-1 bg-[#25D366] hover:bg-green-600">
          <Share2 className="h-4 w-4 mr-2" />
          Share on WhatsApp
        </Button>
        <Button onClick={copyLink} variant="outline" className="flex-1">
          <Copy className="h-4 w-4 mr-2" />
          Copy Link
        </Button>
      </div>

      {/* How it Works */}
      <div className="border rounded-xl p-4">
        <h3 className="font-medium mb-3">How it Works</h3>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="w-6 h-6 bg-[#ff6b35] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <p>Share your link with friends</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 bg-[#ff6b35] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <p>They get R50 off their first order</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 bg-[#ff6b35] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <p>You get R50 credit when they order</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Referral signup form (for new users coming from referral link)
export function ReferralWelcome({ referrerName, discount }: { referrerName: string; discount: number }) {
  return (
    <div className="bg-gradient-to-r from-[#ff6b35] to-orange-500 text-white rounded-xl p-6 text-center">
      <Gift className="h-12 w-12 mx-auto mb-3" />
      <h2 className="text-xl font-bold mb-2">You've been invited!</h2>
      <p className="text-white/90 mb-4">
        {referrerName} sent you R{discount} off your first order
      </p>
      <div className="bg-white/20 rounded-lg py-2 px-4 inline-block">
        <span className="text-2xl font-bold">R{discount} OFF</span>
      </div>
      <p className="text-sm text-white/70 mt-3">
        Applied automatically at checkout
      </p>
    </div>
  );
}

// Generate referral code
export function generateReferralCode(userId: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'JEF';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
