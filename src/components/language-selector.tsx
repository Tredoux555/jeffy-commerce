'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', direction: 'ltr' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦', direction: 'ltr' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦', direction: 'ltr' },
  { code: 'st', name: 'Sotho', nativeName: 'Sesotho', flag: '🇿🇦', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', direction: 'ltr' },
];

// Simple translations for UI elements
const translations: Record<string, Record<string, string>> = {
  en: {
    'cart': 'Cart',
    'add_to_cart': 'Add to Cart',
    'buy_now': 'Buy Now',
    'checkout': 'Checkout',
    'search': 'Search products...',
    'home': 'Home',
    'shop': 'Shop',
    'account': 'Account',
    'wishlist': 'Wishlist',
    'orders': 'Orders',
    'free_shipping': 'Free Shipping',
    'in_stock': 'In Stock',
    'out_of_stock': 'Out of Stock',
    'reviews': 'Reviews',
    'description': 'Description',
    'specifications': 'Specifications',
    'shipping': 'Shipping',
    'returns': 'Returns',
  },
  af: {
    'cart': 'Mandjie',
    'add_to_cart': 'Voeg by Mandjie',
    'buy_now': 'Koop Nou',
    'checkout': 'Betaal',
    'search': 'Soek produkte...',
    'home': 'Tuis',
    'shop': 'Winkel',
    'account': 'Rekening',
    'wishlist': 'Wenslys',
    'orders': 'Bestellings',
    'free_shipping': 'Gratis Aflewering',
    'in_stock': 'In Voorraad',
    'out_of_stock': 'Uit Voorraad',
    'reviews': 'Resensies',
    'description': 'Beskrywing',
    'specifications': 'Spesifikasies',
    'shipping': 'Aflewering',
    'returns': 'Terugsendings',
  },
  zu: {
    'cart': 'Inqola',
    'add_to_cart': 'Engeza Enqoleni',
    'buy_now': 'Thenga Manje',
    'checkout': 'Khokha',
    'search': 'Sesha imikhiqizo...',
    'home': 'Ikhaya',
    'shop': 'Isitolo',
    'account': 'I-akhawunti',
    'wishlist': 'Uhlu lwezifiso',
    'orders': 'Ama-oda',
    'free_shipping': 'Ukuthunyelwa Kwamahhala',
    'in_stock': 'Iyatholakala',
    'out_of_stock': 'Ayitholakali',
    'reviews': 'Ukubuyekezwa',
    'description': 'Incazelo',
    'specifications': 'Izincazelo',
    'shipping': 'Ukuthunyelwa',
    'returns': 'Ukubuyiswa',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(languages[0]);

  useEffect(() => {
    const saved = localStorage.getItem('jeffy-language');
    if (saved) {
      const found = languages.find(l => l.code === saved);
      if (found) setLanguage(found);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('jeffy-language', lang.code);
    document.documentElement.dir = lang.direction;
    document.documentElement.lang = lang.code;
  };

  const t = (key: string): string => {
    const langTranslations = translations[language.code] || translations.en;
    return langTranslations[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, direction: language.direction }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// Language Selector
export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
      >
        <span className="text-lg">{language.flag}</span>
        <span className="font-medium hidden sm:inline">{language.code.toUpperCase()}</span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border z-50 py-2 max-h-80 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 ${
                  language.code === lang.code ? 'bg-orange-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{lang.flag}</span>
                  <div className="text-left">
                    <p className="font-medium">{lang.nativeName}</p>
                    <p className="text-xs text-gray-500">{lang.name}</p>
                  </div>
                </div>
                {language.code === lang.code && (
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

// Combined Language and Currency Selector
export function LocaleSelector() {
  return (
    <div className="flex items-center gap-2">
      <LanguageSelector />
    </div>
  );
}

// Translated text component
export function T({ children }: { children: string }) {
  const { t } = useLanguage();
  return <>{t(children)}</>;
}
