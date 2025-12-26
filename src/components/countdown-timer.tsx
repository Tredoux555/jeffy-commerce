'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

interface CountdownTimerProps {
  endDate: Date;
  onComplete?: () => void;
}

export function CountdownTimer({ endDate, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = endDate.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && 
          newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        onComplete?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onComplete]);

  return (
    <div className="flex gap-2">
      <TimeUnit value={timeLeft.days} label="Days" />
      <span className="text-2xl font-bold text-[#ff6b35]">:</span>
      <TimeUnit value={timeLeft.hours} label="Hrs" />
      <span className="text-2xl font-bold text-[#ff6b35]">:</span>
      <TimeUnit value={timeLeft.minutes} label="Min" />
      <span className="text-2xl font-bold text-[#ff6b35]">:</span>
      <TimeUnit value={timeLeft.seconds} label="Sec" />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="bg-gray-900 text-white rounded-lg w-14 h-14 flex items-center justify-center">
        <span className="text-2xl font-bold">{value.toString().padStart(2, '0')}</span>
      </div>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
}

// Compact countdown for product cards
export function CompactCountdown({ endDate }: { endDate: Date }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const diff = endDate.getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft('Ended');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s left`);
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <span className="text-sm text-red-600 font-medium">{timeLeft}</span>
  );
}

// Sale countdown banner
interface SaleCountdownBannerProps {
  title: string;
  endDate: Date;
  backgroundColor?: string;
  textColor?: string;
}

export function SaleCountdownBanner({ 
  title, 
  endDate, 
  backgroundColor = 'bg-gradient-to-r from-red-500 to-orange-500',
  textColor = 'text-white'
}: SaleCountdownBannerProps) {
  return (
    <div className={`${backgroundColor} ${textColor} py-3 px-4`}>
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
        <span className="font-bold text-lg">{title}</span>
        <CountdownTimer endDate={endDate} />
      </div>
    </div>
  );
}

// Progress indicator for free shipping
interface FreeShippingProgressProps {
  currentAmount: number;
  threshold: number;
}

export function FreeShippingProgress({ currentAmount, threshold }: FreeShippingProgressProps) {
  const progress = Math.min((currentAmount / threshold) * 100, 100);
  const remaining = threshold - currentAmount;
  const qualified = remaining <= 0;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      {qualified ? (
        <div className="flex items-center gap-2 text-green-700">
          <span className="text-xl">🎉</span>
          <span className="font-medium">You've qualified for FREE shipping!</span>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">
              Add <span className="font-bold text-green-700">{formatCurrency(remaining)}</span> more for FREE shipping
            </span>
            <span className="text-gray-500">{formatCurrency(currentAmount)} / {formatCurrency(threshold)}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}

// Stock countdown
interface StockCountdownProps {
  remaining: number;
  total?: number;
  showBar?: boolean;
}

export function StockCountdown({ remaining, total = 100, showBar = true }: StockCountdownProps) {
  const percentage = (remaining / total) * 100;
  
  if (remaining <= 0) {
    return (
      <div className="text-red-600 font-medium">
        Out of Stock
      </div>
    );
  }

  const urgencyLevel = percentage <= 10 ? 'critical' : percentage <= 25 ? 'low' : 'normal';
  
  const colors = {
    critical: 'bg-red-500 text-red-700',
    low: 'bg-orange-500 text-orange-700',
    normal: 'bg-green-500 text-green-700'
  };

  return (
    <div>
      <div className={`text-sm font-medium ${colors[urgencyLevel].split(' ')[1]}`}>
        {urgencyLevel === 'critical' && '🔥 '}
        Only {remaining} left in stock!
      </div>
      {showBar && (
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
          <div 
            className={`h-full rounded-full transition-all ${colors[urgencyLevel].split(' ')[0]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Visitors viewing counter
export function ViewersCount({ productId }: { productId: string }) {
  const [viewers, setViewers] = useState(0);

  useEffect(() => {
    // Simulate random viewers (in production, this would be real-time)
    const randomViewers = Math.floor(Math.random() * 20) + 5;
    setViewers(randomViewers);

    const interval = setInterval(() => {
      setViewers(v => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(3, v + change);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [productId]);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
      </span>
      <span>{viewers} people viewing this right now</span>
    </div>
  );
}

// Recent purchases notification
interface RecentPurchase {
  name: string;
  product: string;
  location: string;
  timeAgo: string;
}

export function RecentPurchasePopup({ purchases }: { purchases: RecentPurchase[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (purchases.length === 0) return;

    const showNext = () => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentIndex((i) => (i + 1) % purchases.length);
        }, 500);
      }, 4000);
    };

    // Start after delay
    const initialTimeout = setTimeout(showNext, 5000);
    
    // Then repeat
    const interval = setInterval(showNext, 20000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [purchases.length]);

  if (purchases.length === 0) return null;

  const current = purchases[currentIndex];

  return (
    <div className={`fixed bottom-24 left-4 z-40 bg-white rounded-lg shadow-lg border p-3 max-w-xs transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'
    }`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-xl">
          🛒
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-medium">{current.name}</span> from {current.location}
          </p>
          <p className="text-sm text-gray-600 truncate">purchased {current.product}</p>
          <p className="text-xs text-gray-400">{current.timeAgo}</p>
        </div>
      </div>
    </div>
  );
}
