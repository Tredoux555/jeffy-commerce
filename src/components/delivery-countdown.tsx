'use client';

import { useState, useEffect } from 'react';
import { Truck, Clock } from 'lucide-react';

export function DeliveryCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = () => {
      const now = new Date();
      // Cutoff time is 2 PM today or tomorrow if past 2 PM
      const cutoff = new Date();
      cutoff.setHours(14, 0, 0, 0); // 2 PM
      
      if (now > cutoff) {
        // Show tomorrow's cutoff
        cutoff.setDate(cutoff.getDate() + 1);
      }
      
      const diff = cutoff.getTime() - now.getTime();
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const isUrgent = timeLeft.hours < 3;

  return (
    <div className={`rounded-lg p-3 ${isUrgent ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${isUrgent ? 'bg-red-100' : 'bg-green-100'}`}>
          <Truck className={`h-5 w-5 ${isUrgent ? 'text-red-600' : 'text-green-600'}`} />
        </div>
        
        <div className="flex-1">
          <p className={`font-medium text-sm ${isUrgent ? 'text-red-800' : 'text-green-800'}`}>
            {isUrgent ? '⚡ Order soon for same-day dispatch!' : '✓ Order now for fast dispatch'}
          </p>
          
          <div className="flex items-center gap-1 mt-1">
            <Clock className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-xs text-gray-600">
              Order within{' '}
              <span className={`font-mono font-bold ${isUrgent ? 'text-red-600' : 'text-green-600'}`}>
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
