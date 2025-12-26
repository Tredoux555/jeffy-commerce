'use client';

import { useState } from 'react';
import { MessageSquare, Gift, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Order Notes Component
interface OrderNotesProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function OrderNotes({ value, onChange, maxLength = 500 }: OrderNotesProps) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <label className="flex items-center gap-2 font-medium mb-2">
        <MessageSquare className="h-5 w-5 text-gray-400" />
        Order Notes (Optional)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Add special instructions, delivery notes, or requests..."
        className="w-full border rounded-lg px-3 py-2 resize-none"
        rows={3}
        maxLength={maxLength}
      />
      <p className="text-xs text-gray-400 mt-1 text-right">{value.length}/{maxLength}</p>
    </div>
  );
}

// Gift Wrapping Component
interface GiftWrappingProps {
  selected: boolean;
  onSelect: (selected: boolean) => void;
  giftMessage: string;
  onMessageChange: (message: string) => void;
  price?: number; // in cents
}

export function GiftWrapping({ selected, onSelect, giftMessage, onMessageChange, price = 2500 }: GiftWrappingProps) {
  return (
    <div className={`rounded-xl border-2 transition ${selected ? 'border-[#ff6b35] bg-orange-50' : 'border-gray-200 bg-white'}`}>
      <div className="p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelect(e.target.checked)}
            className="mt-1 w-5 h-5 accent-[#ff6b35]"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-[#ff6b35]" />
              <span className="font-medium">Add Gift Wrapping</span>
              <span className="text-[#ff6b35] font-bold">+{formatCurrency(price)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Beautiful gift wrapping with a ribbon and personalized message card
            </p>
          </div>
        </label>

        {selected && (
          <div className="mt-4 pl-8">
            <label className="block text-sm font-medium mb-1">Gift Message (Optional)</label>
            <textarea
              value={giftMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Write a personal message for the recipient..."
              className="w-full border rounded-lg px-3 py-2 resize-none"
              rows={2}
              maxLength={150}
            />
            <p className="text-xs text-gray-400 mt-1">{giftMessage.length}/150</p>
          </div>
        )}
      </div>

      {selected && (
        <div className="bg-green-50 px-4 py-2 rounded-b-xl border-t border-green-100 flex items-center gap-2 text-green-700 text-sm">
          <Check className="h-4 w-4" />
          Gift wrapping will be added to your order
        </div>
      )}
    </div>
  );
}

// Combined Checkout Extras Component
interface CheckoutExtrasProps {
  orderNotes: string;
  onOrderNotesChange: (value: string) => void;
  giftWrap: boolean;
  onGiftWrapChange: (value: boolean) => void;
  giftMessage: string;
  onGiftMessageChange: (value: string) => void;
  giftWrapPrice?: number;
}

export function CheckoutExtras({
  orderNotes,
  onOrderNotesChange,
  giftWrap,
  onGiftWrapChange,
  giftMessage,
  onGiftMessageChange,
  giftWrapPrice = 2500,
}: CheckoutExtrasProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Extras</h3>
      
      <GiftWrapping
        selected={giftWrap}
        onSelect={onGiftWrapChange}
        giftMessage={giftMessage}
        onMessageChange={onGiftMessageChange}
        price={giftWrapPrice}
      />
      
      <OrderNotes
        value={orderNotes}
        onChange={onOrderNotesChange}
      />
    </div>
  );
}
