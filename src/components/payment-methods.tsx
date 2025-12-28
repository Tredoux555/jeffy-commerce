'use client';

import { useState } from 'react';
import { CreditCard, Smartphone, Building, Wallet, Check, ChevronRight } from 'lucide-react';

type PaymentMethod = 'card' | 'eft' | 'ozow' | 'payfast' | 'snapscan' | 'mobicred';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: React.ReactNode;
  logo?: string;
  popular?: boolean;
}

const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: <CreditCard className="h-6 w-6" />,
    popular: true
  },
  {
    id: 'ozow',
    name: 'Ozow Instant EFT',
    description: 'Pay directly from your bank account',
    icon: <Building className="h-6 w-6" />,
    popular: true
  },
  {
    id: 'payfast',
    name: 'PayFast',
    description: 'Multiple payment options',
    icon: <Wallet className="h-6 w-6" />
  },
  {
    id: 'snapscan',
    name: 'SnapScan',
    description: 'Scan to pay with your phone',
    icon: <Smartphone className="h-6 w-6" />
  },
  {
    id: 'eft',
    name: 'Manual EFT',
    description: 'Bank transfer (1-2 business days)',
    icon: <Building className="h-6 w-6" />
  },
  {
    id: 'mobicred',
    name: 'Mobicred',
    description: 'Buy now, pay later',
    icon: <CreditCard className="h-6 w-6" />
  }
];

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  availableMethods?: PaymentMethod[];
}

export function PaymentMethodSelector({ 
  selected, 
  onSelect, 
  availableMethods 
}: PaymentMethodSelectorProps) {
  const methods = availableMethods 
    ? paymentMethods.filter(m => availableMethods.includes(m.id))
    : paymentMethods;

  return (
    <div className="space-y-3">
      {methods.map((method) => (
        <button
          key={method.id}
          onClick={() => onSelect(method.id)}
          className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition ${
            selected === method.id 
              ? 'border-[#ff6b35] bg-orange-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            selected === method.id ? 'bg-[#ff6b35] text-white' : 'bg-gray-100 text-gray-600'
          }`}>
            {method.icon}
          </div>
          
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium">{method.name}</span>
              {method.popular && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{method.description}</p>
          </div>

          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
            selected === method.id 
              ? 'border-[#ff6b35] bg-[#ff6b35]' 
              : 'border-gray-300'
          }`}>
            {selected === method.id && <Check className="h-4 w-4 text-white" />}
          </div>
        </button>
      ))}
    </div>
  );
}

// Card Input Form
export function CardPaymentForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ cardNumber, expiry, cvv, name, saveCard });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Card Number</label>
        <div className="relative">
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full px-4 py-3 border rounded-lg pl-12"
            required
          />
          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Expiry Date</label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CVV</label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="123"
            maxLength={4}
            className="w-full px-4 py-3 border rounded-lg"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cardholder Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value.toUpperCase())}
          placeholder="JOHN DOE"
          className="w-full px-4 py-3 border rounded-lg uppercase"
          required
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
          className="w-4 h-4 text-[#ff6b35] rounded"
        />
        <span className="text-sm text-gray-600">Save card for future purchases</span>
      </label>

      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Your payment info is encrypted and secure
      </div>
    </form>
  );
}

// Saved Cards List
interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

export function SavedCardsList({ 
  cards, 
  selected, 
  onSelect,
  onAddNew
}: { 
  cards: SavedCard[];
  selected: string | null;
  onSelect: (cardId: string) => void;
  onAddNew: () => void;
}) {
  const getBrandIcon = (brand: string) => {
    // Return brand-specific icon or generic card icon
    return <CreditCard className="h-6 w-6" />;
  };

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={() => onSelect(card.id)}
          className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition ${
            selected === card.id 
              ? 'border-[#ff6b35] bg-orange-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
            {getBrandIcon(card.brand)}
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">•••• •••• •••• {card.last4}</p>
            <p className="text-sm text-gray-500">
              Expires {card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}
            </p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 ${
            selected === card.id ? 'border-[#ff6b35] bg-[#ff6b35]' : 'border-gray-300'
          }`}>
            {selected === card.id && <Check className="h-4 w-4 text-white" />}
          </div>
        </button>
      ))}

      <button
        onClick={onAddNew}
        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-700"
      >
        <CreditCard className="h-5 w-5" />
        Add New Card
      </button>
    </div>
  );
}
