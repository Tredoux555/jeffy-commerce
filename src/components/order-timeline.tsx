'use client';

import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';

type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

const steps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'paid', label: 'Payment Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const statusOrder: Record<OrderStatus, number> = {
  pending: 0,
  paid: 1,
  processing: 2,
  shipped: 3,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: -1,
};

export function OrderTimeline({ status, createdAt, paidAt, shippedAt, deliveredAt }: OrderTimelineProps) {
  const currentStep = statusOrder[status];

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
        <XCircle className="h-8 w-8 text-red-500" />
        <div>
          <p className="font-semibold text-red-700">Order Cancelled</p>
          <p className="text-sm text-red-600">This order has been cancelled</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCompleted = index <= currentStep;
        const isCurrent = index === currentStep;
        const Icon = step.icon;

        let timestamp = '';
        if (step.key === 'pending') timestamp = createdAt;
        else if (step.key === 'paid' && paidAt) timestamp = paidAt;
        else if (step.key === 'shipped' && shippedAt) timestamp = shippedAt;
        else if (step.key === 'delivered' && deliveredAt) timestamp = deliveredAt;

        return (
          <div key={step.key} className="flex items-start gap-4">
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              isCompleted 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-400'
            } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}>
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-4 border-b last:border-b-0">
              <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </p>
              {timestamp && (
                <p className="text-sm text-gray-500">
                  {new Date(timestamp).toLocaleDateString('en-ZA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
              {isCurrent && !isCompleted && (
                <p className="text-sm text-orange-600 font-medium mt-1">In progress...</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
