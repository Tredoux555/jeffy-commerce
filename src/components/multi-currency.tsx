'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Rate relative to ZAR
}

const currencies: Currency[] = [
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.055 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.050 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.043 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', rate: 43.5 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', rate: 7.1 },
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula', rate: 0.74 },
  { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar', rate: 1 },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  convert: (amountInCents: number) => number;
  format: (amountInCents: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>(currencies[0]);

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem('jeffy-currency');
    if (saved) {
      const found = currencies.find(c => c.code === saved);
      if (found) setCurrency(found);
    }
  }, []);

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('jeffy-currency', newCurrency.code);
  };

  const convert = (amountInCents: number): number => {
    // Convert from ZAR cents to target currency
    const zarAmount = amountInCents / 100;
    return zarAmount * currency.rate;
  };

  const format = (amountInCents: number): string => {
    const converted = convert(amountInCents);
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}

// Currency Selector Dropdown
export function CurrencySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
      >
        <Globe className="h-4 w-4 text-gray-500" />
        <span className="font-medium">{currency.code}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border z-50 py-2 max-h-80 overflow-y-auto">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => { setCurrency(curr); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 ${
                  currency.code === curr.code ? 'bg-orange-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 font-bold text-gray-600">{curr.symbol}</span>
                  <div className="text-left">
                    <p className="font-medium">{curr.code}</p>
                    <p className="text-xs text-gray-500">{curr.name}</p>
                  </div>
                </div>
                {currency.code === curr.code && (
                  <Check className="h-4 w-4 text-[#ff6b35]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Price display component with currency conversion
export function Price({ 
  amount, 
  compareAt,
  size = 'md',
  showCurrency = false 
}: { 
  amount: number;
  compareAt?: number;
  size?: 'sm' | 'md' | 'lg';
  showCurrency?: boolean;
}) {
  const { format, currency } = useCurrency();

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-baseline gap-2">
      <span className={`font-bold text-[#ff6b35] ${sizeClasses[size]}`}>
        {format(amount)}
      </span>
      {compareAt && compareAt > amount && (
        <span className="text-gray-400 line-through text-sm">
          {format(compareAt)}
        </span>
      )}
      {showCurrency && (
        <span className="text-xs text-gray-500">{currency.name}</span>
      )}
    </div>
  );
}

// Simple currency flag icon
export function CurrencyFlag({ code }: { code: string }) {
  const flagEmojis: Record<string, string> = {
    ZAR: '🇿🇦',
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    NGN: '🇳🇬',
    KES: '🇰🇪',
    BWP: '🇧🇼',
    NAD: '🇳🇦',
  };

  return <span className="text-lg">{flagEmojis[code] || '🌍'}</span>;
}
