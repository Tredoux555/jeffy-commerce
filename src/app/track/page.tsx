'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TrackPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = orderNumber.trim().toUpperCase();
    
    if (!trimmed) {
      setError('Please enter an order number');
      return;
    }

    if (!trimmed.startsWith('JEF-')) {
      setError('Order numbers start with JEF-');
      return;
    }

    router.push(`/track/${trimmed}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="font-bold">Track Your Order</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-8 w-8 text-orange-600" />
          </div>
          
          <h2 className="text-xl font-bold text-center mb-2">Enter Order Number</h2>
          <p className="text-gray-600 text-center text-sm mb-6">
            Find your order number in your confirmation email or SMS
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="JEF-20251224-XXXX"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="text-center text-lg font-mono uppercase"
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500"
            >
              <Search className="h-4 w-4 mr-2" />
              Track Order
            </Button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            Order numbers are case-insensitive
          </p>
        </div>
      </div>
    </div>
  );
}







