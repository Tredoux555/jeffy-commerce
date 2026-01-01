'use client';

import { ArrowRight, MapPin, GraduationCap, Crown, Zap } from 'lucide-react';
import Link from 'next/link';

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero - Straight to the point */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[150px] opacity-20" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[150px] opacity-15" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Own your zone.
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Build your future.
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Zone Partners aren&apos;t employees. They&apos;re founders who own exclusive delivery territories 
            and share in everything we build together.
          </p>

          {/* Key Benefits - Clean, positive */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-2xl mx-auto">
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
              <MapPin className="h-6 w-6 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-medium">Your Territory</p>
              <p className="text-xs text-slate-400">Forever</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
              <Zap className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-medium">50/50 Split</p>
              <p className="text-xs text-slate-400">On profits</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
              <Crown className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-medium">Founder Status</p>
              <p className="text-xs text-slate-400">First 50</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700">
              <GraduationCap className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-medium">School Priority</p>
              <p className="text-xs text-slate-400">For family</p>
            </div>
          </div>

          {/* CTA */}
          <Link 
            href="/partner/apply"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-lg px-8 py-4 rounded-full hover:shadow-lg hover:shadow-amber-500/25 transition-all hover:scale-105"
          >
            Apply Now <ArrowRight className="h-5 w-5" />
          </Link>
          
          <p className="mt-4 text-sm text-slate-500">
            Not everyone gets accepted. We choose partners carefully.
          </p>
        </div>
      </section>

      {/* The Vision - Brief */}
      <section className="px-4 py-20 bg-slate-800/30">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber-400 font-semibold uppercase tracking-wider mb-4 text-sm">The bigger picture</p>
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            Commerce funds the mission.
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            Jeffy isn&apos;t just retail. The profits fund free, merit-based schools. 
            Zone Partners get priority placement for their families. 
            We&apos;re building something that lasts.
          </p>
          <div className="flex items-center justify-center gap-3 text-slate-400">
            <span className="text-2xl">🛒</span>
            <ArrowRight className="h-4 w-4" />
            <span className="text-2xl">💰</span>
            <ArrowRight className="h-4 w-4" />
            <span className="text-2xl">🎓</span>
            <ArrowRight className="h-4 w-4" />
            <span className="text-2xl">🌍</span>
          </div>
          <p className="text-sm text-slate-500 mt-3">Commerce → Profits → Schools → Communities</p>
        </div>
      </section>

      {/* What You Get */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">What Zone Partners Get</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-6 border border-amber-500/20">
              <h3 className="text-xl font-bold text-amber-400 mb-3">Exclusive Territory</h3>
              <p className="text-slate-300">
                Your zone is yours. No other partners can operate there. 
                Not rented, not leased — owned.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-6 border border-emerald-500/20">
              <h3 className="text-xl font-bold text-emerald-400 mb-3">50/50 Profit Share</h3>
              <p className="text-slate-300">
                Half of every delivery profit goes to you. 
                First 10 partners get 55/45 for the first 6 months.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
              <h3 className="text-xl font-bold text-purple-400 mb-3">Founding Partner Status</h3>
              <p className="text-slate-300">
                First 50 partners shape how Jeffy grows. 
                Direct input on decisions. Your voice matters.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
              <h3 className="text-xl font-bold text-blue-400 mb-3">School Priority</h3>
              <p className="text-slate-300">
                When we build Jeffy schools, Zone Partner families 
                get priority placement. The only guaranteed path in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 bg-gradient-to-t from-black to-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready?
          </h2>
          <p className="text-slate-400 mb-8">
            Applications are reviewed personally. Not everyone gets in.
          </p>
          <Link 
            href="/partner/apply"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-lg px-10 py-4 rounded-full hover:shadow-lg hover:shadow-amber-500/25 transition-all hover:scale-105"
          >
            Apply to Become a Zone Partner <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
