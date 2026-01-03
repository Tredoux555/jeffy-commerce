'use client';

import { useState } from 'react';
import { MessageCircle, TrendingUp, MapPin, Sparkles, Truck, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function ZonePartnerPage() {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  
  const whatsappNumber = '27681491442';
  
  const openWhatsApp = () => {
    const message = name 
      ? `Hi! I'm ${name}${area ? ` from ${area}` : ''}. I'm interested in becoming a Zone Partner.`
      : `Hi! I'm interested in becoming a Zone Partner.`;
    
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <header className="p-4">
        <Link href="/" className="text-2xl font-bold text-white">Jeffy</Link>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Start for R500
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Start Your Own Business
          </h1>
          <p className="text-gray-400">
            Buy wholesale. Sell retail. Keep the profit.
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-white/5 rounded-2xl p-6 mb-8 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <MapPin className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-medium">Your exclusive zone</p>
              <p className="text-gray-400 text-sm">No competition in your area</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">Buy at wholesale prices</p>
              <p className="text-gray-400 text-sm">Products sourced from China</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium">Keep all the profit</p>
              <p className="text-gray-400 text-sm">You set your prices</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Truck className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Weekly stock delivery</p>
              <p className="text-gray-400 text-sm">7 days to pay - sell first</p>
            </div>
          </div>
        </div>

        {/* Example Profit */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-5 mb-8">
          <p className="text-green-400 text-sm font-medium mb-3">Example:</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>You buy from Jeffy</span>
              <span className="text-white font-medium">R100</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>You sell for</span>
              <span className="text-white font-medium">R199</span>
            </div>
            <div className="border-t border-white/10 my-2"></div>
            <div className="flex justify-between">
              <span className="text-green-400 font-medium">Your profit</span>
              <span className="text-green-400 font-bold text-lg">R99</span>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white/5 rounded-xl p-4 mb-8">
          <p className="text-white font-medium mb-3">To get started:</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Deposit (refundable)</span>
              <span className="text-white font-medium">R500</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>First stock order</span>
              <span className="text-white font-medium">R2,500</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Pay balance within</span>
              <span className="text-white font-medium">7 days</span>
            </div>
          </div>
          <p className="text-gray-500 text-xs mt-3">
            Sell first, pay later. That's trade credit.
          </p>
        </div>

        {/* What You Need */}
        <div className="bg-white/5 rounded-xl p-4 mb-8">
          <p className="text-white font-medium mb-3">What you need:</p>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• R500 to start</li>
            <li>• Vehicle (car, bakkie, or bike)</li>
            <li>• Smartphone with WhatsApp</li>
            <li>• Hustle and community connections</li>
          </ul>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Interested? Let's chat.</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Thabo"
                className="w-full p-4 border border-gray-200 rounded-xl text-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your area</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g., Soweto, Alex, Khayelitsha..."
                className="w-full p-4 border border-gray-200 rounded-xl text-lg"
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={openWhatsApp}
          className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white rounded-2xl p-5 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-xl font-bold">Chat on WhatsApp</span>
        </button>
        
        <p className="text-center text-gray-500 text-sm mt-4">
          No long forms - let's talk business
        </p>

        {/* How it works */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <h3 className="text-white font-bold text-center mb-6">How it works</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              <p className="text-gray-300">Pay R500 deposit, get R2,500 stock</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              <p className="text-gray-300">Sell to your community at your prices</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
              <p className="text-gray-300">Pay balance in 7 days, keep your profit</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
              <p className="text-gray-300">Repeat weekly - grow your business</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Questions? Just ask on WhatsApp 💬
          </p>
        </div>
      </main>
    </div>
  );
}