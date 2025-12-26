'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endDate: Date;
  label?: string;
}

export function CountdownTimer({ endDate, label = 'Sale ends in' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = () => {
      const difference = endDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!mounted) return null;

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  if (isExpired) {
    return (
      <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-lg text-sm">
        Sale ended
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
      <div className="flex items-center gap-2 text-red-600 mb-2">
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex gap-2">
        {timeLeft.days > 0 && (
          <div className="bg-red-600 text-white px-2 py-1 rounded text-center min-w-[40px]">
            <span className="text-lg font-bold">{timeLeft.days}</span>
            <p className="text-xs">days</p>
          </div>
        )}
        <div className="bg-red-600 text-white px-2 py-1 rounded text-center min-w-[40px]">
          <span className="text-lg font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
          <p className="text-xs">hrs</p>
        </div>
        <div className="bg-red-600 text-white px-2 py-1 rounded text-center min-w-[40px]">
          <span className="text-lg font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <p className="text-xs">min</p>
        </div>
        <div className="bg-red-600 text-white px-2 py-1 rounded text-center min-w-[40px]">
          <span className="text-lg font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <p className="text-xs">sec</p>
        </div>
      </div>
    </div>
  );
}
