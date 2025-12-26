'use client';

import { Truck, MapPin, Clock, Check } from 'lucide-react';

interface DeliveryEstimateProps {
  inStock?: boolean;
  processingDays?: number;
  deliveryDays?: number;
}

export function DeliveryEstimate({ 
  inStock = true, 
  processingDays = 2,
  deliveryDays = 5 
}: DeliveryEstimateProps) {
  const getDeliveryDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const totalDays = processingDays + deliveryDays;
  const deliveryDate = getDeliveryDate(totalDays);
  const latestDate = getDeliveryDate(totalDays + 2);

  if (!inStock) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <Clock className="h-5 w-5 text-gray-400" />
        <div>
          <p className="font-medium text-gray-700">Currently out of stock</p>
          <p className="text-sm text-gray-500">Sign up to be notified when available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
        <Check className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-medium text-green-800">In Stock</p>
          <p className="text-sm text-green-600">Ready to ship</p>
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
        <Truck className="h-5 w-5 text-[#ff6b35] mt-0.5" />
        <div>
          <p className="font-medium text-gray-900">
            Estimated Delivery: {deliveryDate} - {latestDate}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Order within <span className="font-medium text-[#ff6b35]">{getTimeUntilCutoff()}</span> for fastest delivery
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <MapPin className="h-4 w-4" />
        <span>Free delivery on orders over R500</span>
      </div>
    </div>
  );
}

function getTimeUntilCutoff() {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(14, 0, 0, 0); // 2 PM cutoff

  if (now > cutoff) {
    // Next day cutoff
    cutoff.setDate(cutoff.getDate() + 1);
  }

  const diff = cutoff.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins} minutes`;
}

// Shipping tiers display
export function ShippingTiers() {
  const tiers = [
    { name: 'Standard', price: 'R65', days: '5-7 days' },
    { name: 'Express', price: 'R120', days: '2-3 days' },
    { name: 'Same Day', price: 'R200', days: 'Today', note: 'Order by 11am' },
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Delivery Options</p>
      {tiers.map((tier) => (
        <div key={tier.name} className="flex items-center justify-between p-3 border rounded-lg hover:border-[#ff6b35] cursor-pointer transition">
          <div>
            <p className="font-medium">{tier.name}</p>
            <p className="text-xs text-gray-500">{tier.days} {tier.note && `• ${tier.note}`}</p>
          </div>
          <span className="font-semibold text-[#ff6b35]">{tier.price}</span>
        </div>
      ))}
    </div>
  );
}
