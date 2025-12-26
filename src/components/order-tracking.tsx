'use client';

import { Package, CheckCircle, Truck, MapPin, Clock, AlertCircle } from 'lucide-react';

type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

interface TrackingEvent {
  status: OrderStatus;
  title: string;
  description?: string;
  timestamp: string;
  location?: string;
}

interface OrderTrackingProps {
  currentStatus: OrderStatus;
  events: TrackingEvent[];
  orderNumber: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  carrier?: string;
}

const statusConfig: Record<OrderStatus, { icon: React.ReactNode; color: string; label: string }> = {
  pending: {
    icon: <Clock className="h-5 w-5" />,
    color: 'text-gray-500 bg-gray-100',
    label: 'Order Placed'
  },
  confirmed: {
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-blue-500 bg-blue-100',
    label: 'Confirmed'
  },
  processing: {
    icon: <Package className="h-5 w-5" />,
    color: 'text-orange-500 bg-orange-100',
    label: 'Processing'
  },
  shipped: {
    icon: <Truck className="h-5 w-5" />,
    color: 'text-purple-500 bg-purple-100',
    label: 'Shipped'
  },
  out_for_delivery: {
    icon: <Truck className="h-5 w-5" />,
    color: 'text-[#ff6b35] bg-orange-100',
    label: 'Out for Delivery'
  },
  delivered: {
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-green-500 bg-green-100',
    label: 'Delivered'
  },
  cancelled: {
    icon: <AlertCircle className="h-5 w-5" />,
    color: 'text-red-500 bg-red-100',
    label: 'Cancelled'
  }
};

const statusOrder: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'
];

export function OrderTrackingTimeline({ 
  currentStatus, 
  events, 
  orderNumber,
  estimatedDelivery,
  trackingNumber,
  carrier
}: OrderTrackingProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Order #{orderNumber}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[currentStatus].color}`}>
            {statusConfig[currentStatus].label}
          </span>
        </div>
        {trackingNumber && (
          <p className="text-sm">
            <span className="text-gray-600">Tracking: </span>
            <span className="font-mono font-medium">{trackingNumber}</span>
            {carrier && <span className="text-gray-500"> ({carrier})</span>}
          </p>
        )}
        {estimatedDelivery && currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
          <p className="text-sm mt-1">
            <span className="text-gray-600">Estimated Delivery: </span>
            <span className="font-medium">{estimatedDelivery}</span>
          </p>
        )}
      </div>

      {/* Progress Bar */}
      {!isCancelled && (
        <div className="relative">
          <div className="flex justify-between mb-2">
            {statusOrder.slice(0, -1).map((status, i) => {
              const isComplete = i <= currentIndex;
              const isCurrent = i === currentIndex;
              const config = statusConfig[status];
              
              return (
                <div key={status} className="flex flex-col items-center z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isComplete ? config.color : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-offset-2 ring-orange-200' : ''}`}>
                    {config.icon}
                  </div>
                  <span className={`text-xs mt-2 text-center ${isComplete ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0" style={{ margin: '0 40px' }}>
            <div 
              className="h-full bg-[#ff6b35] transition-all duration-500"
              style={{ width: `${(currentIndex / (statusOrder.length - 2)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Timeline Events */}
      <div className="space-y-0">
        <h3 className="font-medium mb-4">Tracking History</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          {events.map((event, i) => {
            const config = statusConfig[event.status];
            const isLatest = i === 0;
            
            return (
              <div key={i} className="relative flex gap-4 pb-6">
                {/* Icon */}
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isLatest ? config.color : 'bg-gray-100 text-gray-400'
                }`}>
                  {config.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-medium ${isLatest ? '' : 'text-gray-600'}`}>
                        {event.title}
                      </p>
                      {event.description && (
                        <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>
                      )}
                      {event.location && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-4">
                      {event.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Simple horizontal status bar
export function OrderStatusBar({ status }: { status: OrderStatus }) {
  const config = statusConfig[status];
  const currentIndex = statusOrder.indexOf(status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.color}`}>
        {config.icon}
        <span className="font-medium text-sm">{config.label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {statusOrder.slice(0, -1).map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`w-2 h-2 rounded-full ${
            i <= currentIndex ? 'bg-[#ff6b35]' : 'bg-gray-300'
          }`} />
          {i < statusOrder.length - 2 && (
            <div className={`w-8 h-0.5 ${
              i < currentIndex ? 'bg-[#ff6b35]' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
      <span className={`ml-2 text-sm font-medium ${statusConfig[status].color.split(' ')[0]}`}>
        {config.label}
      </span>
    </div>
  );
}
