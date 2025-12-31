'use client';

import { ArrowRight, Package, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-amber-200 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-30" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="mb-6">
            <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tight">
              Jeffy
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-4 font-medium">
            The future of retail starts here.
          </p>
          
          <p className="text-gray-500 mb-12 max-w-xl mx-auto">
            We&apos;re building something that could change everything. 
            Choose your path.
          </p>

          {/* Two Paths */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Path 1: Create a Want */}
            <Link href="/wants" className="group">
              <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-transparent hover:border-amber-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Create a Want
                </h2>
                <p className="text-gray-600 mb-6">
                  Request any product. Get 10 people to agree. 
                  If we source it, you get it <span className="font-bold text-amber-600">free</span>.
                </p>
                <div className="flex items-center justify-center gap-2 text-amber-600 font-semibold group-hover:gap-3 transition-all">
                  Start a Want <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>

            {/* Path 2: Become a Zone Partner */}
            <Link href="/partner" className="group">
              <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-transparent hover:border-emerald-400 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Become a Zone Partner
                </h2>
                <p className="text-gray-600 mb-6">
                  Own your territory. Build your future. 
                  Be part of something <span className="font-bold text-emerald-600">bigger</span>.
                </p>
                <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold group-hover:gap-3 transition-all">
                  Learn More <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          </div>

          {/* Subtle hint */}
          <div className="mt-16 flex items-center justify-center gap-2 text-gray-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Not just commerce. A movement.</span>
            <Sparkles className="h-4 w-4" />
          </div>
        </div>
      </section>
    </div>
  );
}
