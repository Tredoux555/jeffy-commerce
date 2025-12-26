'use client';

import { useState } from 'react';
import { Mail, Loader2, Check, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function NewsletterSignup() {
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
      const supabase = createClient();
      
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, source: 'footer' });

      if (insertError) {
        if (insertError.code === '23505') {
          setError('You\'re already subscribed!');
        } else {
          throw insertError;
        }
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-3 text-green-400">
        <Check className="h-5 w-5" />
        <span>Thanks for subscribing! Check your inbox for 10% off.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
        <Gift className="h-4 w-4 text-[#ff6b35]" />
        <span>Get 10% off your first order</span>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="px-6">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
        </Button>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </form>
  );
}

// Popup version
export function NewsletterPopup({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const supabase = createClient();
    
    await supabase.from('newsletter_subscribers').insert({ email, source: 'popup' });
    
    setSuccess(true);
    setLoading(false);
    
    // Close after success
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#ff6b35] to-orange-500 p-6 text-white text-center">
          <div className="text-4xl mb-2">🎁</div>
          <h2 className="text-2xl font-bold">Get 10% Off!</h2>
          <p className="text-white/90 mt-1">Subscribe to our newsletter</p>
        </div>
        
        <div className="p-6">
          {success ? (
            <div className="text-center py-4">
              <Check className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="font-semibold">You're subscribed!</p>
              <p className="text-sm text-gray-500">Check your email for your discount code.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                required
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Get My 10% Off
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                No thanks, I'll pay full price
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
