'use client';

import { useState } from 'react';
import { Gift, CreditCard, Mail, Check, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const GIFT_CARD_VALUES = [5000, 10000, 25000, 50000, 100000];

interface GiftCardPurchaseProps {
  onPurchase?: (data: any) => void;
}

export function GiftCardPurchase({ onPurchase }: GiftCardPurchaseProps) {
  const [selectedValue, setSelectedValue] = useState(10000);
  const [customValue, setCustomValue] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const finalValue = customValue ? parseInt(customValue) * 100 : selectedValue;

  const handlePurchase = async () => {
    setLoading(true);
    // API call would go here
    await new Promise(r => setTimeout(r, 1000));
    onPurchase?.({
      value: finalValue,
      recipientEmail,
      recipientName,
      senderName,
      message,
    });
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 border border-purple-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-500 rounded-xl">
          <Gift className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Jeffy Gift Card</h2>
          <p className="text-gray-600 text-sm">Give the gift of choice</p>
        </div>
      </div>

      {/* Value Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select Amount</label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {GIFT_CARD_VALUES.map((value) => (
            <button
              key={value}
              onClick={() => { setSelectedValue(value); setCustomValue(''); }}
              className={`py-3 rounded-xl font-bold transition ${
                selectedValue === value && !customValue
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border hover:border-purple-300'
              }`}
            >
              {formatCurrency(value)}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
          <input
            type="number"
            placeholder="Or enter custom amount"
            value={customValue}
            onChange={(e) => { setCustomValue(e.target.value); }}
            className="w-full border rounded-xl pl-8 pr-4 py-3"
            min="50"
            max="10000"
          />
        </div>
      </div>

      {/* Recipient Info */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Recipient's Name</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Recipient's Email *</label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
            placeholder="john@example.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Your Name</label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full border rounded-xl px-4 py-3"
            placeholder="From Jane"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Personal Message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 resize-none"
            rows={3}
            placeholder="Happy Birthday! 🎉"
            maxLength={200}
          />
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 text-white mb-6">
        <div className="flex justify-between items-start mb-4">
          <Gift className="h-8 w-8" />
          <span className="text-2xl font-bold">{formatCurrency(finalValue)}</span>
        </div>
        <p className="text-sm opacity-80">Jeffy Gift Card</p>
        {recipientName && <p className="font-medium mt-2">For: {recipientName}</p>}
        {message && <p className="text-sm opacity-80 mt-1 italic">"{message}"</p>}
      </div>

      <button
        onClick={handlePurchase}
        disabled={!recipientEmail || finalValue < 5000 || loading}
        className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
        Purchase {formatCurrency(finalValue)} Gift Card
      </button>
    </div>
  );
}

// Gift Card Redemption Component
export function GiftCardRedeem({ onRedeem }: { onRedeem?: (code: string, balance: number) => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; balance?: number; error?: string } | null>(null);

  const handleCheck = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/gift-cards/check?code=${code}`);
      const data = await res.json();
      setResult(data);
      if (data.success && data.balance > 0) {
        onRedeem?.(code, data.balance);
      }
    } catch {
      setResult({ success: false, error: 'Failed to check gift card' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-4">
      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
        <Gift className="h-4 w-4 text-purple-500" />
        Have a Gift Card?
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1 border rounded-lg px-3 py-2 font-mono uppercase"
          placeholder="XXXX-XXXX-XXXX"
          maxLength={14}
        />
        <button
          onClick={handleCheck}
          disabled={!code.trim() || loading}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Apply'}
        </button>
      </div>
      {result && (
        <div className={`mt-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.success ? (
            <span className="flex items-center gap-1"><Check className="h-4 w-4" /> {formatCurrency(result.balance!)} applied!</span>
          ) : (
            result.error
          )}
        </div>
      )}
    </div>
  );
}
