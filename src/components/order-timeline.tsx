'use client';

import { Check, Package, Truck, Home, Clock } from 'lucide-react';

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt: string;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

const steps = [
  { key: 'paid', label: 'Order Placed', icon: Check },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const statusIndex: Record<OrderStatus, number> = {
  pending: -1,
  paid: 0,
  processing: 1,
  shipped: 2,
  out_for_delivery: 2,
  delivered: 3,
  cancelled: -2,
};

export function OrderTimeline({ status, createdAt, paidAt, shippedAt, deliveredAt }: OrderTimelineProps) {
  const currentIndex = statusIndex[status] ?? -1;

  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p className="text-red-600 font-medium">Order Cancelled</p>
      </div>
    );
  }

  const getDate = (step: string) => {
    switch (step) {
      case 'paid': return paidAt || createdAt;
      case 'shipped': return shippedAt;
      case 'delivered': return deliveredAt;
      default: return null;
    }
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
          <div 
            className="h-full bg-[#ff6b35] transition-all duration-500"
            style={{ width: `${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}%` }}
          />
        </div>

        {steps.map((step, index) => {
          const isComplete = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;
          const date = getDate(step.key);

          return (
            <div key={step.key} className="flex flex-col items-center z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isComplete 
                  ? 'bg-[#ff6b35] text-white' 
                  : 'bg-gray-200 text-gray-400'
              } ${isCurrent ? 'ring-4 ring-orange-200' : ''}`}>
                {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <p className={`text-xs mt-2 font-medium ${isComplete ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </p>
              {date && (
                <p className="text-xs text-gray-500">
                  {new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Current Status Message */}
      <div className="mt-6 p-4 bg-orange-50 rounded-lg flex items-center gap-3">
        <Clock className="h-5 w-5 text-[#ff6b35]" />
        <div>
          <p className="font-medium text-gray-900">
            {status === 'pending' && 'Awaiting Payment'}
            {status === 'paid' && 'Order Confirmed!'}
            {status === 'processing' && 'Being Prepared'}
            {status === 'shipped' && 'On the Way!'}
            {status === 'out_for_delivery' && 'Out for Delivery!'}
            {status === 'delivered' && 'Delivered!'}
          </p>
          <p className="text-sm text-gray-600">
            {status === 'pending' && 'Complete payment to process your order'}
            {status === 'paid' && 'We\'re getting your order ready'}
            {status === 'processing' && 'Your items are being packed'}
            {status === 'shipped' && 'Your package is on its way to you'}
            {status === 'out_for_delivery' && 'Your package will arrive today'}
            {status === 'delivered' && 'Your order has been delivered'}
          </p>
        </div>
      </div>
    </div>
  );
}
