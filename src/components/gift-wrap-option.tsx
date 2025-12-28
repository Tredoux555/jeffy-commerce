'use client';

import { useState } from 'react';
import { Gift, Check } from 'lucide-react';

interface GiftWrapOptionProps {
  onToggle: (enabled: boolean) => void;
  price?: number;
}

export function GiftWrapOption({ onToggle, price = 2500 }: GiftWrapOptionProps) {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    onToggle(newValue);
  };

  return (
    <div className="border rounded-lg p-4">
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-1">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggle}
            className="sr-only"
          />
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${
            enabled ? 'bg-[#ff6b35] border-[#ff6b35]' : 'border-gray-300'
          }`}>
            {enabled && <Check className="h-3 w-3 text-white" />}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-[#ff6b35]" />
            <span className="font-medium">Add Gift Wrap</span>
            <span className="text-sm text-gray-500">+R{(price / 100).toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Beautiful gift wrapping with a ribbon and optional message
          </p>
        </div>
      </label>

      {enabled && (
        <div className="mt-4 ml-8">
          <label className="block text-sm font-medium mb-1">Gift Message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message..."
            rows={2}
            maxLength={150}
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">{message.length}/150 characters</p>
        </div>
      )}
    </div>
  );
}
