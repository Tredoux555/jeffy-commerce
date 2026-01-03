'use client';

import { Package, Truck, Banknote, CheckCircle, AlertTriangle, ShoppingBag } from 'lucide-react';

export default function ZonePartnerExplainer() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          How Jeffy Zone Partners Works
        </h1>
        <p className="text-gray-600">Read this before you sign. It's simple.</p>
      </div>

      {/* The Deal - Big and Clear */}
      <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl p-6 text-white mb-8">
        <h2 className="text-xl font-bold mb-4">The Deal</h2>
        <div className="space-y-3 text-lg">
          <p>✓ You buy stock from us at wholesale prices</p>
          <p>✓ You sell to customers at retail prices</p>
          <p>✓ You keep ALL the profit</p>
          <p>✓ Start with just R500 deposit</p>
        </div>
      </div>

      {/* This is YOUR Business */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5 mb-8">
        <h2 className="text-lg font-bold text-blue-900 mb-3">This is YOUR Business</h2>
        <p className="text-blue-800 mb-3">
          You're not working for Jeffy. You're buying from Jeffy and selling to your customers.
        </p>
        <p className="text-blue-800">
          Like buying from Makro and selling in your community - except we deliver to you weekly and you get an exclusive zone.
        </p>
      </div>

      {/* How It Works */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-orange-500" />
          How Stock Works
        </h2>
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                🏪
              </div>
              <p className="font-medium">Jeffy</p>
              <p className="text-xs text-gray-500">Wholesale</p>
            </div>
            <div className="text-gray-400 text-2xl">→</div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                📦
              </div>
              <p className="font-medium">You</p>
              <p className="text-xs text-gray-500">Buy & Own</p>
            </div>
            <div className="text-gray-400 text-2xl">→</div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                😊
              </div>
              <p className="font-medium">Customer</p>
              <p className="text-xs text-gray-500">Retail Price</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4 text-center">
            You buy it → You own it → You sell it → You keep the profit
          </p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-green-500" />
          Getting Started
        </h2>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-green-200">
              <span className="text-gray-700">Deposit (refundable)</span>
              <span className="font-bold text-gray-900">R500</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-green-200">
              <span className="text-gray-700">First stock order</span>
              <span className="font-bold text-gray-900">R2,500</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-green-200">
              <span className="text-gray-700">You pay now</span>
              <span className="font-bold text-green-600">R500</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-700">Balance due in 7 days</span>
              <span className="font-bold text-orange-600">R2,000</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4 text-center">
            We give you 7 days to sell before you pay the balance.
          </p>
        </div>
      </div>

      {/* Money Example */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Banknote className="h-5 w-5 text-green-500" />
          Your Profit (Example)
        </h2>
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-green-200">
              <span className="text-gray-700">You buy from Jeffy</span>
              <span className="font-bold text-gray-900">R100</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-green-200">
              <span className="text-gray-700">You sell for</span>
              <span className="font-bold text-gray-900">R199</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-green-700 font-medium text-lg">Your profit</span>
              <span className="font-bold text-green-600 text-xl">R99</span>
            </div>
          </div>
          <p className="text-green-800 text-sm mt-4 text-center font-medium">
            You set your prices. You keep everything above your cost.
          </p>
        </div>
      </div>

      {/* Weekly Cycle */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">The Weekly Cycle</h2>
        <div className="space-y-3">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Monday: Stock arrives</p>
              <p className="text-sm text-gray-600">We deliver your weekly stock</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Mon-Sun: You sell</p>
              <p className="text-sm text-gray-600">Deliver to customers, collect cash</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Sunday: Pay Jeffy</p>
              <p className="text-sm text-gray-600">EFT your wholesale cost for the week</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">4</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Monday: Repeat</p>
              <p className="text-sm text-gray-600">New stock arrives automatically</p>
            </div>
          </div>
        </div>
      </div>

      {/* What You Need */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5 text-blue-500" />
          What You Need
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">💰</p>
            <p className="text-sm font-medium">R500</p>
            <p className="text-xs text-gray-500">Deposit to start</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">🚗</p>
            <p className="text-sm font-medium">Vehicle</p>
            <p className="text-xs text-gray-500">Car, bakkie, or bike</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">📱</p>
            <p className="text-sm font-medium">Smartphone</p>
            <p className="text-xs text-gray-500">With WhatsApp</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">💪</p>
            <p className="text-sm font-medium">Hustle</p>
            <p className="text-xs text-gray-500">Your community</p>
          </div>
        </div>
      </div>

      {/* What You're Agreeing To */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          What You're Agreeing To
        </h2>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <p className="text-gray-700">
              <strong>You're buying stock</strong> - it's yours when you receive it
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <p className="text-gray-700">
              <strong>You pay within 7 days</strong> - that's your trade credit
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <p className="text-gray-700">
              <strong>You handle your own tax</strong> - declare your profits to SARS
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-green-600 text-sm">✓</span>
            </div>
            <p className="text-gray-700">
              <strong>You take the risk</strong> - if stock doesn't sell, that's business
            </p>
          </div>
        </div>
      </div>

      {/* What Jeffy Provides */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">What Jeffy Provides</h2>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-orange-600 text-sm">✓</span>
            </div>
            <p className="text-gray-700">
              <strong>Exclusive zone</strong> - no other partners in your area
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-orange-600 text-sm">✓</span>
            </div>
            <p className="text-gray-700">
              <strong>Weekly delivery</strong> - stock comes to you automatically
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-orange-600 text-sm">✓</span>
            </div>
            <p className="text-gray-700">
              <strong>Trade credit</strong> - 7 days to pay after receiving stock
            </p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-orange-600 text-sm">✓</span>
            </div>
            <p className="text-gray-700">
              <strong>WhatsApp support</strong> - help when you need it
            </p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-8">
        <div className="flex gap-3">
          <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-yellow-800 mb-2">Understand This</p>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• You MUST pay Jeffy within 7 days - no excuses</li>
              <li>• If you don't pay, we stop sending stock</li>
              <li>• Outstanding debts may go to collections</li>
              <li>• Unsold stock is YOUR problem, not ours</li>
              <li>• Vehicle, fuel, phone are YOUR expenses</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Simple Summary */}
      <div className="bg-gray-900 text-white rounded-2xl p-6 text-center">
        <h2 className="text-xl font-bold mb-4">In Simple Terms</h2>
        <p className="text-lg leading-relaxed">
          We sell to you wholesale.<br />
          You sell to customers retail.<br />
          You keep the difference.<br />
          <span className="text-orange-400 font-bold">That's your business.</span>
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-500 text-sm mt-6">
        Questions? WhatsApp us before you sign.
      </p>
    </div>
  );
}