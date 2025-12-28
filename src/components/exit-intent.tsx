'use client';

import { useState, useEffect } from 'react';
import { X, Gift, ArrowRight } from 'lucide-react';

interface ExitIntentPopupProps {
  discountCode?: string;
  discountPercent?: number;
  onClose: () => void;
  onSubscribe?: (email: string) => void;
}

export function ExitIntentPopup({ discountCode = 'STAY10', discountPercent = 10, onClose, onSubscribe }: ExitIntentPopupProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onSubscribe?.(email);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />
        <div className="relative bg-white rounded-2xl max-w-md w-full p-8 text-center animate-bounce-in">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">You're In!</h2>
          <p className="text-gray-600 mb-4">Use code <span className="font-mono bg-[#ff6b35] text-white px-3 py-1 rounded">{discountCode}</span> at checkout</p>
          <button onClick={onClose} className="w-full bg-[#ff6b35] text-white py-3 rounded-xl font-bold hover:bg-orange-600">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-md w-full overflow-hidden animate-bounce-in">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white hover:text-gray-200"><X className="h-6 w-6" /></button>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ff6b35] to-red-500 p-8 text-white text-center">
          <Gift className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">Wait!</h2>
          <p className="text-xl">Get {discountPercent}% Off Your First Order</p>
        </div>

        {/* Body */}
        <div className="p-8">
          <p className="text-gray-600 text-center mb-6">
            Join our newsletter and get an exclusive discount code!
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-4 focus:border-[#ff6b35] outline-none"
              required
            />
            <button type="submit" className="w-full bg-[#ff6b35] text-white py-4 rounded-xl font-bold hover:bg-orange-600 flex items-center justify-center gap-2">
              Get My {discountPercent}% Off <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-4">
            No spam, unsubscribe anytime
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook to detect exit intent
export function useExitIntent(options: { delay?: number; cookieDays?: number } = {}) {
  const { delay = 0, cookieDays = 7 } = options;
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if already shown recently
    const lastShown = localStorage.getItem('exitIntentShown');
    if (lastShown) {
      const daysSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60 * 24);
      if (daysSince < cookieDays) return;
    }

    let timeoutId: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves from top of page
      if (e.clientY <= 0) {
        timeoutId = setTimeout(() => {
          setShowPopup(true);
          localStorage.setItem('exitIntentShown', Date.now().toString());
        }, delay);
      }
    };

    const handleMouseEnter = () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [delay, cookieDays]);

  return { showPopup, setShowPopup };
}

// Wrapper component for easy use
export function ExitIntentWrapper() {
  const { showPopup, setShowPopup } = useExitIntent({ cookieDays: 3 });

  if (!showPopup) return null;

  return (
    <ExitIntentPopup
      discountCode="STAY10"
      discountPercent={10}
      onClose={() => setShowPopup(false)}
      onSubscribe={(email) => {
        // Save to newsletter
        fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: 'exit_intent' }),
        });
      }}
    />
  );
}
