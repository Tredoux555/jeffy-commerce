'use client';

import { useState } from 'react';
import { Gift, CreditCard, Copy, Check, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface GiftCardPurchaseProps {
  amounts?: number[];
  onPurchase?: (amount: number, recipientEmail: string, message: string) => Promise<void>;
}

const defaultAmounts = [10000, 25000, 50000, 100000, 25000]; // In cents

export function GiftCardPurchase({ amounts = defaultAmounts, onPurchase }: GiftCardPurchaseProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState('');

  const finalAmount = selectedAmount || (customAmount ? parseInt(customAmount) * 100 : 0);

  const handlePurchase = async () => {
    if (!finalAmount || !recipientEmail) return;
    
    setLoading(true);
    try {
      if (onPurchase) {
        await onPurchase(finalAmount, recipientEmail, message);
      } else {
        // Generate gift card code
        const code = 'JEF-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const supabase = createClient();
        await supabase.from('gift_cards').insert({
          code,
          amount_cents: finalAmount,
          balance_cents: finalAmount,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          sender_name: senderName,
          message,
          status: 'active'
        });
        
        setGiftCardCode(code);
      }
      setSuccess(true);
    } catch (e) {
      console.error('Gift card purchase failed:', e);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold mb-2">Gift Card Sent! 🎉</h3>
        <p className="text-gray-600 mb-4">
          We've sent a {formatCurrency(finalAmount)} gift card to {recipientEmail}
        </p>
        {giftCardCode && (
          <div className="bg-gray-100 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-600 mb-1">Gift Card Code:</p>
            <p className="font-mono text-xl font-bold">{giftCardCode}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Amount Selection */}
      <div>
        <label className="block font-medium mb-2">Select Amount</label>
        <div className="grid grid-cols-3 gap-3">
          {amounts.map((amount) => (
            <button
              key={amount}
              onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
              className={`p-3 border-2 rounded-lg text-center transition ${
                selectedAmount === amount 
                  ? 'border-[#ff6b35] bg-orange-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="font-bold">{formatCurrency(amount)}</span>
            </button>
          ))}
        </div>
        
        <div className="mt-3">
          <label className="text-sm text-gray-600">Or enter custom amount:</label>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-500">R</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
              placeholder="0.00"
              min="50"
              max="5000"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
            />
          </div>
        </div>
      </div>

      {/* Recipient Info */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Recipient's Email *</label>
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="friend@email.com"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Recipient's Name</label>
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Their name"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Your Name</label>
          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Personal Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a personal message..."
            rows={3}
            maxLength={200}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] resize-none"
          />
        </div>
      </div>

      {/* Purchase Button */}
      <Button
        onClick={handlePurchase}
        disabled={loading || !finalAmount || !recipientEmail}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        Send Gift Card {finalAmount ? `(${formatCurrency(finalAmount)})` : ''}
      </Button>
    </div>
  );
}

// Redeem gift card component
export function GiftCardRedeem({ onRedeem }: { onRedeem?: (code: string) => Promise<{ balance: number } | null> }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ balance: number } | null>(null);
  const [error, setError] = useState('');

  const handleRedeem = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (onRedeem) {
        const res = await onRedeem(code);
        setResult(res);
      } else {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from('gift_cards')
          .select('balance_cents, status')
          .eq('code', code.toUpperCase())
          .single();
        
        if (fetchError || !data) {
          setError('Invalid gift card code');
          return;
        }
        
        if (data.status !== 'active') {
          setError('This gift card has been used or expired');
          return;
        }
        
        setResult({ balance: data.balance_cents });
      }
    } catch (e) {
      setError('Failed to redeem gift card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter gift card code (e.g., JEF-ABC123)"
          className="flex-1 px-3 py-2 border rounded-lg uppercase focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
        />
        <Button onClick={handleRedeem} disabled={loading || !code.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
        </Button>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600" />
          <span className="text-green-800">
            Gift card applied! Balance: {formatCurrency(result.balance)}
          </span>
        </div>
      )}
    </div>
  );
}

// Gift card balance checker
export function GiftCardBalance() {
  const [code, setCode] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkBalance = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');
    setBalance(null);
    
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('gift_cards')
        .select('balance_cents, status')
        .eq('code', code.toUpperCase())
        .single();
      
      if (fetchError || !data) {
        setError('Gift card not found');
        return;
      }
      
      setBalance(data.balance_cents);
    } catch (e) {
      setError('Failed to check balance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5" />
        Check Gift Card Balance
      </h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter code"
          className="flex-1 px-3 py-2 border rounded-lg uppercase"
        />
        <Button onClick={checkBalance} disabled={loading} variant="outline">
          Check
        </Button>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      {balance !== null && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">Available Balance</p>
          <p className="text-3xl font-bold text-[#ff6b35]">{formatCurrency(balance)}</p>
        </div>
      )}
    </div>
  );
}
