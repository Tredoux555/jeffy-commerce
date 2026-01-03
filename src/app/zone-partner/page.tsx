'use client';

import { useState } from 'react';
import { MessageCircle, TrendingUp, Package, Users, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ZonePartnerPage() {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  
  // Your WhatsApp number (with country code, no +)
  const whatsappNumber = '27681491442'; // Update this to your number
  
  const openWhatsApp = () => {
    // Personal, casual intro message
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
            50/50 Profit Share
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Sell Jeffy in Your Area
          </h1>
          <p className="text-gray-400">
            No stock needed. No upfront costs. Just customers.
          </p>
        </div>

        {/* Benefits - Simple */}
        <div className="bg-white/5 rounded-2xl p-6 mb-8 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-medium">50% of every sale</p>
              <p className="text-gray-400 text-sm">You sell, we split</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-medium">We handle everything</p>
              <p className="text-gray-400 text-sm">Stock, shipping, support</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Your network = your income</p>
              <p className="text-gray-400 text-sm">WhatsApp groups, stokvels, community</p>
            </div>
          </div>
        </div>

        {/* Simple Form - Just name and area */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Quick intro</h2>
          
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

        {/* THE BUTTON - WhatsApp */}
        <button
          onClick={openWhatsApp}
          className="w-full bg-[#25D366] hover:bg-[#1fb855] text-white rounded-2xl p-5 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="text-xl font-bold">Chat on WhatsApp</span>
        </button>
        
        <p className="text-center text-gray-500 text-sm mt-4">
          Let's talk - no long forms, no hassle
        </p>

        {/* Trust */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-3">Already partnered with sellers in</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {['Soweto', 'Alex', 'Tembisa', 'Khayelitsha'].map((place) => (
              <span key={place} className="bg-white/10 text-gray-300 px-3 py-1 rounded-full text-sm">
                {place}
              </span>
            ))}
          </div>
        </div>

        {/* How it works - Minimal */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <h3 className="text-white font-bold text-center mb-6">How it works</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              <p className="text-gray-300">Chat with us on WhatsApp</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              <p className="text-gray-300">Get your unique Zone Partner link</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
              <p className="text-gray-300">Share products, earn 50%</p>
            </div>
          </div>
        </div>

        {/* FAQ teaser */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Questions? Just ask on WhatsApp - we reply fast 💬
          </p>
        </div>
      </main>
    </div>
  );
}