'use client';

import Link from 'next/link';
import { ShoppingBag, Heart, Gift, ChevronRight, Star, Package } from 'lucide-react';

export default function AccountDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Account</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat icon={ShoppingBag} label="Total Orders" value="0" href="/account/orders" />
        <QuickStat icon={Heart} label="Wishlist Items" value="0" href="/wishlist" />
        <QuickStat icon={Gift} label="Rewards Points" value="0" href="/account/rewards" />
        <QuickStat icon={Star} label="Reviews" value="0" href="/products" />
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-xl border p-8 text-center">
        <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <h2 className="font-bold text-lg mb-2">Account Features Coming Soon</h2>
        <p className="text-gray-500 mb-4">Order history, rewards, and more will be available here.</p>
        <Link href="/products" className="text-orange-500 hover:underline">Continue Shopping →</Link>
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value: string; href: string }) {
  return (
    <Link href={href} className="bg-white rounded-xl border p-4 hover:shadow-md transition">
      <Icon className="h-6 w-6 text-orange-500 mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-gray-500 text-sm">{label}</p>
    </Link>
  );
}
