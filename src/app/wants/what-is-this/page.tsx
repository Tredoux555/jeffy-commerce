'use client';

import { ArrowRight, ArrowLeft, MessageSquare, Search, CheckCircle, Package, MapPin, Rocket, Zap, FlaskConical, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function WhatIsWantsPage() {
  const steps = [
    {
      number: '01',
      icon: MessageSquare,
      title: 'Wants',
      description: 'See something you want? A TikTok product? Something a friend has? Request it. If 10 other people verify they\'d buy it too — we source it.',
      highlight: 'The person who requested it first? Gets it FREE.',
      detail: 'That\'s not marketing. That\'s proof we only stock what people actually want.',
      color: 'amber'
    },
    {
      number: '02',
      icon: FlaskConical,
      title: 'Testing',
      description: 'Every single product that hits 10 verifications goes through me personally.',
      highlight: 'I order 3 samples. Test them. Use them. Check quality.',
      detail: 'If it\'s not good enough for my family, it\'s not good enough for Jeffy. No alibaba lottery. No mystery quality. Guaranteed.',
      color: 'cyan'
    },
    {
      number: '03',
      icon: Package,
      title: 'Catalog',
      description: 'Products that pass get added to the Jeffy catalog.',
      highlight: 'Real demand. Proven quality. Factory prices.',
      detail: 'No guessing what might sell. Every product earned its place.',
      color: 'blue'
    },
    {
      number: '04',
      icon: MapPin,
      title: 'Zone Partners',
      description: 'Products ship through our network of Zone Partners — local entrepreneurs who deliver in their area.',
      highlight: 'Faster delivery. Local accountability. Real people.',
      detail: 'Interested in running your own zone? Each territory is exclusive — one partner only.',
      color: 'purple',
      link: { href: '/partner', text: 'See Zone Partner opportunities →' }
    },
    {
      number: '05',
      icon: RefreshCw,
      title: 'The Loop',
      description: 'You request. We test. Quality ships. You\'re happy. You request more.',
      highlight: 'This is commerce that actually works.',
      detail: 'No middlemen inflating prices. No corporate overhead. Just quality products at prices that make sense for South Africans.',
      color: 'green'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
      amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
      cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20' },
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' },
      purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-purple-500/20' },
      green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', glow: 'shadow-green-500/20' },
    };
    return colors[color] || colors.amber;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <section className="px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500 rounded-full blur-[200px] opacity-10" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500 rounded-full blur-[200px] opacity-10" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Back link */}
          <Link href="/wants" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-12 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Wants
          </Link>

          <div className="text-center">
            <p className="text-orange-400 font-semibold uppercase tracking-wider mb-4">How it works</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6">
              Can&apos;t find it?
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                Get it sourced.
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              This isn&apos;t another dropshipping site. We don&apos;t guess what you want and hope it sells.
              <br /><br />
              <span className="text-white font-semibold">We ask. You tell us. We deliver quality.</span>
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
                      {step.link && (
                        <Link 
                          href={step.link.href}
                          className={`inline-flex items-center gap-2 mt-4 ${colors.text} hover:underline font-medium`}
                        >
                          {step.link.text}
                        </Link>
                      )}
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
            <Zap className="h-12 w-12 text-orange-400 mx-auto mb-6" />
            <h2 className="text-2xl md:text-4xl font-black mb-6">
              Simple, right?
            </h2>
            <div className="text-lg text-slate-300 space-y-4 max-w-2xl mx-auto">
              <p>
                People tell us what they want. We find it. We test it. Quality ships.
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
            Ready to request something?
          </h2>
          <p className="text-slate-400 mb-8">
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
