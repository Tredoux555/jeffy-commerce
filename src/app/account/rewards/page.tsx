'use client';

import { Gift, Star, TrendingUp, History, ChevronRight } from 'lucide-react';
import { LoyaltyCard } from '@/components/loyalty-card';
import { formatCurrency } from '@/lib/utils';

const TIERS = [
  { name: 'Bronze', min: 0, icon: '🥉', color: '#CD7F32', discount: 0, perks: ['1 point per R1 spent', 'Birthday bonus'] },
  { name: 'Silver', min: 500, icon: '🥈', color: '#C0C0C0', discount: 5, perks: ['1.25x points', '5% discount', 'Early access'] },
  { name: 'Gold', min: 2000, icon: '🥇', color: '#FFD700', discount: 10, perks: ['1.5x points', '10% discount', 'Free shipping', 'Priority support'] },
  { name: 'Platinum', min: 5000, icon: '💎', color: '#E5E4E2', discount: 15, perks: ['2x points', '15% discount', 'Free shipping', 'VIP events', 'Exclusive products'] },
];

const mockHistory = [
  { id: '1', type: 'earn', points: 125, description: 'Order #JEF-001234', date: '2024-12-24' },
  { id: '2', type: 'redeem', points: -200, description: 'Discount on order', date: '2024-12-20' },
  { id: '3', type: 'earn', points: 89, description: 'Order #JEF-001189', date: '2024-12-15' },
  { id: '4', type: 'bonus', points: 100, description: 'Sign up bonus', date: '2024-12-01' },
];

export default function RewardsPage() {
  const currentPoints = 850;
  const currentTier = TIERS.find(t => currentPoints >= t.min && (TIERS[TIERS.indexOf(t) + 1]?.min > currentPoints || !TIERS[TIERS.indexOf(t) + 1])) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Rewards</h1>

      {/* Loyalty Card */}
      <LoyaltyCard />

      {/* Tier Progress */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-bold mb-4">Your Tier Progress</h2>
        <div className="flex items-center justify-between mb-4">
          {TIERS.map((tier, idx) => (
            <div key={tier.name} className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                currentPoints >= tier.min ? 'bg-amber-100' : 'bg-gray-100'
              }`}>
                {tier.icon}
              </div>
              <span className={`text-xs mt-1 font-medium ${currentPoints >= tier.min ? 'text-amber-700' : 'text-gray-400'}`}>
                {tier.name}
              </span>
              <span className="text-xs text-gray-400">{tier.min}pts</span>
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
            style={{ width: `${Math.min(100, (currentPoints / 5000) * 100)}%` }}
          />
        </div>
        {nextTier && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Earn {nextTier.min - currentPoints} more points to reach {nextTier.name}!
          </p>
        )}
      </div>

      {/* Current Tier Benefits */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{currentTier.icon}</span>
          <div>
            <h3 className="font-bold text-lg">{currentTier.name} Benefits</h3>
            <p className="text-white/80 text-sm">Your current tier perks</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {currentTier.perks.map((perk, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
              <Star className="h-4 w-4" />
              <span className="text-sm">{perk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Points History */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2">
            <History className="h-5 w-5 text-gray-400" />
            Points History
          </h2>
        </div>
        <div className="divide-y">
          {mockHistory.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{item.description}</p>
                <p className="text-sm text-gray-500">{item.date}</p>
              </div>
              <span className={`font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.points > 0 ? '+' : ''}{item.points} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem Points */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-bold mb-4">Redeem Points</h2>
        <p className="text-gray-600 text-sm mb-4">100 points = R10 discount. Minimum 100 points to redeem.</p>
        <div className="grid grid-cols-3 gap-3">
          {[100, 250, 500].map((pts) => (
            <button
              key={pts}
              disabled={currentPoints < pts}
              className={`p-4 rounded-xl border text-center transition ${
                currentPoints >= pts ? 'hover:border-amber-500 hover:bg-amber-50' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <p className="text-2xl font-bold text-amber-600">{pts}</p>
              <p className="text-sm text-gray-500">points</p>
              <p className="text-sm font-medium text-gray-700 mt-1">= R{pts / 10} off</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
