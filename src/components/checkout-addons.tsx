'use client';

import { useState } from 'react';
import { Gift, MessageSquare, Check, Package } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CheckoutAddOnsProps {
  onUpdate: (addOns: { orderNotes: string; giftWrap: boolean; giftMessage: string }) => void;
  giftWrapPrice?: number; // in cents
}

export function CheckoutAddOns({ onUpdate, giftWrapPrice = 2500 }: CheckoutAddOnsProps) {
  const [orderNotes, setOrderNotes] = useState('');
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const handleUpdate = (updates: Partial<{ orderNotes: string; giftWrap: boolean; giftMessage: string }>) => {
    const newState = {
      orderNotes: updates.orderNotes ?? orderNotes,
      giftWrap: updates.giftWrap ?? giftWrap,
      giftMessage: updates.giftMessage ?? giftMessage,
    };
    if (updates.orderNotes !== undefined) setOrderNotes(updates.orderNotes);
    if (updates.giftWrap !== undefined) setGiftWrap(updates.giftWrap);
    if (updates.giftMessage !== undefined) setGiftMessage(updates.giftMessage);
    onUpdate(newState);
  };

  return (
    <div className="space-y-4">
      {/* Gift Wrapping */}
      <div className={`border rounded-xl overflow-hidden transition ${giftWrap ? 'border-pink-300 bg-pink-50' : ''}`}>
        <button
          onClick={() => handleUpdate({ giftWrap: !giftWrap })}
          className="w-full px-4 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${giftWrap ? 'bg-pink-200 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
              <Gift className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium">Add Gift Wrapping</p>
              <p className="text-sm text-gray-500">Beautiful wrapping with ribbon</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-medium text-pink-600">+{formatCurrency(giftWrapPrice)}</span>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
              giftWrap ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
            }`}>
              {giftWrap && <Check className="h-4 w-4 text-white" />}
            </div>
          </div>
        </button>

        {/* Gift Message */}
        {giftWrap && (
          <div className="px-4 pb-4 border-t border-pink-200">
            <label className="block text-sm font-medium text-pink-700 mt-3 mb-2">
              Gift Message (optional)
            </label>
            <textarea
              value={giftMessage}
              onChange={(e) => handleUpdate({ giftMessage: e.target.value })}
              placeholder="Write a personal message for the recipient..."
              className="w-full border border-pink-200 rounded-lg px-3 py-2 text-sm resize-none bg-white"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-pink-500 mt-1 text-right">{giftMessage.length}/200</p>
          </div>
        )}
      </div>

      {/* Order Notes */}
      <div className="border rounded-xl overflow-hidden">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="w-full px-4 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${showNotes || orderNotes ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium">Add Order Notes</p>
              <p className="text-sm text-gray-500">Special instructions for your order</p>
            </div>
          </div>
          <span className="text-gray-400 text-sm">{showNotes ? 'Hide' : 'Add'}</span>
        </button>

        {showNotes && (
          <div className="px-4 pb-4 border-t">
            <textarea
              value={orderNotes}
              onChange={(e) => handleUpdate({ orderNotes: e.target.value })}
              placeholder="E.g., Leave at the gate, call before delivery, etc."
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none mt-3"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{orderNotes.length}/500</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Gift wrap option for product page
export function GiftWrapOption({ 
  selected, 
  onToggle, 
  price = 2500 
}: { 
  selected: boolean; 
  onToggle: (selected: boolean) => void; 
  price?: number;
}) {
  return (
    <button
      onClick={() => onToggle(!selected)}
      className={`w-full border rounded-xl p-4 flex items-center gap-4 transition ${
        selected ? 'border-pink-300 bg-pink-50' : 'hover:border-gray-300'
      }`}
    >
      <div className={`p-3 rounded-lg ${selected ? 'bg-pink-200' : 'bg-gray-100'}`}>
        <Gift className={`h-6 w-6 ${selected ? 'text-pink-600' : 'text-gray-400'}`} />
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium">Gift Wrapping</p>
        <p className="text-sm text-gray-500">Add beautiful wrapping +{formatCurrency(price)}</p>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
        selected ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
      }`}>
        {selected && <Check className="h-4 w-4 text-white" />}
      </div>
    </button>
  );
}

// Order summary display for gift items
export function GiftOrderSummary({ 
  giftWrap, 
  giftMessage, 
  orderNotes 
}: { 
  giftWrap: boolean; 
  giftMessage?: string; 
  orderNotes?: string;
}) {
  if (!giftWrap && !orderNotes) return null;

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      {giftWrap && (
        <div className="flex items-start gap-3">
          <Gift className="h-5 w-5 text-pink-500 mt-0.5" />
          <div>
            <p className="font-medium text-pink-700">Gift Wrapped</p>
            {giftMessage && (
              <p className="text-sm text-gray-600 mt-1 italic">"{giftMessage}"</p>
            )}
          </div>
        </div>
      )}
      
      {orderNotes && (
        <div className="flex items-start gap-3">
          <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className="font-medium text-blue-700">Order Notes</p>
            <p className="text-sm text-gray-600 mt-1">{orderNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
