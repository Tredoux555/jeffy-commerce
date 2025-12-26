'use client';

import { Truck, Clock } from 'lucide-react';

interface DeliveryEstimateProps {
  inStock: boolean;
}

export function DeliveryEstimate({ inStock }: DeliveryEstimateProps) {
  // Calculate delivery estimate
  const today = new Date();
  const orderBy = new Date(today);
  orderBy.setHours(14, 0, 0, 0); // 2 PM cutoff
  
  const isBeforeCutoff = today < orderBy;
  
  // Delivery in 2-5 business days
  const minDays = isBeforeCutoff ? 2 : 3;
  const maxDays = isBeforeCutoff ? 5 : 6;
  
  const minDate = new Date(today);
  const maxDate = new Date(today);
  
  // Skip weekends
  let daysAdded = 0;
  while (daysAdded < minDays) {
    minDate.setDate(minDate.getDate() + 1);
    if (minDate.getDay() !== 0 && minDate.getDay() !== 6) daysAdded++;
  }
  
  daysAdded = 0;
  while (daysAdded < maxDays) {
    maxDate.setDate(maxDate.getDate() + 1);
    if (maxDate.getDay() !== 0 && maxDate.getDay() !== 6) daysAdded++;
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  if (!inStock) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Clock className="h-4 w-4" />
        <span>Currently out of stock</span>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
      <div className="flex items-center gap-2 text-blue-700">
        <Truck className="h-5 w-5" />
        <div>
          <p className="font-medium text-sm">
            Get it {formatDate(minDate)} - {formatDate(maxDate)}
          </p>
          {isBeforeCutoff && (
            <p className="text-xs text-blue-600">
              Order within {Math.floor((orderBy.getTime() - today.getTime()) / (1000 * 60 * 60))} hours for faster delivery
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
