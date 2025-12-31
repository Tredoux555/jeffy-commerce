'use client';

import { useState } from 'react';
import { ArrowLeft, Check, Loader2, MapPin, Shield, Award, GraduationCap } from 'lucide-react';
import Link from 'next/link';

const ZONES = [
  { id: 'jhb-north', name: 'Johannesburg North', region: 'Gauteng' },
  { id: 'jhb-south', name: 'Johannesburg South', region: 'Gauteng' },
  { id: 'sandton', name: 'Sandton', region: 'Gauteng' },
  { id: 'soweto', name: 'Soweto', region: 'Gauteng' },
  { id: 'pretoria', name: 'Pretoria', region: 'Gauteng' },
  { id: 'east-rand', name: 'East Rand', region: 'Gauteng' },
  { id: 'west-rand', name: 'West Rand', region: 'Gauteng' },
  { id: 'cpt-cbd', name: 'Cape Town CBD', region: 'Western Cape' },
  { id: 'cape-flats', name: 'Cape Flats', region: 'Western Cape' },
  { id: 'cpt-northern', name: 'Northern Suburbs', region: 'Western Cape' },
  { id: 'winelands', name: 'Winelands', region: 'Western Cape' },
  { id: 'dbn-central', name: 'Durban Central', region: 'KwaZulu-Natal' },
  { id: 'dbn-north', name: 'Durban North', region: 'KwaZulu-Natal' },
  { id: 'pmb', name: 'Pietermaritzburg', region: 'KwaZulu-Natal' },
  { id: 'pe', name: 'Port Elizabeth', region: 'Eastern Cape' },
  { id: 'bloem', name: 'Bloemfontein', region: 'Free State' },
  { id: 'polokwane', name: 'Polokwane', region: 'Limpopo' },
];

// Group zones by region
const groupedZones = ZONES.reduce((acc, zone) => {
  if (!acc[zone.region]) acc[zone.region] = [];
  acc[zone.region].push(zone);
  return acc;
}, {} as Record<string, typeof ZONES>);

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    zone: '',
    why: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/zone-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          zone_id: formData.zone,
          message: formData.why
        })
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4">
            Application Received
          </h1>
          <p className="text-slate-300 text-lg mb-8">
            We&apos;ll review your application carefully. If you&apos;re selected, 
            we&apos;ll be in touch soon.
          </p>
          <p className="text-slate-400 mb-8">
            Not everyone will be accepted. Zone Partners are chosen, not just registered.
          </p>
          <Link 
            href="/coming-soon"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <section className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Link href="/partner/why-it-works" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Why It Works
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-black mb-4">
              Apply to Become a
              <br />
              <span className="text-emerald-400">Zone Partner</span>
            </h1>
            <p className="text-slate-400">
              Applications are reviewed carefully. Not everyone will be selected.
            </p>
          </div>
        </div>
      </section>

      {/* What You're Applying For */}
      <section className="px-4 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-700">
              <MapPin className="h-6 w-6 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-semibold">Exclusive Zone</p>
              <p className="text-xs text-slate-400">Forever yours</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-700">
              <GraduationCap className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold">School Priority</p>
              <p className="text-xs text-slate-400">For your family</p>
            </div>
            <div className="bg-slate-800/50 rounded-2xl p-4 text-center border border-slate-700">
              <Award className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm font-semibold">Founder Status</p>
              <p className="text-xs text-slate-400">Pioneer badge</p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="px-4 pb-20">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                placeholder="Your full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                placeholder="+27..."
                required
              />
            </div>

            {/* Zone Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2">Preferred Zone</label>
              <select
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                required
              >
                <option value="">Select a zone...</option>
                {Object.entries(groupedZones).map(([region, zones]) => (
                  <optgroup key={region} label={region}>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">
                Zones are first-come, first-served. Early applicants get first pick.
              </p>
            </div>

            {/* Why */}
            <div>
              <label className="block text-sm font-semibold mb-2">Why do you want to be a Zone Partner?</label>
              <textarea
                value={formData.why}
                onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all min-h-[120px] resize-none"
                placeholder="Tell us about yourself and why you want to be part of Jeffy..."
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Submit Application
                </>
              )}
            </button>

            <p className="text-center text-sm text-slate-500">
              By applying, you acknowledge that Zone Partners are selected, not just registered.
              We&apos;ll contact you if your application is successful.
            </p>
          </form>
        </div>
      </section>
    </div>
  );
}
