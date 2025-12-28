'use client';

import { useState } from 'react';
import { CreditCard, Smartphone, Building, Banknote, Check, Loader2, Shield, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: 'card' | 'eft' | 'mobile' | 'cash' | 'bank';
  fee?: number;
  processingTime?: string;
  popular?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, Amex',
    icon: 'card',
    fee: 0,
    processingTime: 'Instant',
    popular: true
  },
  {
    id: 'ozow',
    name: 'Ozow Instant EFT',
    description: 'Pay directly from your bank account',
    icon: 'bank',
    fee: 0,
    processingTime: 'Instant',
    popular: true
  },
  {
    id: 'payfast',
    name: 'PayFast',
    description: 'Multiple payment options',
    icon: 'mobile',
    fee: 0,
    processingTime: 'Instant'
  },
  {
    id: 'snapscan',
    name: 'SnapScan',
    description: 'Scan to pay with your phone',
    icon: 'mobile',
    fee: 0,
    processingTime: 'Instant'
  },
  {
    id: 'zapper',
    name: 'Zapper',
    description: 'Pay with the Zapper app',
    icon: 'mobile',
    fee: 0,
    processingTime: 'Instant'
  },
  {
    id: 'eft',
    name: 'Manual EFT',
    description: 'Bank transfer (2-3 business days)',
    icon: 'eft',
    fee: 0,
    processingTime: '2-3 business days'
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: 'cash',
    fee: 5000, // R50 fee
    processingTime: 'On delivery'
  }
];

interface PaymentSelectorProps {
  amount: number;
  onSelect: (methodId: string) => void;
  selected?: string;
  disabled?: boolean;
}

export function PaymentSelector({ amount, onSelect, selected, disabled }: PaymentSelectorProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="h-6 w-6" />;
      case 'mobile': return <Smartphone className="h-6 w-6" />;
      case 'bank': return <Building className="h-6 w-6" />;
      case 'eft': return <Building className="h-6 w-6" />;
      case 'cash': return <Banknote className="h-6 w-6" />;
      default: return <CreditCard className="h-6 w-6" />;
    }
  };

  return (
    <div className="space-y-3">
      {paymentMethods.map((method) => {
        const isSelected = selected === method.id;
        const totalWithFee = amount + (method.fee || 0);
        
        return (
          <button
            key={method.id}
            onClick={() => !disabled && onSelect(method.id)}
            disabled={disabled}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition ${
              isSelected
                ? 'border-[#ff6b35] bg-orange-50'
                : disabled
                ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isSelected ? 'bg-[#ff6b35] text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {getIcon(method.icon)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{method.name}</span>
                {method.popular && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Popular</span>
                )}
              </div>
              <p className="text-sm text-gray-600">{method.description}</p>
              <p className="text-xs text-gray-500 mt-0.5">{method.processingTime}</p>
            </div>

            <div className="text-right">
              {method.fee ? (
                <p className="text-sm text-gray-600">+{formatCurrency(method.fee)} fee</p>
              ) : (
                <p className="text-sm text-green-600">No fee</p>
              )}
              {isSelected && <Check className="h-5 w-5 text-[#ff6b35] ml-auto mt-1" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Credit Card Form
interface CardFormProps {
  onSubmit: (data: CardData) => Promise<void>;
  loading?: boolean;
}

interface CardData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;
  saveCard?: boolean;
}

export function CreditCardForm({ onSubmit, loading }: CardFormProps) {
  const [formData, setFormData] = useState<CardData>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    saveCard: false
  });

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(' ').substring(0, 19) : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const detectCardType = (number: string) => {
    const digits = number.replace(/\s/g, '');
    if (/^4/.test(digits)) return 'visa';
    if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    return null;
  };

  const cardType = detectCardType(formData.cardNumber);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium mb-1">Card Number</label>
        <div className="relative">
          <input
            type="text"
            value={formData.cardNumber}
            onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
            placeholder="1234 5678 9012 3456"
            className="w-full px-4 py-3 border rounded-lg pr-16"
            maxLength={19}
            required
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {cardType && (
              <span className="text-2xl">
                {cardType === 'visa' && '💳'}
                {cardType === 'mastercard' && '💳'}
                {cardType === 'amex' && '💳'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expiry & CVV */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Month</label>
          <select
            value={formData.expiryMonth}
            onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
            className="w-full px-3 py-3 border rounded-lg"
            required
          >
            <option value="">MM</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={String(i + 1).padStart(2, '0')}>
                {String(i + 1).padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <select
            value={formData.expiryYear}
            onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
            className="w-full px-3 py-3 border rounded-lg"
            required
          >
            <option value="">YY</option>
            {Array.from({ length: 10 }, (_, i) => {
              const year = new Date().getFullYear() + i;
              return (
                <option key={year} value={String(year).slice(-2)}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CVV</label>
          <input
            type="text"
            value={formData.cvv}
            onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            placeholder="123"
            className="w-full px-3 py-3 border rounded-lg"
            maxLength={4}
            required
          />
        </div>
      </div>

      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Cardholder Name</label>
        <input
          type="text"
          value={formData.cardholderName}
          onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value.toUpperCase() })}
          placeholder="JOHN DOE"
          className="w-full px-4 py-3 border rounded-lg uppercase"
          required
        />
      </div>

      {/* Save Card */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.saveCard}
          onChange={(e) => setFormData({ ...formData, saveCard: e.target.checked })}
          className="w-4 h-4 text-[#ff6b35] rounded"
        />
        <span className="text-sm">Save card for future purchases</span>
      </label>

      {/* Security Badge */}
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Lock className="h-4 w-4" />
        <span>Your payment information is encrypted</span>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </Button>

      {/* Trust Badges */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <Shield className="h-6 w-6 text-green-600" />
        <span className="text-xs text-gray-500">Secured by 256-bit SSL encryption</span>
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
  onDelete 
}: { 
  cards: SavedCard[];
  selected?: string;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="space-y-2">
      {cards.map((card) => (
        <div
          key={card.id}
          onClick={() => onSelect(card.id)}
          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer ${
            selected === card.id ? 'border-[#ff6b35] bg-orange-50' : 'hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6 text-gray-600" />
            <div>
              <p className="font-medium">•••• {card.last4}</p>
              <p className="text-sm text-gray-500">
                Expires {card.expiryMonth}/{card.expiryYear}
              </p>
            </div>
          </div>
          {selected === card.id && <Check className="h-5 w-5 text-[#ff6b35]" />}
        </div>
      ))}
    </div>
  );
}
