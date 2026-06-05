'use client';

import { ArrowRight, ArrowLeft, Sparkles, Users, Share2, CheckCircle, Gift, MapPin, Zap, Heart } from 'lucide-react';
import Link from 'next/link';

export default function WhatIsWantsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[150px] opacity-20" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px] opacity-15" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Back link */}
          <Link href="/wants" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-12 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Wants
          </Link>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-sm font-medium mb-8">
            <Heart className="h-4 w-4" />
            Your role to play
          </div>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            You&apos;re not a customer.
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              You&apos;re a co-creator.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            We&apos;re reverse engineering retail. Building a system that actually works for South Africans.
            <br /><br />
            <span className="text-white font-semibold">And we need your help to do it.</span>
          </p>
        </div>
      </section>

      {/* Your Role Section */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-3xl p-8 md:p-12 border border-orange-500/20">
            <Sparkles className="h-12 w-12 text-orange-400 mb-6" />
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              You help us build the catalogue.
            </h2>
            <div className="space-y-4 text-lg md:text-xl text-slate-300">
              <p>
                Not what some buyer in Johannesburg <span className="italic text-slate-400">thinks</span> you want.
              </p>
              <p className="text-white font-semibold text-2xl">
                What <span className="text-orange-400">you</span> want.
              </p>
            </div>
            
            {/* The reward */}
            <div className="mt-10 pt-10 border-t border-slate-700">
              <p className="text-slate-400 text-lg mb-3">Every week.</p>
              <p className="text-3xl md:text-4xl font-black text-white">
                We draw winners at random and <span className="text-green-400">grant their wish free.</span>
              </p>
              <p className="text-xl text-slate-400 mt-2">
                No purchase. No catch. Every wish you add is one entry into the weekly draw.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-orange-400 font-semibold uppercase tracking-wider mb-4">All you need to do</p>
            <h2 className="text-3xl md:text-4xl font-black">
              Tell us what you want.
            </h2>
            <p className="text-xl text-slate-400 mt-4">We do the rest.</p>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex items-start gap-6 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center font-black text-black shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Make your wish</h3>
                <p className="text-slate-400">Write down what you&apos;ve always wanted — up to ten things at a time. No purchase, no catch, ten seconds.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-6 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center font-black text-black shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">We draw winners every week</h3>
                <p className="text-slate-400">Completely at random. Every wish you add is one entry — nothing to share, no one to convince.</p>
              </div>
            </div>

            {/* Step 3 - The Payoff */}
            <div className="flex items-start gap-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center font-black text-black shrink-0">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1 text-green-400">We grant it free — and celebrate you.</h3>
                <p className="text-slate-300">We source your wish and deliver it to your door, free. Every winner is announced on the radio, in the paper, and across social media.</p>
              </div>
            </div>
          </div>

          {/* Why we ask */}
          <div className="mt-8 text-center">
            <p className="text-slate-500">
              Every wish also tells us what to stock — so the shop fills up with what people actually want.
            </p>
          </div>
        </div>
      </section>

      {/* For Your Friends */}
      <section className="px-4 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              And your friends?
            </h2>
          </div>

          <div className="bg-slate-800/50 rounded-3xl p-8 md:p-10 border border-slate-700">
            <div className="space-y-6 text-lg text-slate-300">
              <p>
                They can make their <span className="text-white font-semibold">own wishes</span> too — up to ten each, every one another entry in the weekly draw.
              </p>
              <p>
                The more people tell us what they want, the better the shop gets — and the more wishes we grant free.
              </p>
              <div className="pt-6 border-t border-slate-700">
                <p className="text-xl text-white font-semibold">
                  Everyone can play. The catalogue grows. Prices drop.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zone Partner Bonus */}
      <section className="px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl p-8 md:p-12 border border-purple-500/30 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/30 rounded-full text-purple-300 text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Bonus for early believers
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black mb-6">
                Want more than a wish?
              </h2>
              
              <div className="space-y-4 text-lg text-slate-300 mb-8">
                <p>
                  <span className="text-white font-bold">Become a Reseller.</span> Secure your territory. Build something real.
                </p>
                <p>
                  This isn&apos;t just about saving money.
                </p>
                <p className="text-2xl text-white font-black">
                  This could change your life. <span className="text-purple-400">Your destiny.</span>
                </p>
              </div>
              
              <Link 
                href="/distributors/join"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-lg px-8 py-4 rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all hover:scale-105"
              >
                <MapPin className="h-5 w-5" />
                Become a Reseller
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final Splash - The Movement */}
      <section className="px-4 py-32 bg-black relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500 rounded-full blur-[200px] opacity-10" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6">
            This isn&apos;t a store.
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              It&apos;s a movement.
            </span>
          </h2>
          
          <p className="text-2xl text-slate-300 mb-12">
            And you&apos;re part of it now.
          </p>
          
          <Link 
            href="/wants"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-xl px-10 py-5 rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all hover:scale-105"
          >
            Request Your First Product <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
