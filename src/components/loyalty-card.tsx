'use client';

import { useState } from 'react';
import { Gift, Star, TrendingUp, ChevronRight } from 'lucide-react';
import { useLoyaltyStore } from '@/lib/loyalty-store';
import Link from 'next/link';

const TIERS = [
  { name: 'Bronze', min: 0, icon: '🥉', color: '#CD7F32', discount: 0 },
  { name: 'Silver', min: 500, icon: '🥈', color: '#C0C0C0', discount: 5 },
  { name: 'Gold', min: 2000, icon: '🥇', color: '#FFD700', discount: 10 },
  { name: 'Platinum', min: 5000, icon: '💎', color: '#E5E4E2', discount: 15 },
];

interface LoyaltyCardProps {
  variant?: 'compact' | 'full';
  showJoin?: boolean;
}

export function LoyaltyCard({ variant = 'full', showJoin = true }: LoyaltyCardProps) {
  const { points, tier, tierIcon, tierColor } = useLoyaltyStore();
  const currentTierIndex = TIERS.findIndex(t => t.name === tier);
  const nextTier = TIERS[currentTierIndex + 1];
  const pointsToNext = nextTier ? nextTier.min - points : 0;
  const progress = nextTier ? ((points - TIERS[currentTierIndex].min) / (nextTier.min - TIERS[currentTierIndex].min)) * 100 : 100;

  if (variant === 'compact') {
    return (
      <Link href="/account/rewards" className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 rounded-lg hover:shadow-md transition">
        <span className="text-lg">{tierIcon}</span>
        <span className="font-bold text-amber-700">{points.toLocaleString()}</span>
        <span className="text-amber-600 text-sm">pts</span>
      </Link>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border border-amber-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{tierIcon}</span>
            <span className="font-bold text-lg" style={{ color: tierColor }}>{tier} Member</span>
          </div>
          <p className="text-amber-700 text-sm">Earn points on every purchase!</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-amber-800">{points.toLocaleString()}</p>
          <p className="text-amber-600 text-sm">points</p>
        </div>
      </div>

      {nextTier && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-amber-700">Progress to {nextTier.name}</span>
            <span className="text-amber-600">{pointsToNext} pts to go</span>
          </div>
          <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <Gift className="h-5 w-5 mx-auto text-amber-600 mb-1" />
          <p className="text-xs text-amber-700">Earn 1pt/R1</p>
        </div>
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <Star className="h-5 w-5 mx-auto text-amber-600 mb-1" />
          <p className="text-xs text-amber-700">Redeem for discounts</p>
        </div>
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <TrendingUp className="h-5 w-5 mx-auto text-amber-600 mb-1" />
          <p className="text-xs text-amber-700">Level up tiers</p>
        </div>
      </div>

      <Link href="/account/rewards" className="flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition">
        View Rewards <ChevronRight className="h-5 w-5" />
      </Link>
    </div>
  );
}

export function LoyaltyBanner() {
  const { points, tier, tierIcon } = useLoyaltyStore();

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{tierIcon}</span>
          <span className="font-medium">{tier} Member</span>
          <span className="text-amber-100">•</span>
          <span>{points.toLocaleString()} points</span>
        </div>
        <Link href="/account/rewards" className="text-sm underline hover:no-underline">
          View Rewards →
        </Link>
      </div>
    </div>
  );
}

export function PointsEarnPreview({ orderTotal }: { orderTotal: number }) {
  const { multiplier, tier } = useLoyaltyStore();
  const basePoints = Math.floor(orderTotal / 100); // 1 point per R1
  const earnedPoints = Math.floor(basePoints * multiplier);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-amber-600" />
        <span className="text-amber-800">You'll earn</span>
      </div>
      <div className="text-right">
        <span className="font-bold text-amber-700">{earnedPoints} points</span>
        {multiplier > 1 && (
          <span className="text-xs text-amber-600 ml-1">({multiplier}x {tier} bonus!)</span>
        )}
      </div>
    </div>
  );
}
