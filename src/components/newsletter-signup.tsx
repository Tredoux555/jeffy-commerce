'use client';

import { useState } from 'react';
import { Mail, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface NewsletterSignupProps {
  variant?: 'inline' | 'banner' | 'footer';
  source?: string;
}

export function NewsletterSignup({ variant = 'inline', source = 'website' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: email.toLowerCase().trim(), source })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          setSuccess(true); // Already subscribed, treat as success
        } else {
          throw insertError;
        }
      } else {
        setSuccess(true);
      }
      setEmail('');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`flex items-center gap-2 ${variant === 'banner' ? 'justify-center text-white' : 'text-green-600'}`}>
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">You're subscribed! 🎉</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-[#ff6b35] to-orange-500 py-4">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Get 10% off your first order!</span>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-2 rounded-lg w-64 text-gray-900 outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#0f172a] text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Subscribe'}
              </button>
            </div>
          </form>
          {error && <p className="text-center text-white/80 text-sm mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div>
        <h4 className="font-bold mb-4">Stay Updated</h4>
        <p className="text-gray-400 text-sm mb-3">Get deals & new arrivals in your inbox</p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm outline-none focus:border-[#ff6b35]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#ff6b35] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          </button>
        </form>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>
    );
  }

  // Default inline variant
  return (
    <div className="bg-gray-50 rounded-xl p-6 text-center">
      <Mail className="h-10 w-10 text-[#ff6b35] mx-auto mb-3" />
      <h3 className="font-bold text-lg mb-2">Get 10% Off Your First Order</h3>
      <p className="text-gray-600 text-sm mb-4">Subscribe for exclusive deals and new arrivals</p>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-[#ff6b35]"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[#ff6b35] text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Subscribe'}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
