'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, MapPin, Phone, User, CheckCircle, ArrowRight, Loader2, Store, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'Beauty & Skincare',
  'Hair Care',
  'Fashion & Accessories',
  'Electronics',
  'Home & Living',
  'Health & Wellness',
  'Baby & Kids',
  'Sports & Outdoors',
];

export default function SupplierRegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    location_name: '',
    categories: [] as string[],
    bio: '',
  });

  const handleCategoryToggle = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/suppliers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          whatsapp: formData.whatsapp || formData.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-black" />
          </div>
          <h1 className="text-3xl font-black mb-4">You're In! 🎉</h1>
          <p className="text-gray-400 mb-6">
            We've received your registration. We'll review it and activate your profile within 24 hours.
            You'll get a WhatsApp message when you're live!
          </p>
          <div className="space-y-3">
            <Link
              href="/hustle/kit"
              className="block bg-green-500 text-black font-bold py-3 px-6 rounded-xl hover:bg-green-400 transition"
            >
              Browse Products to Stock
            </Link>
            <Link
              href="/hustle"
              className="block text-green-500 hover:text-green-400 transition"
            >
              ← Back to Spaza Project
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black border-b border-green-500/30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/hustle" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-black" />
            </div>
            <div>
              <span className="text-xl font-black text-green-500">SPAZA</span>
              <span className="text-xl font-light text-white ml-1">PROJECT</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm mb-4 border border-green-500/30">
              <Store className="h-4 w-4" />
              Supplier Registration
            </div>
            <h1 className="text-4xl font-black mb-4">
              List Your <span className="text-green-500">Business</span>
            </h1>
            <p className="text-gray-400 text-lg">
              Get customers from Jeffy. They find you, contact you on WhatsApp, buy from you. Simple.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: Sparkles, text: 'Free Listing' },
              { icon: Phone, text: 'Direct Contact' },
              { icon: MapPin, text: 'Local Customers' },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                <item.icon className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <span className="text-sm text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Info */}
            <div className={step === 1 ? 'block' : 'hidden'}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-green-500" />
                About You
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Thabo Mokoena"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 0731234567"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-2">WhatsApp Number (if different)</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="Leave blank if same as phone"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.phone}
                className="w-full mt-6 bg-green-500 text-black font-bold py-3 px-6 rounded-xl hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Next: Location
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Step 2: Location */}
            <div className={step === 2 ? 'block' : 'hidden'}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                Your Location
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Where are you based? *</label>
                  <input
                    type="text"
                    required
                    value={formData.location_name}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                    placeholder="e.g. Soweto, Diepkloof or Khayelitsha, Site C"
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Township/area name - this is how customers will find you</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-700 text-gray-300 font-bold py-3 px-6 rounded-xl hover:bg-gray-800 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.location_name}
                  className="flex-1 bg-green-500 text-black font-bold py-3 px-6 rounded-xl hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Next
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Step 3: Categories */}
            <div className={step === 3 ? 'block' : 'hidden'}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Store className="h-5 w-5 text-green-500" />
                What Do You Sell?
              </h2>
              
              <p className="text-gray-400 text-sm mb-4">Select all categories you stock (at least one)</p>
              
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryToggle(cat)}
                    className={`p-3 rounded-xl border text-left transition ${
                      formData.categories.includes(cat)
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <span className="text-sm">{cat}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm text-gray-400 mb-2">Short bio (optional)</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="e.g. I sell quality beauty products in Diepkloof. Cash or EFT accepted."
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition resize-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-700 text-gray-300 font-bold py-3 px-6 rounded-xl hover:bg-gray-800 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={formData.categories.length === 0 || loading}
                  className="flex-1 bg-green-500 text-black font-bold py-3 px-6 rounded-xl hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Complete Registration
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          </form>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full transition ${
                  s === step ? 'bg-green-500' : s < step ? 'bg-green-500/50' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
