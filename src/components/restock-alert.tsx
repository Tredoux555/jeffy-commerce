'use client';

import { useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
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
      setError('Please enter email or phone');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      
      const { error: dbError } = await supabase
        .from('restock_alerts')
        .insert({
          product_id: productId,
          email: email || null,
          phone: phone || null,
          status: 'pending',
        });

      if (dbError) throw dbError;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to set alert');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <Check className="h-5 w-5 text-green-500" />
        <p className="text-green-700 text-sm">We'll notify you when it's back!</p>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-5 w-5 text-orange-500" />
        <p className="font-medium text-gray-900">Notify me when available</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full"
        />
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>or</span>
        </div>
        <Input
          type="tel"
          placeholder="WhatsApp number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full"
        />
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Bell className="h-4 w-4 mr-2" />
              Notify Me
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
