'use client';

import { useState } from 'react';
import { Star, Gift, Trophy, TrendingUp, Zap, Crown, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LoyaltyTier {
  name: string;
  minPoints: number;
  multiplier: number;
  perks: string[];
  icon: React.ReactNode;
  color: string;
}

const tiers: LoyaltyTier[] = [
  {
    name: 'Bronze',
    minPoints: 0,
    multiplier: 1,
    perks: ['Earn 1 point per R10 spent', 'Birthday bonus points'],
    icon: <Star className="h-6 w-6" />,
    color: 'from-amber-600 to-amber-800'
  },
  {
    name: 'Silver',
    minPoints: 500,
    multiplier: 1.5,
    perks: ['Earn 1.5x points', 'Early sale access', 'Free shipping over R300'],
    icon: <Trophy className="h-6 w-6" />,
    color: 'from-gray-400 to-gray-600'
  },
  {
    name: 'Gold',
    minPoints: 2000,
    multiplier: 2,
    perks: ['Earn 2x points', 'Exclusive discounts', 'Free shipping', 'Priority support'],
    icon: <Crown className="h-6 w-6" />,
    color: 'from-yellow-400 to-yellow-600'
  },
  {
    name: 'Platinum',
    minPoints: 5000,
    multiplier: 3,
    perks: ['Earn 3x points', 'VIP events', 'Personal shopper', 'Free express shipping'],
    icon: <Zap className="h-6 w-6" />,
    color: 'from-purple-500 to-purple-700'
  }
];

interface LoyaltyDashboardProps {
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  history?: Array<{ date: string; description: string; points: number; type: 'earn' | 'redeem' }>;
}

export function LoyaltyDashboard({ points, totalEarned, totalRedeemed, history = [] }: LoyaltyDashboardProps) {
  const [showHistory, setShowHistory] = useState(false);
  
  const currentTier = tiers.reduce((acc, tier) => points >= tier.minPoints ? tier : acc, tiers[0]);
  const nextTier = tiers.find(t => t.minPoints > points);
  const progress = nextTier 
    ? ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Points Card */}
      <div className={`bg-gradient-to-br ${currentTier.color} rounded-2xl p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {currentTier.icon}
            <span className="font-bold text-lg">{currentTier.name} Member</span>
          </div>
          <span className="text-white/80 text-sm">{currentTier.multiplier}x points</span>
        </div>
        
        <div className="text-center py-4">
          <p className="text-5xl font-bold">{points.toLocaleString()}</p>
          <p className="text-white/80">Available Points</p>
          <p className="text-sm text-white/60 mt-1">
            Worth {formatCurrency(points * 10)} in rewards
          </p>
        </div>

        {/* Progress to next tier */}
        {nextTier && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/80 mb-1">
              <span>{currentTier.name}</span>
              <span>{nextTier.name}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-white/60 mt-1 text-center">
              {nextTier.minPoints - points} points to {nextTier.name}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <TrendingUp className="h-5 w-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{totalEarned.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Earned</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <Gift className="h-5 w-5 text-[#ff6b35] mb-2" />
          <p className="text-2xl font-bold">{totalRedeemed.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Redeemed</p>
        </div>
      </div>

      {/* Current Tier Perks */}
      <div className="border rounded-xl p-4">
        <h3 className="font-bold mb-3">Your {currentTier.name} Perks</h3>
        <ul className="space-y-2">
          {currentTier.perks.map((perk, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
              {perk}
            </li>
          ))}
        </ul>
      </div>

      {/* History Toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full text-center text-[#ff6b35] text-sm hover:underline"
      >
        {showHistory ? 'Hide History' : 'View Points History'}
      </button>

      {/* History */}
      {showHistory && history.length > 0 && (
        <div className="border rounded-xl divide-y">
          {history.slice(0, 10).map((item, i) => (
            <div key={i} className="p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{item.description}</p>
                <p className="text-xs text-gray-500">{item.date}</p>
              </div>
              <span className={`font-bold ${item.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                {item.type === 'earn' ? '+' : '-'}{item.points}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Points redemption at checkout
export function PointsRedemption({ 
  availablePoints, 
  cartTotal,
  onRedeem 
}: { 
  availablePoints: number;
  cartTotal: number;
  onRedeem: (points: number) => void;
}) {
  const [pointsToUse, setPointsToUse] = useState(0);
  
  // 100 points = R10
  const maxRedeemable = Math.min(availablePoints, Math.floor(cartTotal / 10));
  const discount = pointsToUse * 10; // cents

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-[#ff6b35]" />
          <span className="font-medium">Use Loyalty Points</span>
        </div>
        <span className="text-sm text-gray-600">{availablePoints} available</span>
      </div>

      <div className="space-y-3">
        <div>
          <input
            type="range"
            min={0}
            max={maxRedeemable}
            step={10}
            value={pointsToUse}
            onChange={(e) => setPointsToUse(parseInt(e.target.value))}
            className="w-full accent-[#ff6b35]"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0 points</span>
            <span>{maxRedeemable} points</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-lg">{pointsToUse}</span>
            <span className="text-sm text-gray-600"> points</span>
          </div>
          <div className="text-right">
            <span className="text-green-600 font-bold">-{formatCurrency(discount)}</span>
            <p className="text-xs text-gray-500">discount</p>
          </div>
        </div>

        <Button 
          onClick={() => onRedeem(pointsToUse)} 
          disabled={pointsToUse === 0}
          className="w-full"
          variant="outline"
        >
          Apply {pointsToUse} Points
        </Button>
      </div>
    </div>
  );
}

// How points work explainer
export function LoyaltyExplainer() {
  return (
    <div className="bg-gradient-to-br from-[#ff6b35] to-orange-600 rounded-2xl p-6 text-white">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Star className="h-7 w-7" />
        Jeffy Rewards
      </h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h3 className="font-bold mb-1">Shop</h3>
          <p className="text-sm text-white/80">Earn 1 point for every R10 you spend</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="font-bold mb-1">Level Up</h3>
          <p className="text-sm text-white/80">Reach higher tiers for more perks</p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="h-6 w-6" />
          </div>
          <h3 className="font-bold mb-1">Redeem</h3>
          <p className="text-sm text-white/80">100 points = R10 off your order</p>
        </div>
      </div>
    </div>
  );
}
