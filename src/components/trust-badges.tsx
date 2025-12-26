'use client';

import { Shield, Truck, RefreshCcw, CreditCard, Lock, Award } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    { icon: Shield, label: 'Secure Checkout', sublabel: '256-bit SSL' },
    { icon: Truck, label: 'Free Delivery', sublabel: 'Orders R500+' },
    { icon: RefreshCcw, label: '30-Day Returns', sublabel: 'Easy refunds' },
    { icon: CreditCard, label: 'Safe Payment', sublabel: 'PayFast secured' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {badges.map((badge) => (
        <div key={badge.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <badge.icon className="h-6 w-6 text-[#ff6b35]" />
          <div>
            <p className="text-sm font-medium">{badge.label}</p>
            <p className="text-xs text-gray-500">{badge.sublabel}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Compact version for product pages
export function ProductGuarantees() {
  const guarantees = [
    { icon: Shield, text: 'Quality Guaranteed' },
    { icon: Truck, text: 'Fast Nationwide Delivery' },
    { icon: RefreshCcw, text: '30-Day Easy Returns' },
    { icon: Lock, text: 'Secure Payment' },
  ];

  return (
    <div className="flex flex-wrap gap-4 py-4 border-t border-b">
      {guarantees.map((g) => (
        <div key={g.text} className="flex items-center gap-2 text-sm text-gray-600">
          <g.icon className="h-4 w-4 text-green-600" />
          <span>{g.text}</span>
        </div>
      ))}
    </div>
  );
}

// Checkout trust indicators
export function CheckoutTrust() {
  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Lock className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-medium text-sm">Secure Checkout</p>
          <p className="text-xs text-gray-500">Your information is protected</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Award className="h-5 w-5 text-blue-600" />
        <div>
          <p className="font-medium text-sm">Buyer Protection</p>
          <p className="text-xs text-gray-500">Full refund if item not received</p>
        </div>
      </div>
      <div className="pt-2 border-t">
        <p className="text-xs text-gray-400 text-center">
          Payments secured by PayFast
        </p>
      </div>
    </div>
  );
}
