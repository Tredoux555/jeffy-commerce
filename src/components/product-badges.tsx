'use client';

import { Flame, Sparkles, Clock, Percent } from 'lucide-react';

interface ProductBadgesProps {
  isNew?: boolean;
  isHot?: boolean;
  isLimited?: boolean;
  discountPercent?: number;
  quantity?: number;
}

export function ProductBadges({ isNew, isHot, isLimited, discountPercent, quantity }: ProductBadgesProps) {
  const badges = [];

  // Sale badge (takes priority)
  if (discountPercent && discountPercent > 0) {
    badges.push(
      <span key="sale" className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
        <Percent className="h-3 w-3" />
        -{discountPercent}%
      </span>
    );
  }

  // New badge (within 7 days)
  if (isNew) {
    badges.push(
      <span key="new" className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        NEW
      </span>
    );
  }

  // Hot badge (best seller)
  if (isHot) {
    badges.push(
      <span key="hot" className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
        <Flame className="h-3 w-3" />
        HOT
      </span>
    );
  }

  // Limited badge (low stock)
  if (isLimited || (quantity !== undefined && quantity > 0 && quantity <= 5)) {
    badges.push(
      <span key="limited" className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Only {quantity} left!
      </span>
    );
  }

  if (badges.length === 0) return null;

  return (
    <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
      {badges.slice(0, 2)} {/* Max 2 badges */}
    </div>
  );
}

// Helper to check if product is new (within 7 days)
export function isProductNew(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

// Helper to check if product is hot (sold > 10)
export function isProductHot(totalSold: number): boolean {
  return totalSold >= 10;
}
