'use client';

import { useState } from 'react';
import { Mail, Loader2, Check, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NewsletterSignupProps {
  variant?: 'default' | 'footer';
  source?: string;
}

export function NewsletterSignup({ variant = 'default', source = 'homepage' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`${variant === 'footer' ? 'p-4' : 'p-6'} bg-green-50 border border-green-200 rounded-xl text-center`}>
        <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
        <p className="font-medium text-green-800">You're subscribed!</p>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400"
          required
        />
        <Button type="submit" disabled={loading} className="bg-[#ff6b35] hover:bg-orange-600 text-white">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
        </Button>
      </form>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#ff6b35] to-orange-500 rounded-xl p-6 text-white">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="h-6 w-6" />
        <h3 className="font-bold text-lg">Get 10% Off Your First Order!</h3>
      </div>
      <p className="text-white/90 text-sm mb-4">
        Subscribe for exclusive deals, new arrivals, and Jeffy Wants updates.
      </p>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white text-gray-900"
          required
        />
        <Button type="submit" disabled={loading} className="bg-white text-[#ff6b35] hover:bg-gray-100">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        </Button>
      </form>
      
      {error && <p className="text-white/80 text-sm mt-2">{error}</p>}
      <p className="text-white/70 text-xs mt-3">No spam, unsubscribe anytime.</p>
    </div>
  );
}
