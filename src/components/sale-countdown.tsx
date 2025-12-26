'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface SaleCountdownProps {
  endDate: Date;
  label?: string;
}

export function SaleCountdown({ endDate, label = "Sale ends in" }: SaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) return null;

  return (
    <div className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-3">
      <Clock className="h-5 w-5 animate-pulse" />
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-1 font-mono font-bold">
        <span className="bg-red-600 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span>:</span>
        <span className="bg-red-600 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span>:</span>
        <span className="bg-red-600 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
    </div>
  );
}

// Helper: End of day countdown (for daily deals)
export function DailyDealCountdown() {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  return <SaleCountdown endDate={endOfDay} label="Deal ends in" />;
}
