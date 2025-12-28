'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';

interface Purchase {
  name: string;
  product: string;
  location: string;
  time: string;
}

// Fake recent purchases for social proof
const fakePurchases: Purchase[] = [
  { name: 'Thabo M.', product: 'Stanley Tumbler', location: 'Johannesburg', time: '2 mins ago' },
  { name: 'Naledi K.', product: 'Wireless Earbuds', location: 'Cape Town', time: '5 mins ago' },
  { name: 'Sipho N.', product: 'LED Strip Lights', location: 'Durban', time: '8 mins ago' },
  { name: 'Lerato P.', product: 'Phone Case', location: 'Pretoria', time: '12 mins ago' },
  { name: 'Mandla T.', product: 'Portable Blender', location: 'Soweto', time: '15 mins ago' },
  { name: 'Zanele M.', product: 'Mini Projector', location: 'Port Elizabeth', time: '18 mins ago' },
  { name: 'Bongani S.', product: 'Smart Watch', location: 'Bloemfontein', time: '22 mins ago' },
  { name: 'Nomsa D.', product: 'Ring Light', location: 'East London', time: '25 mins ago' },
];

export function SocialProofNotifications() {
  const [current, setCurrent] = useState<Purchase | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show first notification after 5 seconds
    const initialDelay = setTimeout(() => {
      showNotification();
    }, 5000);

    return () => clearTimeout(initialDelay);
  }, []);

  const showNotification = () => {
    const purchase = fakePurchases[Math.floor(Math.random() * fakePurchases.length)];
    setCurrent(purchase);
    setVisible(true);

    // Hide after 5 seconds
    setTimeout(() => {
      setVisible(false);
      
      // Show next after random interval (30-60 seconds)
      const nextDelay = 30000 + Math.random() * 30000;
      setTimeout(showNotification, nextDelay);
    }, 5000);
  };

  if (!visible || !current) return null;

  return (
    <div className="fixed bottom-24 left-4 z-40 animate-slide-up lg:bottom-4">
      <div className="bg-white rounded-xl shadow-2xl border p-4 max-w-xs flex items-start gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <span className="font-semibold">{current.name}</span> from {current.location}
          </p>
          <p className="text-sm text-gray-600 truncate">
            just bought <span className="font-medium">{current.product}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">{current.time}</p>
        </div>
        <button 
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Visitor count badge
export function VisitorCount({ count = 0 }: { count?: number }) {
  const [visitors, setVisitors] = useState(count || Math.floor(Math.random() * 50) + 10);

  useEffect(() => {
    // Fluctuate visitor count
    const interval = setInterval(() => {
      setVisitors(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        return Math.max(5, prev + change);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span className="text-gray-600">
        <span className="font-semibold text-gray-900">{visitors}</span> people viewing this
      </span>
    </div>
  );
}

// Recent sales count
export function RecentSales({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2 text-sm bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full">
      <span className="font-bold">🔥 {count}</span>
      <span>sold in last 24 hours</span>
    </div>
  );
}
