'use client';

import { ArrowRight, Package, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-[200px] opacity-15" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[200px] opacity-10" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl font-black tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Jeffy
            </h1>
          </div>

          {/* Tagline */}
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
            Retail is broken.
          </h2>
          <p className="text-xl md:text-2xl text-slate-400 mb-4">
            We&apos;re building something different.
          </p>
          <p className="text-slate-500 mb-16 max-w-xl mx-auto">
            Two ways to be part of it.
          </p>

          {/* Two Paths */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Path 1: Create a Want */}
            <Link href="/wants" className="group">
              <div className="bg-slate-800/50 backdrop-blur rounded-3xl p-8 border border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Create a Want
                </h3>
                <p className="text-slate-400 mb-6">
                  Request any product. Get 10 people to back you. 
                  We source it. You get it <span className="font-bold text-amber-400">free</span>.
                </p>
                <div className="flex items-center justify-center gap-2 text-amber-400 font-semibold group-hover:gap-3 transition-all">
                  Request a Product <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>

            {/* Path 2: Become a Zone Partner */}
            <Link href="/partner" className="group">
              <div className="bg-slate-800/50 backdrop-blur rounded-3xl p-8 border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Become a Zone Partner
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
          <div className="mt-20 flex items-center justify-center gap-3 text-slate-500">
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
