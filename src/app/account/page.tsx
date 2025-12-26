'use client';

import Link from 'next/link';
import { ShoppingBag, Heart, Gift, Clock, Package, ChevronRight, Star } from 'lucide-react';
import { LoyaltyCard } from '@/components/loyalty-card';
import { formatCurrency } from '@/lib/utils';

// Mock data - would come from API
const mockOrders = [
  { id: '1', number: 'JEF-001234', date: '2024-12-24', status: 'delivered', total: 45900 },
  { id: '2', number: 'JEF-001189', date: '2024-12-20', status: 'shipped', total: 12500 },
];

const mockWishlist = [
  { id: '1', name: 'Wireless Earbuds Pro', price: 29900, image: '' },
  { id: '2', name: 'Smart Watch Series 5', price: 89900, image: '' },
];

export default function AccountDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Account</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat icon={ShoppingBag} label="Total Orders" value="12" href="/account/orders" />
        <QuickStat icon={Heart} label="Wishlist Items" value="5" href="/account/wishlist" />
        <QuickStat icon={Gift} label="Rewards Points" value="850" href="/account/rewards" />
        <QuickStat icon={Star} label="Reviews" value="3" href="/account/reviews" />
      </div>

      {/* Loyalty Card */}
      <LoyaltyCard />

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold">Recent Orders</h2>
          <Link href="/account/orders" className="text-[#ff6b35] text-sm hover:underline flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        {mockOrders.length > 0 ? (
          <div className="divide-y">
            {mockOrders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium">{order.number}</p>
                    <p className="text-sm text-gray-500">{order.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(order.total)}</p>
                  <StatusBadge status={order.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No orders yet</p>
            <Link href="/products" className="text-[#ff6b35] hover:underline mt-2 inline-block">Start shopping →</Link>
          </div>
        )}
      </div>

      {/* Wishlist Preview */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold">Wishlist</h2>
          <Link href="/account/wishlist" className="text-[#ff6b35] text-sm hover:underline flex items-center gap-1">
            View All <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        
        {mockWishlist.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 p-4">
            {mockWishlist.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">📦</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-[#ff6b35] font-bold">{formatCurrency(item.price)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Your wishlist is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickStat({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href: string }) {
  return (
    <Link href={href} className="bg-white rounded-xl border p-4 hover:shadow-md transition">
      <Icon className="h-6 w-6 text-[#ff6b35] mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-gray-500 text-sm">{label}</p>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
