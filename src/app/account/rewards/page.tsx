'use client';

import Link from 'next/link';
import { Gift, ArrowLeft } from 'lucide-react';

export default function RewardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/account" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold">My Rewards</h1>
      </div>

      <div className="bg-white rounded-xl border p-8 text-center">
        <Gift className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <h2 className="font-bold text-lg mb-2">Rewards Coming Soon</h2>
        <p className="text-gray-500 mb-4">Earn points on every purchase and redeem for discounts!</p>
        <Link href="/products" className="text-orange-500 hover:underline">Start Shopping →</Link>
      </div>
    </div>
  );
}
