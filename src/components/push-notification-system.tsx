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

// Send a browser notification
export function sendNotification(title: string, options?: NotificationOptions) {
  if (!isPushSupported() || Notification.permission !== 'granted') return;
  
  new Notification(title, {
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    ...options,
  });
}

// Hook for managing notification state
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isPushSupported());
    if (isPushSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  const request = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    return result;
  };

  return { permission, supported, request };
}

// Notification permission prompt component
export function NotificationPrompt({ onClose }: { onClose: () => void }) {
  const { permission, supported, request } = useNotifications();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('notificationPromptDismissed');
    if (wasDismissed) setDismissed(true);
  }, []);

  const handleEnable = async () => {
    const result = await request();
    if (result === 'granted') {
      sendNotification('Notifications Enabled! 🔔', {
        body: "You'll now receive updates about your orders and deals.",
      });
    }
    onClose();
  };

  const handleDismiss = () => {
    localStorage.setItem('notificationPromptDismissed', 'true');
    setDismissed(true);
    onClose();
  };

  if (!supported || permission === 'granted' || permission === 'denied' || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-lg border p-4 z-50 animate-in slide-in-from-bottom">
      <button onClick={handleDismiss} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <X className="h-5 w-5" />
      </button>
      
      <div className="flex gap-4">
        <div className="p-3 bg-orange-100 rounded-xl">
          <Bell className="h-6 w-6 text-[#ff6b35]" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">Stay Updated!</h3>
          <p className="text-sm text-gray-600 mt-1">Get notified about order updates, flash sales, and exclusive deals.</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleEnable}
              className="flex-1 bg-[#ff6b35] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
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
  const { permission, supported, request } = useNotifications();

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
      {permission === 'default' && (
        <button
          onClick={request}
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

// Helper to notify on specific events
export const notifyOrderUpdate = (orderNumber: string, status: string) => {
  sendNotification(`Order #${orderNumber} Update`, {
    body: `Your order is now: ${status}`,
    tag: `order-${orderNumber}`,
  });
};

export const notifyFlashSale = (productName: string, discount: number) => {
  sendNotification('🔥 Flash Sale Alert!', {
    body: `${productName} is now ${discount}% off!`,
    tag: 'flash-sale',
  });
};

export const notifyBackInStock = (productName: string) => {
  sendNotification('Back in Stock! 📦', {
    body: `${productName} is available again.`,
    tag: 'back-in-stock',
  });
};
