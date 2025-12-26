'use client';

import { Package, Truck, CheckCircle, Clock, MapPin, CreditCard, Box, AlertCircle } from 'lucide-react';

interface TimelineEvent {
  id: string;
  status: string;
  title: string;
  description?: string;
  timestamp: string;
  location?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

const STATUS_CONFIG: Record<string, { icon: typeof Package; color: string; bgColor: string }> = {
  pending: { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100' },
  confirmed: { icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  paid: { icon: CreditCard, color: 'text-green-600', bgColor: 'bg-green-100' },
  processing: { icon: Box, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  shipped: { icon: Truck, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  out_for_delivery: { icon: MapPin, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  cancelled: { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
};

// Vertical timeline for order detail page
export function OrderTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="relative">
      {events.map((event, index) => {
        const config = STATUS_CONFIG[event.status] || STATUS_CONFIG.pending;
        const Icon = config.icon;
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative pl-10 pb-8">
            {/* Vertical line */}
            {!isLast && (
              <div className={`absolute left-4 top-8 w-0.5 h-full ${event.isCompleted ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
            
            {/* Icon */}
            <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
              event.isCurrent ? config.bgColor : event.isCompleted ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <Icon className={`h-4 w-4 ${event.isCurrent ? config.color : event.isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
            </div>

            {/* Content */}
            <div className={`${event.isCurrent ? 'bg-white border rounded-xl p-4 shadow-sm' : ''}`}>
              <div className="flex items-center gap-2">
                <h4 className={`font-medium ${event.isCurrent ? 'text-gray-900' : event.isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>
                  {event.title}
                </h4>
                {event.isCurrent && (
                  <span className="px-2 py-0.5 bg-[#ff6b35] text-white text-xs rounded-full">Current</span>
                )}
              </div>
              {event.description && (
                <p className="text-sm text-gray-500 mt-1">{event.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>{new Date(event.timestamp).toLocaleString()}</span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Horizontal progress tracker
export function OrderProgressTracker({ currentStatus }: { currentStatus: string }) {
  const steps = [
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Box },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Package },
  ];

  const currentIndex = steps.findIndex(s => s.key === currentStatus);

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative flex-1">
              {/* Connector line */}
              {index > 0 && (
                <div className={`absolute top-4 right-1/2 w-full h-0.5 -z-10 ${
                  isCompleted || isCurrent ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
              
              {/* Icon */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-500' : isCurrent ? 'bg-[#ff6b35]' : 'bg-gray-200'
              }`}>
                <Icon className={`h-4 w-4 ${isCompleted || isCurrent ? 'text-white' : 'text-gray-400'}`} />
              </div>
              
              {/* Label */}
              <span className={`mt-2 text-xs font-medium ${
                isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Mini timeline for order list
export function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  
  const labels: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
      <Icon className="h-4 w-4" />
      {labels[status] || status}
    </span>
  );
}

// Full order history card
export function OrderHistoryCard({ 
  orderNumber,
  date,
  status,
  total,
  itemCount,
  events 
}: { 
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  itemCount: number;
  events: TimelineEvent[];
}) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <p className="font-bold">Order #{orderNumber}</p>
          <p className="text-sm text-gray-500">{new Date(date).toLocaleDateString()} • {itemCount} item(s)</p>
        </div>
        <div className="text-right">
          <OrderStatusBadge status={status} />
          <p className="font-bold mt-1">R{(total / 100).toLocaleString()}</p>
        </div>
      </div>
      
      {/* Progress */}
      <div className="p-4 bg-gray-50">
        <OrderProgressTracker currentStatus={status} />
      </div>
      
      {/* Latest update */}
      {events.length > 0 && (
        <div className="p-4 border-t">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Latest: </span>
            {events[0].title} - {new Date(events[0].timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
