'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Zap } from 'lucide-react';
import Link from 'next/link';

interface PromoBannerProps {
  message: string;
  endDate?: Date;
  link?: string;
  code?: string;
  dismissible?: boolean;
}

export function PromoBanner({ 
  message, 
  endDate, 
  link = '/products', 
  code,
  dismissible = true 
}: PromoBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; mins: number; secs: number } | null>(null);

  useEffect(() => {
    if (!endDate) return;

    const calculateTime = () => {
      const diff = endDate.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-[#ff6b35] to-orange-500 text-white py-2 px-4 relative">
      <div className="container mx-auto flex items-center justify-center gap-4 text-sm">
        <Zap className="h-4 w-4 hidden sm:block" />
        
        <Link href={link} className="hover:underline font-medium">
          {message}
        </Link>

        {code && (
          <span className="bg-white/20 px-2 py-0.5 rounded font-mono text-xs">
            {code}
          </span>
        )}

        {timeLeft && (
          <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded">
            <Clock className="h-3 w-3" />
            <span className="font-mono text-xs">
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.mins).padStart(2, '0')}:
              {String(timeLeft.secs).padStart(2, '0')}
            </span>
          </div>
        )}

        {dismissible && (
          <button 
            onClick={() => setDismissed(true)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Countdown timer component for deals
export function CountdownTimer({ endDate, label = 'Ends in' }: { endDate: Date; label?: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const diff = endDate.getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  if (expired) {
    return <span className="text-red-500 font-medium">Expired</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex gap-1">
        {timeLeft.days > 0 && (
          <div className="bg-gray-900 text-white px-2 py-1 rounded text-center min-w-[40px]">
            <div className="text-lg font-bold">{timeLeft.days}</div>
            <div className="text-[10px] text-gray-400">DAYS</div>
          </div>
        )}
        <div className="bg-gray-900 text-white px-2 py-1 rounded text-center min-w-[40px]">
          <div className="text-lg font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-[10px] text-gray-400">HRS</div>
        </div>
        <div className="bg-gray-900 text-white px-2 py-1 rounded text-center min-w-[40px]">
          <div className="text-lg font-bold">{String(timeLeft.mins).padStart(2, '0')}</div>
          <div className="text-[10px] text-gray-400">MIN</div>
        </div>
        <div className="bg-gray-900 text-white px-2 py-1 rounded text-center min-w-[40px]">
          <div className="text-lg font-bold">{String(timeLeft.secs).padStart(2, '0')}</div>
          <div className="text-[10px] text-gray-400">SEC</div>
        </div>
      </div>
    </div>
  );
}
