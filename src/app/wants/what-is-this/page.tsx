'use client';

import { ArrowRight, ArrowLeft, Search, Share2, Users, Gift, CheckCircle, XCircle, Sparkles, MessageCircle, Mail, Zap } from 'lucide-react';
import Link from 'next/link';

export default function WhatIsWantsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <section className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[150px] opacity-20" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px] opacity-20" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Back link */}
          <Link href="/wants" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-12 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Wants
          </Link>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            Can&apos;t find it?
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              Get it sourced.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
            Jeffy sources products from China at factory prices. But we only source what people actually want.
          </p>
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-orange-400 font-semibold uppercase tracking-wider mb-4">How it works</p>
            <h2 className="text-3xl md:text-4xl font-black">Four simple steps</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-800/50 backdrop-blur rounded-3xl p-8 border border-slate-700 relative overflow-hidden group hover:border-orange-500/50 transition-colors">
              <div className="absolute top-4 right-4 text-6xl font-black text-slate-700/50">1</div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4">
                  <Search className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Request</h3>
                <p className="text-slate-400">See something online you wish was cheaper? Request it on Jeffy. Takes 10 seconds.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/50 backdrop-blur rounded-3xl p-8 border border-slate-700 relative overflow-hidden group hover:border-orange-500/50 transition-colors">
              <div className="absolute top-4 right-4 text-6xl font-black text-slate-700/50">2</div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4">
                  <Share2 className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Share</h3>
                <p className="text-slate-400">Get a personal link. Share it with friends, family, your WhatsApp group.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/50 backdrop-blur rounded-3xl p-8 border border-slate-700 relative overflow-hidden group hover:border-orange-500/50 transition-colors">
              <div className="absolute top-4 right-4 text-6xl font-black text-slate-700/50">3</div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Verify</h3>
                <p className="text-slate-400">When 10 people verify they&apos;d buy it too, Jeffy knows it&apos;s worth sourcing.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-800/50 backdrop-blur rounded-3xl p-8 border border-slate-700 relative overflow-hidden group hover:border-orange-500/50 transition-colors">
              <div className="absolute top-4 right-4 text-6xl font-black text-slate-700/50">4</div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-4">
                  <Gift className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">You Win</h3>
                <p className="text-slate-400">Jeffy sources the product. Everyone can buy it. And YOU — the first requester — get yours <span className="text-green-400 font-bold">FREE</span>.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why 10 Verifications */}
      <section className="px-4 py-20 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Mail className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Why 10 verifications?
            </h2>
            <p className="text-2xl text-orange-400 font-bold">Real demand. Real products.</p>
          </div>

          <div className="space-y-6 text-lg text-slate-300 max-w-2xl mx-auto">
            <p>
              Anyone can click a button. But <span className="text-white font-semibold">10 people entering their email to verify?</span> That&apos;s real interest.
            </p>
            <p>
              We don&apos;t want to source products that sit in a warehouse. We source what South Africans <span className="text-white font-semibold">actually want to buy.</span>
            </p>
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-orange-500/30">
              <p className="text-white font-medium text-center">
                Your friends verifying = proof there&apos;s a market = Jeffy negotiates better prices = <span className="text-orange-400">everyone wins</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Free Product */}
      <section className="px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl p-8 md:p-12 border border-purple-500/30">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-purple-400">
                First requester gets it FREE
              </h2>
            </div>
            
            <div className="space-y-4 text-lg text-slate-300">
              <p>
                Why? Because <span className="text-white font-semibold">you did the work.</span>
              </p>
              <p>
                You found the product. You rallied 10 people. You proved the demand.
              </p>
              <p className="text-xl text-white font-bold">
                That&apos;s worth something. So your first one&apos;s on us.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Not Just Voting - Comparison */}
      <section className="px-4 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Zap className="h-12 w-12 text-orange-400 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              This isn&apos;t a popularity contest.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Other Sites */}
            <div className="bg-slate-800/30 rounded-3xl p-8 border border-red-500/30">
              <div className="flex items-center gap-3 mb-6">
                <XCircle className="h-8 w-8 text-red-400" />
                <h3 className="text-xl font-bold text-red-400">Other sites</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 shrink-0" />
                  <span className="text-slate-400">Click to vote</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 shrink-0" />
                  <span className="text-slate-400">Unlimited votes per person</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 shrink-0" />
                  <span className="text-slate-400">Numbers mean nothing</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 shrink-0" />
                  <span className="text-slate-400">&quot;Maybe someday&quot;</span>
                </li>
              </ul>
            </div>

            {/* Jeffy Wants */}
            <div className="bg-slate-800/50 rounded-3xl p-8 border border-green-500/30">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <h3 className="text-xl font-bold text-green-400">Jeffy Wants</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0" />
                  <span className="text-white font-medium">Verify with email or phone</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0" />
                  <span className="text-white font-medium">One person, one verification</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0" />
                  <span className="text-white font-medium">10 real people = we source it</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0" />
                  <span className="text-white font-medium">Commitment to action</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Methods */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-orange-400 font-semibold uppercase tracking-wider mb-4">How friends verify</p>
          <h2 className="text-3xl md:text-4xl font-black mb-12">Two ways to prove they&apos;re real</h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <Mail className="h-10 w-10 text-blue-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Email</h3>
              <p className="text-slate-400 text-sm">Click verification link sent to their inbox</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <MessageCircle className="h-10 w-10 text-green-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">SMS</h3>
              <p className="text-slate-400 text-sm">Enter 6-digit code sent to their phone</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24 bg-black">
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles className="h-12 w-12 text-orange-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to request something?
          </h2>
          <p className="text-xl text-slate-400 mb-8">
            Find a product you want, request it, and rally your people.
          </p>
          <Link 
            href="/wants"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 text-black font-bold text-lg px-8 py-4 rounded-full hover:shadow-lg hover:shadow-orange-500/25 transition-all hover:scale-105"
          >
            Request a Product <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
