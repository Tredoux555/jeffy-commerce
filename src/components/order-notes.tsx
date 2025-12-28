'use client';

import { useState } from 'react';
import { MessageSquare, Plus } from 'lucide-react';

interface OrderNotesProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export function OrderNotes({ value, onChange, placeholder = 'Add delivery instructions, gift message, or special requests...', maxLength = 500 }: OrderNotesProps) {
  const [isExpanded, setIsExpanded] = useState(!!value);

  if (!isExpanded) {
    return (
      <button onClick={() => setIsExpanded(true)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm py-2">
        <Plus className="h-4 w-4" />
        Add order notes or special instructions
      </button>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium">Order Notes</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={3}
        className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
      />
      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <span>Special delivery instructions, gift messages, etc.</span>
        <span>{value.length}/{maxLength}</span>
      </div>
    </div>
  );
}

// Order notes display for admin
export function OrderNotesDisplay({ notes }: { notes: string }) {
  if (!notes) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <MessageSquare className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-800">Customer Notes</span>
      </div>
      <p className="text-amber-700 text-sm">{notes}</p>
    </div>
  );
}
