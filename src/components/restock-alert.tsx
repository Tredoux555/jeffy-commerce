'use client';

import { useState } from 'react';
import { Bell, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

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
      setError('Please enter email or phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      
      const { error: insertError } = await supabase
        .from('restock_alerts')
        .insert({
          product_id: productId,
          email: email || null,
          phone: phone || null,
          status: 'pending',
        });

      if (insertError) throw insertError;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div>
          <p className="font-medium text-green-800">You're on the list!</p>
          <p className="text-sm text-green-600">We'll notify you when {productName} is back in stock.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-5 w-5 text-[#ff6b35]" />
        <h3 className="font-medium">Get notified when back in stock</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="flex-1 h-px bg-gray-300" />
          <span>or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>
        <Input
          type="tel"
          placeholder="WhatsApp number (082 123 4567)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Bell className="h-4 w-4 mr-2" />
          )}
          Notify Me
        </Button>
      </form>
    </div>
  );
}
