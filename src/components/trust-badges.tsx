'use client';

import { Shield, Truck, RefreshCw, CreditCard, Lock, Award } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    { icon: Shield, label: 'Quality Guaranteed', color: 'text-green-600' },
    { icon: Truck, label: 'Fast Delivery', color: 'text-blue-600' },
    { icon: RefreshCw, label: '7-Day Returns', color: 'text-purple-600' },
    { icon: Lock, label: 'Secure Checkout', color: 'text-orange-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {badges.map(({ icon: Icon, label, color }) => (
        <div key={label} className="flex items-center gap-2 text-sm text-gray-600">
          <Icon className={`h-5 w-5 ${color}`} />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function TrustBadgesCompact() {
  return (
    <div className="flex items-center justify-center gap-4 py-3 border-t border-b bg-gray-50">
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <Shield className="h-4 w-4 text-green-600" />
        <span>Quality</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <Truck className="h-4 w-4 text-blue-600" />
        <span>Fast Ship</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <Lock className="h-4 w-4 text-orange-600" />
        <span>Secure</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-600">
        <RefreshCw className="h-4 w-4 text-purple-600" />
        <span>Returns</span>
      </div>
    </div>
  );
}

export function PaymentBadges() {
  return (
    <div className="flex items-center gap-3 text-gray-400">
      <CreditCard className="h-6 w-6" />
      <span className="text-xs">Visa</span>
      <span className="text-xs">Mastercard</span>
      <span className="text-xs">PayFast</span>
      <span className="text-xs">Ozow</span>
    </div>
  );
}
