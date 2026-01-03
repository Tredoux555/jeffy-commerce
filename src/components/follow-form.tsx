'use client';

import { useState } from 'react';
import { Loader2, Check, Bell, Phone } from 'lucide-react';

interface FollowFormProps {
  source?: string;
  interests?: string[];
  title?: string;
  subtitle?: string;
  buttonText?: string;
  variant?: 'default' | 'minimal' | 'dark';
}

export function FollowForm({ 
  source = 'website',
  interests = ['general'],
  title = 'Stay Connected',
  subtitle = 'Get updates on new products and opportunities',
  buttonText = 'Follow',
  variant = 'default'
}: FollowFormProps) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/followers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          name: name.trim() || null,
          source,
          interests
        })
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setPhone('');
        setName('');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`rounded-xl p-6 text-center ${
        variant === 'dark' 
          ? 'bg-green-500/20 border border-green-500/30' 
          : 'bg-green-50 border border-green-200'
      }`}>
        <Check className={`h-12 w-12 mx-auto mb-3 ${
          variant === 'dark' ? 'text-green-400' : 'text-green-500'
        }`} />
        <p className={`font-semibold ${
          variant === 'dark' ? 'text-green-400' : 'text-green-800'
        }`}>
          You're in! 🎉
        </p>
        <p className={`text-sm mt-1 ${
          variant === 'dark' ? 'text-green-400/70' : 'text-green-600'
        }`}>
          We'll WhatsApp you with updates
        </p>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Your phone number"
          className="flex-1 px-4 py-2 border rounded-lg text-sm"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-jeffy-orange text-white rounded-lg font-medium hover:bg-jeffy-orange/90 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : buttonText}
        </button>
      </form>
    );
  }

  if (variant === 'dark') {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Bell className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-400">{subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number (e.g. 073 843 9496)"
            className="w-full px-4 py-3 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
            required
          />
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-500 text-black font-bold rounded-lg hover:bg-green-400 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Phone className="h-5 w-5" />
                {buttonText}
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // Default variant
  return (
    <div className="bg-white border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-orange-100 rounded-lg">
          <Bell className="h-5 w-5 text-jeffy-orange" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full px-4 py-3 border rounded-lg focus:border-jeffy-orange focus:outline-none"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number (e.g. 073 843 9496)"
          className="w-full px-4 py-3 border rounded-lg focus:border-jeffy-orange focus:outline-none"
          required
        />
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-jeffy-orange text-white font-bold rounded-lg hover:bg-jeffy-orange/90 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Bell className="h-5 w-5" />
              {buttonText}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
