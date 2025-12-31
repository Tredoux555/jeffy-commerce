'use client';

import { ArrowRight, Package, MapPin, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Background effects - same as homepage */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-gray-950 to-gray-950" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm mb-8">
            <Sparkles className="h-4 w-4" />
            South Africa&apos;s First Community-Powered Commerce
          </div>

          {/* Logo */}
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="text-orange-500">JEFFY</span>
          </h1>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Retail is broken.
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-2">
            You know it. We know it.
          </p>
          <p className="text-lg text-orange-400 mb-12">
            We&apos;re fixing it. Two ways to join us.
          </p>

          {/* Two Paths */}
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16">
            {/* Path 1: Create a Want */}
            <Link href="/wants" className="group">
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 h-full">
                <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Package className="h-7 w-7 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Create a Want
                </h3>
                <p className="text-gray-400 mb-6">
                  Tell us what you want. Get 10 people to back you. 
                  We source it. <span className="font-bold text-orange-500">You get it free.</span>
                </p>
                <div className="flex items-center justify-center gap-2 text-orange-500 font-semibold group-hover:gap-3 transition-all">
                  Start a Want <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>

            {/* Path 2: Become a Zone Partner */}
            <Link href="/partner" className="group">
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 h-full">
                <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="h-7 w-7 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  Become a Zone Partner
                </h3>
                <p className="text-gray-400 mb-6">
                  Own your territory. Keep 50% of every sale. 
                  <span className="font-bold text-orange-500"> Limited zones. Selected applicants.</span>
                </p>
                <div className="flex items-center justify-center gap-2 text-orange-500 font-semibold group-hover:gap-3 transition-all">
                  Learn More <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </Link>
          </div>

          {/* Bottom message */}
          <p className="text-gray-500 text-sm">
            Not another online store. <span className="text-orange-400">A new way to do commerce.</span>
          </p>
        </div>
      </section>
    </div>
  );
}
