'use client';

import { useState } from 'react';
import { Bell, BellRing, Check, Mail, Loader2, X } from 'lucide-react';

interface BackInStockAlertProps {
  productId: string;
  productName: string;
  variant?: string;
  onSuccess?: () => void;
}

export function BackInStockAlert({ productId, productName, variant, onSuccess }: BackInStockAlertProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notifyVia, setNotifyVia] = useState<'email' | 'sms' | 'both'>('email');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/products/notify-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          variant,
          email: notifyVia !== 'sms' ? email : undefined,
          phone: notifyVia !== 'email' ? phone : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to subscribe');

      setSuccess(true);
      onSuccess?.();
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
      >
        <Bell className="h-5 w-5" />
        Notify When Available
      </button>
    );
  }

  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <BellRing className="h-5 w-5 text-[#ff6b35]" />
          Get Notified
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      {success ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <p className="font-medium text-green-600">You're on the list!</p>
          <p className="text-sm text-gray-500 mt-1">We'll notify you when "{productName}" is back in stock.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-sm text-gray-600 mb-4">
            Enter your details and we'll notify you when <strong>{productName}</strong> is back in stock.
          </p>

          {/* Notification method */}
          <div className="flex gap-2 mb-4">
            {(['email', 'sms', 'both'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setNotifyVia(method)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition ${
                  notifyVia === method ? 'bg-[#ff6b35] text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {method === 'both' ? 'Both' : method.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Email input */}
          {(notifyVia === 'email' || notifyVia === 'both') && (
            <div className="mb-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
                  required
                />
              </div>
            </div>
          )}

          {/* Phone input */}
          {(notifyVia === 'sms' || notifyVia === 'both') && (
            <div className="mb-3">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (e.g., 0821234567)"
                className="w-full px-4 py-2.5 border rounded-lg"
                required
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff6b35] text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Subscribing...</>
            ) : (
              <>Notify Me</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

// Compact notify button for product cards
export function NotifyMeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-[#ff6b35] hover:underline flex items-center gap-1"
    >
      <Bell className="h-4 w-4" />
      Notify Me
    </button>
  );
}

// Out of stock badge with notify option
export function OutOfStockBadge({ productId, productName }: { productId: string; productName: string }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-2 mb-2">
        Out of Stock
      </div>
      
      {showForm ? (
        <BackInStockAlert productId={productId} productName={productName} onSuccess={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-[#ff6b35] hover:underline flex items-center gap-1"
        >
          <Bell className="h-4 w-4" />
          Notify when available
        </button>
      )}
    </div>
  );
}
