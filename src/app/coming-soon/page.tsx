'use client';

import { ArrowRight, Package, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* SPLASH: This isn't a store */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-[200px] opacity-20" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[200px] opacity-15" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            This isn&apos;t a store.
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
              It&apos;s a movement.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto">
            Jeffy is what happens when you strip away everything that makes retail expensive.
          </p>
        </div>
      </section>

      {/* Two Ways Section */}
      <section className="px-4 py-16 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-slate-500 mb-2">Two ways to be part of it.</p>
          </div>

          {/* Two Paths */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Path 1: Create a Want */}
            <Link href="/wants" className="group">
              <div className="bg-slate-800/50 backdrop-blur rounded-3xl p-8 border border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Make a Wish
                </h3>
                <p className="text-slate-400 mb-6">
                  Add any product to the Wish List. Backers prove demand, we source it —
                  and one wish is granted <span className="font-bold text-amber-400">free</span> every month.
                </p>
                <div className="flex items-center justify-center gap-2 text-amber-400 font-semibold group-hover:gap-3 transition-all">
                  Request a Product <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>

            {/* Path 2: Become a Reseller */}
            <Link href="/distributors/join" className="group">
              <div className="bg-slate-800/50 backdrop-blur rounded-3xl p-8 border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 h-full">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Become a Reseller
                </h3>
                <p className="text-slate-400 mb-6">
                  Own your territory. Build something real. 
                  Limited spots. <span className="font-bold text-emerald-400">Selected applicants only</span>.
                </p>
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold group-hover:gap-3 transition-all">
                  Learn More <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          </div>

          {/* Bottom tag */}
          <div className="mt-16 flex items-center justify-center gap-3 text-slate-500">
            <div className="h-px w-12 bg-slate-700" />
            <Sparkles className="h-4 w-4" />
            <span className="text-sm uppercase tracking-wider">This isn&apos;t for everyone</span>
            <Sparkles className="h-4 w-4" />
            <div className="h-px w-12 bg-slate-700" />
          </div>
        </div>
      </section>
    </div>
  );
}
