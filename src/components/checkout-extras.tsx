'use client';

import { useState } from 'react';
import { Gift, Loader2, Check, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GiftWrapOptionProps {
  price?: number;
  onSelect: (selected: boolean, message?: string) => void;
}

export function GiftWrapOption({ price = 2500, onSelect }: GiftWrapOptionProps) {
  const [selected, setSelected] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const handleToggle = () => {
    const newSelected = !selected;
    setSelected(newSelected);
    if (!newSelected) {
      setMessage('');
      setShowMessage(false);
    }
    onSelect(newSelected, message);
  };

  return (
    <div className={`border-2 rounded-xl p-4 transition ${selected ? 'border-[#ff6b35] bg-orange-50' : 'border-gray-200'}`}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={selected}
          onChange={handleToggle}
          className="mt-1 w-5 h-5 text-[#ff6b35] rounded focus:ring-[#ff6b35]"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-[#ff6b35]" />
              <span className="font-medium">Add Gift Wrapping</span>
            </div>
            <span className="text-sm font-medium">+R{(price / 100).toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Beautiful gift wrap with ribbon and a personalized message card
          </p>
        </div>
      </label>

      {selected && (
        <div className="mt-4 ml-8">
          <button
            type="button"
            onClick={() => setShowMessage(!showMessage)}
            className="text-sm text-[#ff6b35] hover:underline"
          >
            {showMessage ? 'Hide message' : '+ Add a gift message'}
          </button>
          
          {showMessage && (
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                onSelect(selected, e.target.value);
              }}
              placeholder="Write your gift message here..."
              maxLength={200}
              rows={3}
              className="w-full mt-2 px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
            />
          )}
        </div>
      )}
    </div>
  );
}

// Coupon/Discount Code Input
interface CouponInputProps {
  onApply: (code: string) => Promise<{ valid: boolean; discount?: number; message?: string }>;
  appliedCode?: string;
  onRemove?: () => void;
}

export function CouponInput({ onApply, appliedCode, onRemove }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discount, setDiscount] = useState<number | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await onApply(code.trim().toUpperCase());
      if (result.valid) {
        setDiscount(result.discount || 0);
      } else {
        setError(result.message || 'Invalid coupon code');
      }
    } catch (err) {
      setError('Failed to apply coupon');
    } finally {
      setLoading(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-800">{appliedCode}</span>
          {discount && <span className="text-green-600">(-R{(discount / 100).toFixed(2)})</span>}
        </div>
        <button onClick={onRemove} className="text-sm text-red-600 hover:underline">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="flex-1 px-3 py-2 border rounded-lg text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
        />
        <Button onClick={handleApply} disabled={loading || !code.trim()} variant="outline">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

// Order notes
export function OrderNotes({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-[#ff6b35] hover:underline"
      >
        {isOpen ? 'Hide order notes' : '+ Add order notes'}
      </button>
      
      {isOpen && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Special instructions for your order (e.g., delivery preferences, product customization)..."
          rows={3}
          maxLength={500}
          className="w-full mt-2 px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
        />
      )}
    </div>
  );
}
