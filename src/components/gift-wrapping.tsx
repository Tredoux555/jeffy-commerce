'use client';

import { useState } from 'react';
import { Gift, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface GiftOption {
  id: string;
  name: string;
  price: number;
  image?: string;
}

const giftOptions: GiftOption[] = [
  { id: 'standard', name: 'Standard Gift Wrap', price: 2500 },
  { id: 'premium', name: 'Premium Gift Box', price: 5000 },
  { id: 'luxury', name: 'Luxury Presentation', price: 9900 },
];

interface GiftWrappingProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
  giftMessage: string;
  onMessageChange: (message: string) => void;
}

export function GiftWrapping({ selected, onSelect, giftMessage, onMessageChange }: GiftWrappingProps) {
  const [showOptions, setShowOptions] = useState(!!selected);

  if (!showOptions) {
    return (
      <button onClick={() => setShowOptions(true)} className="flex items-center gap-3 w-full p-4 border-2 border-dashed rounded-xl hover:border-[#ff6b35] transition text-left">
        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
          <Gift className="h-6 w-6 text-pink-500" />
        </div>
        <div>
          <p className="font-medium">Add Gift Wrapping</p>
          <p className="text-sm text-gray-500">Make it special from {formatCurrency(2500)}</p>
        </div>
      </button>
    );
  }

  return (
    <div className="border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-pink-500" />
          <span className="font-bold">Gift Wrapping</span>
        </div>
        <button onClick={() => { setShowOptions(false); onSelect(null); }} className="text-gray-400 hover:text-gray-600 text-sm">
          Remove
        </button>
      </div>

      <div className="space-y-2 mb-4">
        {giftOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition ${
              selected === option.id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selected === option.id ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
              }`}>
                {selected === option.id && <Check className="h-4 w-4 text-white" />}
              </div>
              <div className="text-left">
                <p className="font-medium">{option.name}</p>
              </div>
            </div>
            <span className="font-bold text-pink-600">+{formatCurrency(option.price)}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div>
          <label className="block text-sm font-medium mb-1">Gift Message (optional)</label>
          <textarea
            value={giftMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Write a personal message..."
            rows={3}
            maxLength={200}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{giftMessage.length}/200 characters</p>
        </div>
      )}
    </div>
  );
}

export function getGiftWrapPrice(optionId: string | null): number {
  if (!optionId) return 0;
  return giftOptions.find(o => o.id === optionId)?.price || 0;
}
