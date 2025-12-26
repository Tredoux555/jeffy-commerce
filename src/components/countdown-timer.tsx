'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endDate: Date | string;
  label?: string;
  onExpire?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ endDate, label = 'Deal ends in', onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = () => {
      const end = new Date(endDate).getTime();
      const now = Date.now();
      const difference = end - now;

      if (difference <= 0) {
        onExpire?.();
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (!newTimeLeft) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  if (!mounted || !timeLeft) return null;

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <div className="bg-[#0f172a] text-white text-lg font-bold rounded-lg w-12 h-12 flex items-center justify-center">
        {value.toString().padStart(2, '0')}
      </div>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-red-500" />
        <span className="font-medium text-red-700">{label}</span>
      </div>
      
      <div className="flex items-center justify-center gap-2">
        {timeLeft.days > 0 && (
          <>
            <TimeBlock value={timeLeft.days} label="Days" />
            <span className="text-2xl font-bold text-gray-300">:</span>
          </>
        )}
        <TimeBlock value={timeLeft.hours} label="Hrs" />
        <span className="text-2xl font-bold text-gray-300">:</span>
        <TimeBlock value={timeLeft.minutes} label="Min" />
        <span className="text-2xl font-bold text-gray-300">:</span>
        <TimeBlock value={timeLeft.seconds} label="Sec" />
      </div>
    </div>
  );
}
