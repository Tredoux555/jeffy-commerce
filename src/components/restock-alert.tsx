'use client';

import { useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RestockAlertProps {
  productId: string;
  productName: string;
}

export function RestockAlert({ productId, productName }: RestockAlertProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) {
      setError('Please enter email or phone');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/products/restock-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email, phone }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setError('Failed to subscribe. Try again.');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <div className="bg-green-500 p-2 rounded-full">
          <Check className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-medium text-green-800">You're on the list!</p>
          <p className="text-sm text-green-600">We'll notify you when {productName} is back in stock.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-5 w-5 text-orange-500" />
        <p className="font-medium text-orange-800">Notify me when available</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white"
        />
        <div className="text-center text-sm text-gray-500">or</div>
        <Input
          type="tel"
          placeholder="WhatsApp number (082...)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="bg-white"
        />
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
          Notify Me
        </Button>
      </form>
    </div>
  );
}
