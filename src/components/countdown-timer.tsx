'use client';

import { useState, useEffect } from 'react';
import { Clock, Zap, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  endTime: Date | string;
  onComplete?: () => void;
  variant?: 'default' | 'compact' | 'banner';
  showDays?: boolean;
}

export function CountdownTimer({ endTime, onComplete, variant = 'default', showDays = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        onComplete?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime, onComplete]);

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-bold">Sale Ended</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1 text-red-600 font-mono font-bold">
        <Clock className="h-4 w-4" />
        {showDays && timeLeft.days > 0 && `${timeLeft.days}d `}
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="flex items-center gap-4 justify-center">
        {showDays && (
          <TimeBlock value={timeLeft.days} label="Days" />
        )}
        <TimeBlock value={timeLeft.hours} label="Hours" />
        <TimeBlock value={timeLeft.minutes} label="Mins" />
        <TimeBlock value={timeLeft.seconds} label="Secs" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {showDays && (
        <TimeBox value={timeLeft.days} label="D" />
      )}
      <TimeBox value={timeLeft.hours} label="H" />
      <span className="text-red-500 font-bold text-xl">:</span>
      <TimeBox value={timeLeft.minutes} label="M" />
      <span className="text-red-500 font-bold text-xl">:</span>
      <TimeBox value={timeLeft.seconds} label="S" />
    </div>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-red-600 text-white rounded-lg px-3 py-2 text-center min-w-[50px]">
      <div className="text-2xl font-bold font-mono">{String(value).padStart(2, '0')}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-white text-red-600 rounded-lg px-4 py-2 text-3xl font-bold font-mono shadow-lg">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-white/80 text-xs mt-1">{label}</div>
    </div>
  );
}

// Flash Sale Banner Component
interface FlashSaleBannerProps {
  title: string;
  endTime: Date | string;
  badgeText?: string;
  description?: string;
  href?: string;
}

export function FlashSaleBanner({ title, endTime, badgeText = 'FLASH SALE', description, href = '/flash-sale' }: FlashSaleBannerProps) {
  return (
    <a href={href} className="block">
      <div className="bg-gradient-to-r from-red-600 via-orange-500 to-red-600 text-white py-4 px-6 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
        
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-white text-red-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 animate-pulse">
              <Zap className="h-4 w-4" />
              {badgeText}
            </div>
            <div>
              <h3 className="font-bold text-lg">{title}</h3>
              {description && <p className="text-white/80 text-sm">{description}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">Ends in:</span>
            <CountdownTimer endTime={endTime} variant="banner" showDays={false} />
          </div>
        </div>
      </div>
    </a>
  );
}

// Flash Sale Product Badge
export function FlashSaleBadge({ endTime, salePrice, originalPrice }: { endTime: Date | string; salePrice: number; originalPrice: number }) {
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  
  return (
    <div className="absolute top-2 left-2 z-10">
      <div className="bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
        <Zap className="h-3 w-3" />
        {discount}% OFF
      </div>
      <div className="bg-black/80 text-white px-2 py-1 rounded-lg text-xs mt-1">
        <CountdownTimer endTime={endTime} variant="compact" showDays={false} />
      </div>
    </div>
  );
}
