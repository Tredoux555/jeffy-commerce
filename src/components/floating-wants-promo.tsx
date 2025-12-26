'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Gift, Sparkles, ArrowRight } from 'lucide-react';

export default function FloatingWantsPromo() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    const dismissed = sessionStorage.getItem('wants-promo-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }
    
    // Show after 1 second delay for smooth entrance
    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('wants-promo-dismissed', 'true');
    setTimeout(() => setIsDismissed(true), 300);
  };

  if (isDismissed) return null;

  return (
    <>
      {/* Backdrop blur */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleDismiss}
      />
      
      {/* Floating Card */}
      <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-500 ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
      }`}>
        <div className="relative max-w-md w-full">
          {/* Animated glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b35] via-[#f7931e] to-[#ff6b35] rounded-2xl blur-lg opacity-75 animate-pulse" />
          
          {/* Main card */}
          <div className="relative bg-[#0f172a] rounded-2xl p-8 border border-[#ff6b35]/30 shadow-2xl">
            {/* Close button */}
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Floating sparkles */}
            <div className="absolute -top-3 -left-3 animate-bounce">
              <Sparkles className="h-8 w-8 text-[#f7931e]" />
            </div>
            <div className="absolute -bottom-2 -right-2 animate-bounce delay-150">
              <Sparkles className="h-6 w-6 text-[#ff6b35]" />
            </div>

            {/* Content */}
            <div className="text-center">
              {/* Icon */}
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-full animate-ping opacity-20" />
                <div className="relative w-full h-full bg-gradient-to-br from-[#ff6b35] to-[#f7931e] rounded-full flex items-center justify-center">
                  <Gift className="h-10 w-10 text-white" />
                </div>
              </div>

              {/* Headline */}
              <h2 className="text-3xl font-bold text-white mb-2">
                Get Products <span className="text-[#ff6b35]">FREE!</span>
              </h2>
              
              {/* Subheadline */}
              <p className="text-gray-300 mb-6 text-lg">
                Tell us what you want. Get 10 friends to agree. 
                <br />
                <span className="text-[#f7931e] font-semibold">We ship it to you FREE!</span>
              </p>

              {/* How it works mini */}
              <div className="flex justify-center gap-4 mb-8 text-sm">
                <div className="text-center">
                  <div className="w-10 h-10 bg-[#ff6b35]/20 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-[#ff6b35] font-bold">1</span>
                  </div>
                  <span className="text-gray-400">Create Want</span>
                </div>
                <div className="text-gray-500 self-center">→</div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-[#f7931e]/20 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-[#f7931e] font-bold">2</span>
                  </div>
                  <span className="text-gray-400">Share Link</span>
                </div>
                <div className="text-gray-500 self-center">→</div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-green-400 font-bold">3</span>
                  </div>
                  <span className="text-gray-400">Get FREE!</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-3">
                <Link href="/wants/create" className="block">
                  <button className="w-full bg-gradient-to-r from-[#ff6b35] to-[#f7931e] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25">
                    <Gift className="h-5 w-5" />
                    Create My Want Now
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
                
                <button 
                  onClick={handleDismiss}
                  className="w-full text-gray-400 hover:text-white py-3 font-medium transition"
                >
                  Maybe later, continue shopping →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
