'use client';

import { Package, CreditCard, Truck, MapPin, CheckCircle, Clock, AlertCircle, Phone } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'created' | 'paid' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  title: string;
  description?: string;
  timestamp: string;
  location?: string;
}

interface OrderTimelineProps {
  events: TimelineEvent[];
  currentStatus: string;
}

const eventConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  created: { icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  paid: { icon: CreditCard, color: 'text-green-500', bgColor: 'bg-green-100' },
  processing: { icon: Package, color: 'text-amber-500', bgColor: 'bg-amber-100' },
  shipped: { icon: Truck, color: 'text-purple-500', bgColor: 'bg-purple-100' },
  out_for_delivery: { icon: MapPin, color: 'text-orange-500', bgColor: 'bg-orange-100' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  cancelled: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-100' },
  refunded: { icon: CreditCard, color: 'text-gray-500', bgColor: 'bg-gray-100' },
};

export function OrderTimeline({ events, currentStatus }: OrderTimelineProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }),
      time: date.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="relative">
      {events.map((event, index) => {
        const config = eventConfig[event.type] || eventConfig.created;
        const Icon = config.icon;
        const { date, time } = formatDate(event.timestamp);
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="flex gap-4 pb-6 last:pb-0">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${config.color}`} />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-gray-200 my-2" />
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {event.location}
                    </p>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{date}</p>
                  <p>{time}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Compact order progress bar
interface OrderProgressProps {
  status: 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';
  estimatedDelivery?: string;
}

export function OrderProgressBar({ status, estimatedDelivery }: OrderProgressProps) {
  const steps = [
    { key: 'pending', label: 'Order Placed', icon: CreditCard },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const currentIdx = steps.findIndex(s => s.key === status);

  return (
    <div className="bg-white rounded-xl border p-6">
      {/* Progress steps */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isComplete = i <= currentIdx;
          const isCurrent = i === currentIdx;

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                  isComplete 
                    ? isCurrent 
                      ? 'bg-[#ff6b35] text-white ring-4 ring-orange-100' 
                      : 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`text-xs mt-2 text-center ${isCurrent ? 'font-medium text-[#ff6b35]' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${i < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Estimated delivery */}
      {estimatedDelivery && status !== 'delivered' && (
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-sm text-gray-500">Estimated Delivery</p>
          <p className="font-bold text-lg">{estimatedDelivery}</p>
        </div>
      )}

      {status === 'delivered' && (
        <div className="mt-4 pt-4 border-t text-center">
          <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Delivered Successfully</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Live tracking card
interface LiveTrackingProps {
  trackingNumber: string;
  carrier: string;
  status: string;
  lastUpdate: string;
  driverName?: string;
  driverPhone?: string;
}

export function LiveTrackingCard({ trackingNumber, carrier, status, lastUpdate, driverName, driverPhone }: LiveTrackingProps) {
  return (
    <div className="bg-gradient-to-br from-[#ff6b35] to-orange-600 rounded-xl p-6 text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/80 text-sm">Tracking Number</p>
          <p className="font-mono font-bold">{trackingNumber}</p>
        </div>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{carrier}</span>
      </div>

      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <p className="text-white/80 text-sm mb-1">Current Status</p>
        <p className="font-bold text-lg">{status}</p>
        <p className="text-white/60 text-sm mt-1">Last updated: {lastUpdate}</p>
      </div>

      {driverName && (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Your Driver</p>
            <p className="font-medium">{driverName}</p>
          </div>
          {driverPhone && (
            <a
              href={`tel:${driverPhone}`}
              className="bg-white text-[#ff6b35] p-3 rounded-full hover:bg-orange-50 transition"
            >
              <Phone className="h-5 w-5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
