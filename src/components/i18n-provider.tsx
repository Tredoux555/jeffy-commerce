'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Globe, Check } from 'lucide-react';

type Language = 'en' | 'af' | 'zu';

interface Translations {
  [key: string]: { en: string; af: string; zu: string };
}

// Core translations
const translations: Translations = {
  // Navigation
  'nav.home': { en: 'Home', af: 'Tuis', zu: 'Ikhaya' },
  'nav.products': { en: 'Products', af: 'Produkte', zu: 'Imikhiqizo' },
  'nav.cart': { en: 'Cart', af: 'Mandjie', zu: 'Inqola' },
  'nav.account': { en: 'My Account', af: 'My Rekening', zu: 'I-Akhawunti Yami' },
  
  // Common
  'common.addToCart': { en: 'Add to Cart', af: 'Voeg by Mandjie', zu: 'Engeza Enqoleni' },
  'common.buyNow': { en: 'Buy Now', af: 'Koop Nou', zu: 'Thenga Manje' },
  'common.viewAll': { en: 'View All', af: 'Sien Alles', zu: 'Buka Konke' },
  'common.search': { en: 'Search', af: 'Soek', zu: 'Sesha' },
  'common.loading': { en: 'Loading...', af: 'Laai...', zu: 'Iyalayisha...' },
  'common.error': { en: 'Something went wrong', af: 'Iets het verkeerd gegaan', zu: 'Kukhona okungahambanga kahle' },
  'common.success': { en: 'Success!', af: 'Sukses!', zu: 'Impumelelo!' },
  
  // Product
  'product.inStock': { en: 'In Stock', af: 'In Voorraad', zu: 'Iyatholakala' },
  'product.outOfStock': { en: 'Out of Stock', af: 'Uit Voorraad', zu: 'Ayitholakali' },
  'product.freeShipping': { en: 'Free Shipping', af: 'Gratis Aflewering', zu: 'Ukuthunyelwa Kwamahhala' },
  'product.reviews': { en: 'Reviews', af: 'Resensies', zu: 'Ukubuyekezwa' },
  
  // Cart
  'cart.empty': { en: 'Your cart is empty', af: 'Jou mandjie is leeg', zu: 'Inqola yakho ayinalutho' },
  'cart.subtotal': { en: 'Subtotal', af: 'Subtotaal', zu: 'Ingxenye' },
  'cart.checkout': { en: 'Checkout', af: 'Betaal', zu: 'Khokha' },
  
  // Checkout
  'checkout.shipping': { en: 'Shipping', af: 'Aflewering', zu: 'Ukuthunyelwa' },
  'checkout.payment': { en: 'Payment', af: 'Betaling', zu: 'Ukukhokha' },
  'checkout.placeOrder': { en: 'Place Order', af: 'Plaas Bestelling', zu: 'Yenza Isicelo' },
  
  // Jeffy Wants
  'wants.getItFree': { en: 'Get it FREE', af: 'Kry dit GRATIS', zu: 'Ithola MAHHALA' },
  'wants.agrees': { en: 'agrees', af: 'stem saam', zu: 'vuma' },
  'wants.shareLink': { en: 'Share your link', af: 'Deel jou skakel', zu: 'Yabelana ngesixhumanisi sakho' },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language | null;
    if (stored && ['en', 'af', 'zu'].includes(stored)) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

// Language Selector Component
const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const current = languages.find((l) => l.code === language);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        <Globe className="h-4 w-4 text-gray-500" />
        <span>{current?.flag}</span>
        <span className="text-sm">{current?.name}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border z-50 overflow-hidden min-w-[150px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-left ${
                  language === lang.code ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                }`}
              >
                <span>{lang.flag}</span>
                <span className="flex-1">{lang.name}</span>
                {language === lang.code && <Check className="h-4 w-4 text-[#ff6b35]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
