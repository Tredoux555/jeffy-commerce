'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Gift, Mail, Loader2 } from 'lucide-react';

interface ExitIntentPopupProps {
  title?: string;
  subtitle?: string;
  discountCode?: string;
  discountPercent?: number;
  onSubscribe?: (email: string) => void;
}

export function ExitIntentPopup({
  title = "Wait! Don't leave empty-handed!",
  subtitle = "Get 10% off your first order",
  discountCode = "WELCOME10",
  discountPercent = 10,
  onSubscribe,
}: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Detect exit intent
  useEffect(() => {
    // Check if already shown this session
    const shown = sessionStorage.getItem('exitPopupShown');
    if (shown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves from top of page
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    };

    // Mobile: detect scroll up quickly (might be leaving)
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (lastScrollY - currentScrollY > 100 && currentScrollY < 100 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
      lastScrollY = currentScrollY;
    };

    // Delay adding listener to avoid immediate trigger
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('scroll', handleScroll);
    }, 5000); // Wait 5 seconds before enabling

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasShown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    
    try {
      // Subscribe to newsletter
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit_popup' }),
      });
      
      onSubscribe?.(email);
      setSubmitted(true);
      
      // Auto close after showing success
      setTimeout(() => setIsVisible(false), 5000);
    } catch (err) {
      console.error('Subscribe error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Popup */}
      <div className="relative bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Content */}
        <div className="grid md:grid-cols-2">
          {/* Left side - Image/Visual */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-8 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-6xl mb-4">🎁</div>
              <div className="text-5xl font-bold mb-2">{discountPercent}%</div>
              <div className="text-xl">OFF</div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="p-8">
            {!submitted ? (
              <>
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <p className="text-gray-600 mb-6">{subtitle}</p>

                <form onSubmit={handleSubmit}>
                  <div className="relative mb-4">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#ff6b35] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                    ) : (
                      <>Get My {discountPercent}% Off</>
                    )}
                  </button>
                </form>

                <p className="text-xs text-gray-400 mt-4 text-center">
                  By subscribing, you agree to receive marketing emails. Unsubscribe anytime.
                </p>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">You're In! 🎉</h2>
                <p className="text-gray-600 mb-4">Use code at checkout:</p>
                <div className="bg-gray-100 rounded-xl p-4 mb-4">
                  <span className="text-2xl font-mono font-bold text-[#ff6b35]">{discountCode}</span>
                </div>
                <p className="text-sm text-gray-500">Check your email for more exclusive deals!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simpler inline banner version
export function ExitIntentBanner({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 z-50 shadow-lg">
      <button onClick={onClose} className="absolute top-2 right-2 text-white/80 hover:text-white">
        <X className="h-5 w-5" />
      </button>
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎁</span>
          <div>
            <p className="font-bold">Get 10% off your first order!</p>
            <p className="text-sm text-white/80">Subscribe and save on your purchase.</p>
          </div>
        </div>
        <form className="flex gap-2 w-full md:w-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            className="px-4 py-2 rounded-lg text-gray-900 flex-1 md:w-64"
          />
          <button className="bg-white text-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-orange-50 transition whitespace-nowrap">
            Get Code
          </button>
        </form>
      </div>
    </div>
  );
}
