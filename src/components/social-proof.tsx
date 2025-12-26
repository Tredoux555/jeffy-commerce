'use client';

import { useEffect, useState } from 'react';
import { Eye, ShoppingCart, Users } from 'lucide-react';

interface SocialProofProps {
  productId: string;
  totalSold?: number;
}

export function SocialProof({ productId, totalSold }: SocialProofProps) {
  const [viewingNow, setViewingNow] = useState(0);

  useEffect(() => {
    // Simulate realistic viewing numbers (3-15 people)
    const baseViewers = Math.floor(Math.random() * 8) + 3;
    setViewingNow(baseViewers);

    // Fluctuate slightly every 30 seconds
    const interval = setInterval(() => {
      setViewingNow(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = prev + change;
        return Math.max(2, Math.min(20, newValue));
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [productId]);

  return (
    <div className="flex flex-wrap gap-3 text-sm">
      {/* Viewing now */}
      <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
        <Eye className="h-4 w-4" />
        <span className="font-medium">{viewingNow} viewing now</span>
      </div>

      {/* Total sold */}
      {totalSold && totalSold > 0 && (
        <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
          <ShoppingCart className="h-4 w-4" />
          <span className="font-medium">{totalSold} sold</span>
        </div>
      )}
    </div>
  );
}
