'use client';

import { ArrowRight, ArrowLeft, Flame, GraduationCap, Users, Crown, Shield, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function WhatIsJeffyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[150px] opacity-20" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[150px] opacity-15" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Back link */}
          <Link href="/coming-soon" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-12 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Main headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            The system wasn&apos;t built for you.
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              So we build a new one.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Jeffy is retail, rebuilt from the ground up. No middlemen. No corporate overhead. 
            <br className="hidden md:block" />
            <span className="text-white font-semibold">Just real people building real businesses in their communities.</span>
          </p>

          {/* Apply CTA - Early */}
          <Link 
            href="/partner/apply"
            className="inline-flex items-center gap-3 mt-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-lg px-8 py-4 rounded-full hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105"
          >
            Apply to Become a Zone Partner <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* You're Not Joining Section */}
      <section className="px-4 py-20 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
        <div className="max-w-4xl mx-auto text-center">
          <Crown className="h-16 w-16 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            You&apos;re not joining a company.
            <br />
            <span className="text-amber-400">You&apos;re becoming a founder.</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Zone Partners don&apos;t work for Jeffy. They <span className="font-bold text-white">ARE</span> Jeffy.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-amber-500/30">
              <Shield className="h-8 w-8 text-amber-400 mx-auto mb-3" />
              <p className="font-semibold">Exclusive territory</p>
              <p className="text-sm text-slate-400 mt-1">No competition. The zone is yours.</p>
            </div>
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-amber-500/30">
              <Users className="h-8 w-8 text-amber-400 mx-auto mb-3" />
              <p className="font-semibold">When Jeffy wins</p>
              <p className="text-sm text-slate-400 mt-1">You win. Your community wins.</p>
            </div>
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-amber-500/30">
              <Flame className="h-8 w-8 text-amber-400 mx-auto mb-3" />
              <p className="font-semibold">Forever</p>
              <p className="text-sm text-slate-400 mt-1">Not a lease. Not a franchise. Yours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The Bigger Picture */}
      <section className="px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-amber-400 font-semibold uppercase tracking-wider mb-4">The bigger picture</p>
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              But this isn&apos;t really about commerce.
            </h2>
          </div>

          <div className="space-y-8 text-lg text-slate-300">
            <p className="text-xl md:text-2xl text-white font-medium">
              Jeffy is the first brick.
            </p>
            <p>
              We&apos;re not building a business. We&apos;re building an empire that fixes what&apos;s broken — 
              starting with commerce because that&apos;s where the power is.
            </p>
            <p>
              Once Jeffy proves the model works — that you can strip away the bloat and still deliver quality — 
              we don&apos;t stop there.
            </p>
          </div>

          {/* Schools Section */}
          <div className="mt-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl p-8 md:p-12 border border-emerald-500/30">
            <GraduationCap className="h-16 w-16 text-emerald-400 mb-6" />
            <h3 className="text-2xl md:text-4xl font-black mb-6 text-emerald-400">
              Schools come next.
            </h3>
            <div className="space-y-4 text-lg text-slate-300">
              <p>
                Not charity schools. Not NGO schools. A new education system built the same way we&apos;re building Jeffy: 
                <span className="text-white font-semibold"> from scratch, without the rot.</span>
              </p>
              <p className="text-xl text-white font-medium">
                Free. Merit-based. No fees, no politics, no bought places.
              </p>
              <p>
                The kind of education that creates leaders, not employees.
              </p>
            </div>
          </div>

          {/* The Path Forward */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              And then?
            </h3>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              God knows we need a new path forward. The current one is broken. 
              There&apos;s no future on the road we&apos;re on.
            </p>
            <p className="text-2xl md:text-3xl font-black text-white">
              Jeffy creates a future.
              <br />
              <span className="text-amber-400">For South Africans. Everywhere it goes.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Zone Partners Section */}
      <section className="px-4 py-24 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-400 font-semibold uppercase tracking-wider mb-4">Zone Partners</p>
          <h2 className="text-3xl md:text-5xl font-black mb-8">
            Aren&apos;t joining a company.
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12">
            They&apos;re securing a seat at the table of something that could reshape this country.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
              <div className="text-4xl mb-4">🗺️</div>
              <p className="font-bold text-lg mb-2">A commerce zone</p>
              <p className="text-slate-400">That&apos;s theirs. Forever.</p>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
              <div className="text-4xl mb-4">🎓</div>
              <p className="font-bold text-lg mb-2">Priority placement</p>
              <p className="text-slate-400">The ONLY path into Jeffy schools.</p>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
              <div className="text-4xl mb-4">👑</div>
              <p className="font-bold text-lg mb-2">Leadership position</p>
              <p className="text-slate-400">In whatever comes next.</p>
            </div>
          </div>

          {/* The Privilege */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 md:p-12 text-left">
            <h3 className="text-2xl md:text-3xl font-black text-black mb-4">
              This is a privilege.
            </h3>
            <p className="text-black/80 text-lg mb-4">
              Zone Partners will be carefully selected. Vetted. Chosen.
            </p>
            <p className="text-black/80 text-lg mb-6">
              Not everyone who applies will be accepted.
            </p>
            <p className="text-xl md:text-2xl font-black text-black">
              But those who are? They&apos;ll be part of the future.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 bg-black">
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles className="h-12 w-12 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-black mb-8">
            Ready to see how it works?
          </h2>
          <Link 
            href="/partner/how-it-works"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-lg px-8 py-4 rounded-full hover:shadow-lg hover:shadow-amber-500/25 transition-all hover:scale-105"
          >
            How It Works <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
