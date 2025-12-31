'use client';

import { ArrowRight, ArrowLeft, Search, Share2, Users, FlaskConical, Gift, Zap, ShieldCheck, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function WhatIsWantsPage() {
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Request',
      description: 'See something online you wish was cheaper? A TikTok product? Something your friend has?',
      highlight: 'Request it on Jeffy. Takes 10 seconds.',
      detail: 'You get a personal share link the moment you submit.',
      color: 'amber'
    },
    {
      number: '02',
      icon: Share2,
      title: 'Share',
      description: 'Share your link with friends, family, your WhatsApp group.',
      highlight: 'Rally your people.',
      detail: 'Every person who clicks your link and verifies counts toward your 10.',
      color: 'orange'
    },
    {
      number: '03',
      icon: Users,
      title: 'Verify',
      description: 'When 10 real people verify they\'d buy it too, we know it\'s worth sourcing.',
      highlight: 'Not clicks. Verified emails or phone numbers.',
      detail: 'This proves real demand — not internet noise.',
      color: 'blue'
    },
    {
      number: '04',
      icon: FlaskConical,
      title: 'We Test',
      description: 'I personally order 3 variations from different suppliers.',
      highlight: 'Test quality. Check durability. Use it myself.',
      detail: 'If it\'s not good enough for my family, it doesn\'t make the cut. Only the best ships to you.',
      color: 'cyan'
    },
    {
      number: '05',
      icon: Gift,
      title: 'You Win',
      description: 'Quality-tested product gets added to Jeffy. Everyone can buy it.',
      highlight: 'And YOU — the first requester — get yours FREE.',
      detail: 'You did the work. You proved the demand. That\'s worth something.',
      color: 'green'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
      amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
      orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' },
      blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' },
      cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20' },
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
            <p className="text-orange-400 font-semibold uppercase tracking-wider mb-4">How Wants Work</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6">
              Can&apos;t find it?
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                Get it sourced.
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              This isn&apos;t dropshipping. We don&apos;t forward orders to China and hope for the best.
              <br /><br />
              <span className="text-white font-semibold">We test everything personally. You get quality.</span>
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

      {/* Not Dropshipping Comparison */}
      <section className="px-4 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <ShieldCheck className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              This isn&apos;t dropshipping.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Dropshipping */}
            <div className="bg-slate-800/30 rounded-3xl p-8 border border-red-500/30">
              <div className="flex items-center gap-3 mb-6">
                <XCircle className="h-8 w-8 text-red-400" />
                <h3 className="text-xl font-bold text-red-400">Typical Dropshipping</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 shrink-0" />
                  <span className="text-slate-400">Order forwarded directly to China</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 shrink-0" />
                  <span className="text-slate-400">No quality control</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 shrink-0" />
                  <span className="text-slate-400">Mystery box — hope it&apos;s good</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 shrink-0" />
                  <span className="text-slate-400">Cheap knockoffs common</span>
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
                  <span className="text-white font-medium">3 samples personally tested</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0" />
                  <span className="text-white font-medium">Only best quality ships</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0" />
                  <span className="text-white font-medium">You know exactly what you&apos;re getting</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0" />
                  <span className="text-white font-medium">Real person stands behind it</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 md:p-12 border border-slate-700 text-center">
            <Zap className="h-12 w-12 text-orange-400 mx-auto mb-6" />
            <h2 className="text-2xl md:text-4xl font-black mb-6">
              Why 10 verifications?
            </h2>
            <div className="text-lg text-slate-300 space-y-4 max-w-2xl mx-auto">
              <p>
                Testing 3 product variations costs money. Shipping samples takes time.
              </p>
              <p>
                We only make that investment for products with <span className="text-orange-400 font-semibold">proven demand.</span>
              </p>
              <p className="text-xl text-white font-semibold">
                10 verified people = real interest = we invest in quality.
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
