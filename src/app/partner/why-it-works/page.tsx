'use client';

import { ArrowRight, ArrowLeft, X, Check, Shield, Award, Lock, GraduationCap, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function WhyItWorksPage() {
  const noPayFor = [
    { item: 'Head office', detail: 'No CEO salary, no board, no corporate politics' },
    { item: 'Warehouse rent', detail: 'Stock goes directly to Zone Partners' },
    { item: 'Employees', detail: 'Partners are owners, not workers' },
    { item: 'Delivery fleet', detail: 'Partners handle their own zones' },
    { item: 'Advertising budget', detail: 'Influencers share because they believe' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <section className="px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[200px] opacity-10" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Back link */}
          <Link href="/partner/how-it-works" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-12 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            How It Works
          </Link>

          <div className="text-center">
            <p className="text-amber-400 font-semibold uppercase tracking-wider mb-4">The economics</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6">
              The math that
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                breaks retail.
              </span>
            </h1>
          </div>
        </div>
      </section>

      {/* The Layers Problem */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Traditional retail has layers.</h2>
            <p className="text-slate-400 text-lg">Each layer takes a cut.</p>
          </div>

          {/* Traditional Chain */}
          <div className="bg-red-500/10 rounded-3xl p-8 border border-red-500/30 mb-8">
            <p className="text-red-400 font-semibold uppercase tracking-wider text-sm mb-6 text-center">Traditional retail chain</p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-center">
              {['Manufacturer', '→', 'Exporter', '→', 'Importer', '→', 'Distributor', '→', 'Retailer', '→', 'You'].map((item, i) => (
                <span key={i} className={item === '→' ? 'text-slate-600' : 'bg-slate-800 px-4 py-2 rounded-lg text-sm'}>
                  {item}
                </span>
              ))}
            </div>
            <p className="text-center mt-6 text-slate-400">
              By the time a <span className="text-white font-bold">R50 product</span> reaches you, it&apos;s <span className="text-red-400 font-bold">R500</span>.
            </p>
          </div>

          {/* Jeffy Chain */}
          <div className="bg-emerald-500/10 rounded-3xl p-8 border border-emerald-500/30">
            <p className="text-emerald-400 font-semibold uppercase tracking-wider text-sm mb-6 text-center">Jeffy</p>
            <div className="flex items-center justify-center gap-3 text-center">
              {['Source', '→', 'Zone Partner', '→', 'You'].map((item, i) => (
                <span key={i} className={item === '→' ? 'text-slate-600' : 'bg-emerald-500/20 border border-emerald-500/30 px-6 py-3 rounded-lg font-semibold'}>
                  {item}
                </span>
              ))}
            </div>
            <p className="text-center mt-6 text-emerald-400 font-bold text-lg">
              Two steps. That&apos;s it.
            </p>
          </div>
        </div>
      </section>

      {/* What We Don't Pay For */}
      <section className="px-4 py-20 bg-slate-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">What we don&apos;t pay for:</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {noPayFor.map((item, i) => (
              <div key={i} className="bg-slate-900/80 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <X className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{item.item}</p>
                    <p className="text-slate-400 text-sm mt-1">{item.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What This Means */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <TrendingUp className="h-16 w-16 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            What this means:
          </h2>
          <p className="text-2xl md:text-3xl text-emerald-400 font-bold mb-8">
            Prices that can&apos;t be matched.
          </p>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            A shop in Soweto selling the same quality as Sandton — 
            <span className="text-white font-semibold"> at prices Sandton can&apos;t touch.</span>
          </p>
        </div>
      </section>

      {/* Can't Compete */}
      <section className="px-4 py-20 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              You can&apos;t compete with this.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 rounded-2xl p-8 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Check className="h-6 w-6 text-emerald-400" />
                <h3 className="text-xl font-bold">Retailers can&apos;t match</h3>
              </div>
              <p className="text-slate-400">
                Zone Partners don&apos;t compete with retailers. Retailers can&apos;t afford to match them.
              </p>
            </div>
            <div className="bg-slate-900/80 rounded-2xl p-8 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="h-6 w-6 text-amber-400" />
                <h3 className="text-xl font-bold">No internal competition</h3>
              </div>
              <p className="text-slate-400">
                Zone Partners don&apos;t compete with each other. Each territory is exclusive.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl p-8 md:p-12 border border-amber-500/30 text-center">
            <h3 className="text-2xl md:text-3xl font-black mb-4">
              You own the zone.
            </h3>
            <p className="text-xl text-slate-300">
              Not a lease. Not a franchise agreement. <span className="text-amber-400 font-bold">The zone.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Quality & Demand Guarantee */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-emerald-500/10 rounded-3xl p-8 border border-emerald-500/30">
              <Award className="h-12 w-12 text-emerald-400 mb-4" />
              <h3 className="text-2xl font-black mb-4 text-emerald-400">Quality Guaranteed</h3>
              <p className="text-slate-300">
                I personally test every single product. If it&apos;s not good enough for my family, 
                it doesn&apos;t make the catalog. No exceptions.
              </p>
            </div>
            <div className="bg-blue-500/10 rounded-3xl p-8 border border-blue-500/30">
              <Check className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-2xl font-black mb-4 text-blue-400">Demand Guaranteed</h3>
              <p className="text-slate-300">
                Every product has 10 people who already said they want it. 
                You&apos;re not guessing. You&apos;re fulfilling proven demand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* This Might Replace Retail */}
      <section className="px-4 py-24 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <Sparkles className="h-12 w-12 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            This might replace retail
            <br />
            <span className="text-amber-400">as we know it.</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            No rent. No staff. No overheads. Just demand-proven products at source prices.
          </p>
          <p className="text-2xl font-bold text-white mb-12">
            The people building this with us now?
            <br />
            <span className="text-amber-400">Pioneers.</span>
          </p>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            In five years, everyone will wish they&apos;d been here at the start.
          </p>
        </div>
      </section>

      {/* The Real Reason */}
      <section className="px-4 py-24 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl p-8 md:p-12 border border-emerald-500/30">
            <GraduationCap className="h-16 w-16 text-emerald-400 mb-6" />
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              The real reason this matters.
            </h2>
            <div className="space-y-4 text-lg text-slate-300">
              <p>The profits fund schools.</p>
              <p className="text-xl text-white font-semibold">
                Free education. Merit-based. No bought places.
              </p>
              <p>
                Zone Partners — founders — get <span className="text-emerald-400 font-bold">priority for their families.</span>
              </p>
              <p>
                Everyone else earns their place.
              </p>
              <p className="text-2xl text-emerald-400 font-black mt-8">
                This is the only way in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 bg-gradient-to-b from-black to-slate-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            Ready to apply?
          </h2>
          <p className="text-slate-400 mb-8">
            Zone Partners are carefully selected. Not everyone will be accepted.
          </p>
          <Link 
            href="/partner/apply"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg px-8 py-4 rounded-full hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-105"
          >
            Apply to Become a Zone Partner <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
