'use client';

import { Package, CreditCard, Truck, CheckCircle, Clock, MapPin, AlertCircle, RefreshCw } from 'lucide-react';

interface TimelineEvent {
  id: string;
  status: string;
  title: string;
  description?: string;
  timestamp: string;
  location?: string;
}

const STATUS_CONFIG: Record<string, { icon: any; color: string; bgColor: string }> = {
  pending: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  payment_received: { icon: CreditCard, color: 'text-green-600', bgColor: 'bg-green-100' },
  processing: { icon: RefreshCw, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  packed: { icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  shipped: { icon: Truck, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  out_for_delivery: { icon: MapPin, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  cancelled: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
  refunded: { icon: RefreshCw, color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

export function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p>No tracking information yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {events.map((event, index) => {
          const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.pending;
          const Icon = config.icon;
          const isLatest = index === 0;

          return (
            <div key={event.id} className="relative flex gap-4">
              {/* Icon */}
              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor} ${isLatest ? 'ring-4 ring-white shadow-lg' : ''}`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>

              {/* Content */}
              <div className={`flex-1 pb-4 ${isLatest ? '' : 'opacity-70'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className={`font-semibold ${isLatest ? 'text-gray-900' : 'text-gray-600'}`}>
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    )}
                    {event.location && (
                      <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {event.location}
                      </p>
                    )}
                  </div>
                  <time className="text-sm text-gray-400 whitespace-nowrap">
                    {formatEventTime(event.timestamp)}
                  </time>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatEventTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' });
}

// Compact horizontal timeline
export function OrderTimelineCompact({ currentStatus }: { currentStatus: string }) {
  const steps = [
    { status: 'pending', label: 'Ordered' },
    { status: 'processing', label: 'Processing' },
    { status: 'shipped', label: 'Shipped' },
    { status: 'delivered', label: 'Delivered' },
  ];

  const currentIndex = steps.findIndex(s => s.status === currentStatus);
  const isCancelled = currentStatus === 'cancelled' || currentStatus === 'refunded';

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium capitalize">{currentStatus.replace('_', ' ')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full">
      {steps.map((step, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const config = STATUS_CONFIG[step.status];
        const Icon = config.icon;

        return (
          <div key={step.status} className="flex-1 flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isComplete ? config.bgColor : 'bg-gray-100'
              } ${isCurrent ? 'ring-4 ring-[#ff6b35]/20' : ''}`}>
                <Icon className={`h-5 w-5 ${isComplete ? config.color : 'text-gray-400'}`} />
              </div>
              <span className={`text-xs mt-2 ${isComplete ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded ${
                index < currentIndex ? 'bg-[#ff6b35]' : 'bg-gray-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Order status badge
export function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  const labels: Record<string, string> = {
    pending: 'Pending Payment',
    payment_received: 'Paid',
    processing: 'Processing',
    packed: 'Packed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
      <Icon className="h-4 w-4" />
      {labels[status] || status}
    </span>
  );
}
