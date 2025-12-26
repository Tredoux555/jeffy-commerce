'use client';

import { useState } from 'react';
import { Bell, Loader2, CheckCircle, Mail } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface NotifyStockProps {
  productId: string;
  productName: string;
}

export function NotifyWhenInStock({ productId, productName }: NotifyStockProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase
        .from('stock_notifications')
        .insert({
          product_id: productId,
          email: email.toLowerCase().trim(),
        });

      if (insertError) {
        if (insertError.code === '23505') {
          setSuccess(true); // Already subscribed
        } else {
          throw insertError;
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
        <div>
          <p className="font-medium text-green-800">You're on the list!</p>
          <p className="text-sm text-green-600">We'll email you when this item is back in stock.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
          <Bell className="h-5 w-5 text-orange-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-orange-800 mb-1">Out of Stock</p>
          <p className="text-sm text-orange-600 mb-3">
            Want to know when it's back? Leave your email and we'll notify you.
          </p>

          {showForm ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#ff6b35] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Notify Me'}
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="bg-white border border-orange-300 text-orange-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-50 transition"
            >
              Notify When Available
            </button>
          )}

          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
