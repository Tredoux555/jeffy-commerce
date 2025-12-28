'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, X, Check } from 'lucide-react';

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied';
  return await Notification.requestPermission();
}

// Send a local notification
export function sendNotification(title: string, options?: NotificationOptions) {
  if (!isPushSupported() || Notification.permission !== 'granted') return;
  
  new Notification(title, {
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    ...options,
  });
}

// Hook for notification state
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isPushSupported());
    if (isPushSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  };

  return { permission, supported, requestPermission };
}

// Notification prompt component
export function NotificationPrompt({ onClose }: { onClose: () => void }) {
  const { permission, supported, requestPermission } = useNotifications();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('notif-prompt-dismissed');
    if (wasDismissed) setDismissed(true);
  }, []);

  if (!supported || permission === 'granted' || dismissed) return null;

  const handleEnable = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      sendNotification('Notifications Enabled! 🔔', {
        body: "You'll receive updates about your orders and exclusive deals.",
      });
    }
    onClose();
  };

  const handleDismiss = () => {
    localStorage.setItem('notif-prompt-dismissed', 'true');
    setDismissed(true);
    onClose();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-white rounded-xl shadow-xl border p-4 animate-in slide-in-from-bottom">
      <button onClick={handleDismiss} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <X className="h-5 w-5" />
      </button>
      
      <div className="flex gap-4">
        <div className="p-3 bg-[#ff6b35]/10 rounded-xl">
          <Bell className="h-6 w-6 text-[#ff6b35]" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold mb-1">Stay Updated!</h3>
          <p className="text-sm text-gray-600 mb-3">
            Get notified about order updates and exclusive deals.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              className="flex-1 bg-[#ff6b35] text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600"
            >
              Enable
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification toggle for settings
export function NotificationToggle() {
  const { permission, supported, requestPermission } = useNotifications();

  if (!supported) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <BellOff className="h-5 w-5 text-gray-400" />
          <span className="text-gray-500">Notifications not supported</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        {permission === 'granted' ? (
          <Bell className="h-5 w-5 text-green-500" />
        ) : (
          <BellOff className="h-5 w-5 text-gray-400" />
        )}
        <div>
          <p className="font-medium">Push Notifications</p>
          <p className="text-sm text-gray-500">
            {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked in browser' : 'Not enabled'}
          </p>
        </div>
      </div>
      
      {permission !== 'granted' && permission !== 'denied' && (
        <button
          onClick={requestPermission}
          className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg text-sm font-medium hover:bg-orange-600"
        >
          Enable
        </button>
      )}
      
      {permission === 'granted' && (
        <Check className="h-5 w-5 text-green-500" />
      )}
    </div>
  );
}

// Order notification helpers
export const OrderNotifications = {
  confirmed: (orderNumber: string) => {
    sendNotification('Order Confirmed! ✅', {
      body: `Your order #${orderNumber} has been confirmed.`,
      tag: `order-${orderNumber}`,
    });
  },
  
  shipped: (orderNumber: string, trackingNumber?: string) => {
    sendNotification('Order Shipped! 🚚', {
      body: `Your order #${orderNumber} is on its way!${trackingNumber ? ` Track: ${trackingNumber}` : ''}`,
      tag: `order-${orderNumber}`,
    });
  },
  
  delivered: (orderNumber: string) => {
    sendNotification('Order Delivered! 📦', {
      body: `Your order #${orderNumber} has been delivered.`,
      tag: `order-${orderNumber}`,
    });
  },
  
  flashSale: (productName: string, discount: number) => {
    sendNotification('Flash Sale! ⚡', {
      body: `${productName} is ${discount}% off for a limited time!`,
      tag: 'flash-sale',
    });
  },
  
  priceDropped: (productName: string) => {
    sendNotification('Price Drop Alert! 💰', {
      body: `${productName} from your wishlist just dropped in price!`,
      tag: 'price-drop',
    });
  },
};
