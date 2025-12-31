'use client';

import { ArrowRight, ArrowLeft, MessageSquare, Search, CheckCircle, Package, MapPin, Rocket, Zap } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      number: '01',
      icon: MessageSquare,
      title: 'Wants',
      description: 'Anyone can request a product. If 10 other people say "I want that too" — we source it.',
      highlight: 'The person who requested it first? Gets it free.',
      detail: 'That\'s not marketing. That\'s proof we only stock what people actually want.',
      color: 'amber'
    },
    {
      number: '02',
      icon: Search,
      title: 'Testing',
      description: 'Every single product that hits 10 votes goes through me personally.',
      highlight: 'I test it. I use it. I check quality.',
      detail: 'If it\'s not good enough for my family, it\'s not good enough for Jeffy. No alibaba lottery. No mystery quality. Guaranteed.',
      color: 'emerald'
    },
    {
      number: '03',
      icon: Package,
      title: 'Catalog',
      description: 'Products that pass get added to the catalog.',
      highlight: 'Real demand. Proven quality.',
      detail: 'When we hit critical mass (~100 products), we launch.',
      color: 'blue'
    },
    {
      number: '04',
      icon: MapPin,
      title: 'Zone Partners',
      description: 'While the catalog builds, we\'re collecting Zone Partners.',
      highlight: 'Each zone gets locked. One partner per territory.',
      detail: 'Early applicants get first pick.',
      color: 'purple'
    },
    {
      number: '05',
      icon: Rocket,
      title: 'Launch',
      description: 'Zone Partners order stock of proven products — items people already want.',
      highlight: 'They sell locally. Keep the margin. Build their business.',
      detail: 'The system runs itself.',
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
      amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
      emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-purple-500/20' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' },
    };
    return colors[color] || colors.amber;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <section className="px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500 rounded-full blur-[200px] opacity-10" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Back link */}
          <Link href="/partner" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-12 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            What is Jeffy
          </Link>

          <div className="text-center">
            <p className="text-amber-400 font-semibold uppercase tracking-wider mb-4">Step by step</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6">
              Built backwards.
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                On purpose.
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Most retailers guess what you want, buy it, store it, hope it sells.
              <br /><br />
              <span className="text-white font-semibold">We don&apos;t guess. We ask.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {steps.map((step, index) => {
              const colors = getColorClasses(step.color);
              const Icon = step.icon;
              return (
                <div 
                  key={step.number}
                  className={`relative ${colors.bg} ${colors.border} border rounded-3xl p-8 md:p-10 backdrop-blur transition-all hover:scale-[1.01] hover:shadow-xl ${colors.glow}`}
                >
                  {/* Step number */}
                  <div className={`absolute -top-4 -left-4 w-12 h-12 ${colors.text} bg-slate-900 rounded-full flex items-center justify-center font-black text-xl border-2 ${colors.border}`}>
                    {step.number}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-start gap-6">
                    {/* Icon */}
                    <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-8 w-8 ${colors.text}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-2xl md:text-3xl font-black mb-3">{step.title}</h3>
                      <p className="text-lg text-slate-300 mb-3">{step.description}</p>
                      <p className={`text-xl font-bold ${colors.text} mb-3`}>{step.highlight}</p>
                      <p className="text-slate-400">{step.detail}</p>
                    </div>
                  </div>

                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-slate-600 to-transparent" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 border border-slate-700 text-center">
            <Zap className="h-12 w-12 text-amber-400 mx-auto mb-6" />
            <h2 className="text-2xl md:text-4xl font-black mb-6">
              Simple, right?
            </h2>
            <div className="text-lg text-slate-300 space-y-4 max-w-2xl mx-auto">
              <p>
                People tell us what they want. We find it. We test it. We add it to the catalog.
              </p>
              <p>
                Zone Partners stock what&apos;s proven. Sell what&apos;s demanded.
              </p>
              <p className="text-xl text-white font-semibold">
                No guessing. No waste. No bullshit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 bg-black">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            But why does this actually work?
          </h2>
          <p className="text-slate-400 mb-8">
            The math that breaks traditional retail.
          </p>
          <Link 
            href="/partner/why-it-works"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold text-lg px-8 py-4 rounded-full hover:shadow-lg hover:shadow-amber-500/25 transition-all hover:scale-105"
          >
            Why It Works <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
