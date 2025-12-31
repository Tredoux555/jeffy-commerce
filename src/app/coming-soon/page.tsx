'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, Check, Share2, Gift, Users, ChevronDown, Trophy, Star, Zap, Crown, Heart, ArrowRight, MessageCircle, Copy, ExternalLink } from 'lucide-react';

interface RewardTier {
  tier: number;
  name: string;
  reward: string;
  nextAt: number | null;
}

interface UserData {
  email: string;
  position: number;
  referralCode: string;
  referralCount: number;
  rewardTier: RewardTier;
  referredBy?: boolean;
}

const REWARD_TIERS = [
  { referrals: 3, name: 'Supporter', reward: '10% Launch Discount', icon: Star },
  { referrals: 5, name: 'Insider', reward: 'Priority Access', icon: Zap },
  { referrals: 10, name: 'Star', reward: '20% Launch Discount', icon: Trophy },
  { referrals: 25, name: 'Champion', reward: 'R200 Store Credit', icon: Crown },
  { referrals: 50, name: 'Legend', reward: 'Founder Kit + Free Product', icon: Gift },
];

export default function ComingSoonPage() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [totalWaitlist, setTotalWaitlist] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showMission, setShowMission] = useState(false);

  // Fetch waitlist count on load
  useEffect(() => {
    fetch('/api/waitlist')
      .then(res => res.json())
      .then(data => setTotalWaitlist(data.totalWaitlist || 0))
      .catch(() => {});
  }, []);

  // Check for stored user
  useEffect(() => {
    const stored = localStorage.getItem('jeffy_waitlist');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Refresh position
      fetch(`/api/waitlist?email=${encodeURIComponent(parsed.email)}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
            setTotalWaitlist(data.totalWaitlist);
          }
        })
        .catch(() => setUser(parsed));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, referral_code: refCode })
      });
      const data = await res.json();
      
      if (data.success) {
        setUser(data.user);
        setTotalWaitlist(data.totalWaitlist);
        localStorage.setItem('jeffy_waitlist', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = user ? `https://jeffy.co.za/coming-soon?ref=${user.referralCode}` : '';
  
  const whatsappMessage = user 
    ? `🔥 I just joined the Jeffy waitlist! Premium products at factory prices, delivered by local partners.\n\nJoin me and skip the line: ${shareUrl}`
    : '';

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight">
            Jeffy
          </h1>
          <p className="text-amber-600 font-medium text-center">Coming Soon</p>
        </div>

        {/* Main Content */}
        {!user ? (
          /* Signup Form */
          <div className="w-full max-w-md">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">
              Premium Products. Factory Prices.
            </h2>
            <p className="text-gray-600 text-center mb-8">
              Delivered by your neighbors.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg rounded-2xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>Join the Waitlist <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </form>

            {refCode && (
              <p className="text-center text-sm text-green-600 mt-3 flex items-center justify-center gap-1">
                <Check className="h-4 w-4" /> You were referred! You&apos;ll skip ahead in line.
              </p>
            )}

            {totalWaitlist > 0 && (
              <p className="text-center text-gray-500 mt-6 flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                <span><strong>{totalWaitlist.toLocaleString()}</strong> people already waiting</span>
              </p>
            )}
          </div>
        ) : (
          /* Success State */
          <div className="w-full max-w-md text-center">
            <div className="bg-white rounded-3xl shadow-xl border p-8 mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-1">You&apos;re In!</h2>
              <p className="text-gray-500 mb-6">{user.email}</p>

              {/* Position */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-6">
                <p className="text-sm text-amber-700 mb-1">Your Position</p>
                <p className="text-5xl font-black text-gray-900">#{user.position}</p>
                <p className="text-sm text-gray-500 mt-1">of {totalWaitlist.toLocaleString()} in line</p>
              </div>

              {/* Current Reward */}
              <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-purple-600 font-medium">{user.rewardTier.name}</p>
                <p className="text-purple-900 font-bold">{user.rewardTier.reward}</p>
                {user.rewardTier.nextAt && (
                  <p className="text-xs text-purple-500 mt-1">
                    {user.rewardTier.nextAt - user.referralCount} more referrals to unlock next tier
                  </p>
                )}
              </div>

              {/* Referral Stats */}
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-6">
                <Gift className="h-5 w-5 text-amber-500" />
                <span><strong>{user.referralCount}</strong> friends referred</span>
              </div>

              {/* Share Buttons */}
              <div className="space-y-3">
                <button
                  onClick={shareWhatsApp}
                  className="w-full py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="h-5 w-5" /> Share on WhatsApp
                </button>
                
                <button
                  onClick={copyLink}
                  className={`w-full py-3 border-2 font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                    copied 
                      ? 'border-green-500 text-green-600 bg-green-50' 
                      : 'border-gray-200 text-gray-700 hover:border-amber-500 hover:text-amber-600'
                  }`}
                >
                  {copied ? (
                    <><Check className="h-5 w-5" /> Link Copied!</>
                  ) : (
                    <><Copy className="h-5 w-5" /> Copy Referral Link</>
                  )}
                </button>
              </div>

              {/* Referral Code Display */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Your referral code</p>
                <p className="font-mono font-bold text-gray-900">{user.referralCode}</p>
              </div>
            </div>

            {/* Move Up Message */}
            <div className="bg-amber-100 rounded-xl p-4 text-amber-800">
              <p className="font-medium">🚀 Move up the line!</p>
              <p className="text-sm">Each friend who joins moves you up 3 spots.</p>
            </div>
          </div>
        )}

        {/* Scroll Indicator */}
        <button 
          onClick={() => setShowMission(true)}
          className="absolute bottom-8 animate-bounce text-gray-400 hover:text-amber-500 transition"
        >
          <ChevronDown className="h-8 w-8" />
        </button>
      </section>

      {/* Reward Tiers Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Unlock Rewards by Sharing
          </h3>
          <p className="text-center text-gray-500 mb-8">
            The more friends you refer, the better your rewards
          </p>

          <div className="space-y-3">
            {REWARD_TIERS.map((tier, i) => {
              const Icon = tier.icon;
              const unlocked = user && user.referralCount >= tier.referrals;
              return (
                <div 
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 transition ${
                    unlocked 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    unlocked ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{tier.name}</p>
                    <p className="text-sm text-gray-500">{tier.reward}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    unlocked 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tier.referrals} referrals
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-amber-50">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-amber-600 font-medium mb-4">There&apos;s something else...</p>
          
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Every Purchase Builds a Future
          </h3>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Jeffy isn&apos;t just commerce. A portion of every sale funds <strong>free, merit-based schools</strong> for 
            South African students who have the talent but not the opportunity.
          </p>

          <div className="bg-white rounded-2xl shadow-lg border p-8 mb-8">
            <div className="flex items-center justify-center gap-2 text-amber-600 mb-2">
              <Heart className="h-5 w-5" />
              <span className="font-medium">Our Mission</span>
            </div>
            <p className="text-xl text-gray-900 font-medium">
              &ldquo;Premium products that fund futures.&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <p className="text-3xl font-bold text-gray-900">R0</p>
              <p className="text-sm text-gray-500">Raised so far</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500">Students funded</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-gray-900">∞</p>
              <p className="text-sm text-gray-500">Potential</p>
            </div>
          </div>

          <p className="text-gray-500 mt-8">
            Help us change these numbers. <strong>Join the waitlist above.</strong>
          </p>
        </div>
      </section>

      {/* Zone Partners CTA */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">
            Want to Deliver for Jeffy?
          </h3>
          <p className="text-gray-400 mb-6">
            Become a Zone Partner. Earn 50% of every delivery in your area.
          </p>
          <a 
            href="/zone-partners"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-gray-900 font-bold rounded-xl hover:bg-amber-400 transition"
          >
            Learn More <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-50 text-center text-gray-500 text-sm">
        <p>© 2025 Jeffy Commerce. South Africa.</p>
      </footer>
    </div>
  );
}
