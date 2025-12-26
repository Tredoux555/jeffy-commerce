'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-24 right-4 lg:bottom-8 z-40 bg-[#ff6b35] text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-all transform hover:scale-110"
      aria-label="Back to top"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
}
