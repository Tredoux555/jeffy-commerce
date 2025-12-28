'use client';

import { useState } from 'react';
import { Bell, TrendingDown, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface PriceDropAlertProps {
  productId: string;
  productName: string;
  currentPrice: number;
}

export function PriceDropAlert({ productId, productName, currentPrice }: PriceDropAlertProps) {
  const [email, setEmail] = useState('');
  const [targetPrice, setTargetPrice] = useState(Math.floor(currentPrice * 0.8)); // Default 20% lower
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      
      const { error: insertError } = await supabase
        .from('price_alerts')
        .insert({
          product_id: productId,
          email,
          target_price_cents: targetPrice,
          current_price_cents: currentPrice,
          status: 'active'
        });

      if (insertError) throw insertError;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#ff6b35] transition"
      >
        <TrendingDown className="h-4 w-4" />
        Get price drop alerts
      </button>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <Check className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-medium text-green-800">Alert set!</p>
          <p className="text-sm text-green-600">We'll email you when the price drops below R{(targetPrice / 100).toFixed(2)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[#ff6b35]" />
          <h3 className="font-medium">Price Drop Alert</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm text-gray-600 block mb-1">Alert me when price drops below:</label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">R</span>
            <input
              type="number"
              value={(targetPrice / 100).toFixed(0)}
              onChange={(e) => setTargetPrice(parseInt(e.target.value) * 100)}
              min={1}
              max={currentPrice / 100}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Current price: R{(currentPrice / 100).toFixed(2)}
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Email address:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
          Set Alert
        </Button>
      </form>
    </div>
  );
}

// Price history display
export function PriceHistory({ history }: { history: Array<{ date: string; price: number }> }) {
  if (history.length < 2) return null;

  const lowestPrice = Math.min(...history.map(h => h.price));
  const highestPrice = Math.max(...history.map(h => h.price));
  const currentPrice = history[history.length - 1].price;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-medium text-sm mb-3">Price History (30 days)</h4>
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>Lowest: R{(lowestPrice / 100).toFixed(2)}</span>
        <span>Highest: R{(highestPrice / 100).toFixed(2)}</span>
      </div>
      
      {/* Simple bar chart */}
      <div className="flex items-end gap-1 h-20">
        {history.slice(-14).map((point, i) => {
          const height = ((point.price - lowestPrice) / (highestPrice - lowestPrice || 1)) * 100;
          const isLatest = i === history.slice(-14).length - 1;
          return (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all ${isLatest ? 'bg-[#ff6b35]' : 'bg-gray-300'}`}
              style={{ height: `${Math.max(10, height)}%` }}
              title={`R${(point.price / 100).toFixed(2)} on ${point.date}`}
            />
          );
        })}
      </div>
      
      {currentPrice <= lowestPrice && (
        <p className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1">
          <TrendingDown className="h-4 w-4" />
          Current price is the lowest in 30 days!
        </p>
      )}
    </div>
  );
}
