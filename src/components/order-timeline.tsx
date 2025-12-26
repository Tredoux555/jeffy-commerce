'use client';

import { Check, Package, Truck, Home, PartyPopper } from 'lucide-react';

interface OrderTimelineProps {
  status: string;
  createdAt: string;
  paidAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

const steps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'paid', label: 'Payment Confirmed', icon: Check },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const statusOrder = ['pending', 'paid', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export function OrderTimeline({ status, createdAt, paidAt, shippedAt, deliveredAt }: OrderTimelineProps) {
  const currentIndex = statusOrder.indexOf(status);
  
  const getStepStatus = (stepKey: string) => {
    const stepIndex = statusOrder.indexOf(stepKey);
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimestamp = (stepKey: string) => {
    switch (stepKey) {
      case 'pending': return formatDate(createdAt);
      case 'paid': return formatDate(paidAt);
      case 'shipped': return formatDate(shippedAt);
      case 'delivered': return formatDate(deliveredAt);
      default: return null;
    }
  };

  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p className="text-red-600 font-medium">Order Cancelled</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="relative">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.key);
          const timestamp = getTimestamp(step.key);
          const Icon = step.icon;
          
          return (
            <div key={step.key} className="flex items-start mb-6 last:mb-0">
              {/* Line */}
              {index < steps.length - 1 && (
                <div className={`absolute left-5 mt-10 w-0.5 h-12 ${
                  stepStatus === 'complete' ? 'bg-green-500' : 'bg-gray-200'
                }`} style={{ top: `${index * 72}px` }} />
              )}
              
              {/* Icon */}
              <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                stepStatus === 'complete' ? 'bg-green-500 text-white' :
                stepStatus === 'current' ? 'bg-[#ff6b35] text-white animate-pulse' :
                'bg-gray-200 text-gray-400'
              }`}>
                {stepStatus === 'complete' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              
              {/* Content */}
              <div className="ml-4 flex-1">
                <p className={`font-medium ${
                  stepStatus === 'upcoming' ? 'text-gray-400' : 'text-gray-900'
                }`}>
                  {step.label}
                </p>
                {timestamp && (
                  <p className="text-sm text-gray-500">{timestamp}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {status === 'delivered' && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <PartyPopper className="h-8 w-8 text-green-500" />
          <div>
            <p className="font-medium text-green-800">Order Delivered!</p>
            <p className="text-sm text-green-600">Thank you for shopping with Jeffy</p>
          </div>
        </div>
      )}
    </div>
  );
}
