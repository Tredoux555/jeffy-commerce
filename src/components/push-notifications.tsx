'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, X, Check, ShoppingBag, Tag, Truck, Gift } from 'lucide-react';

// Check if browser supports notifications
const isSupported = () => typeof window !== 'undefined' && 'Notification' in window;

// Request permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isSupported()) return false;
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Send a notification
export function sendNotification(title: string, options?: NotificationOptions & { onClick?: () => void }) {
  if (!isSupported() || Notification.permission !== 'granted') return null;
  
  const notification = new Notification(title, {
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    ...options,
  });

  if (options?.onClick) {
    notification.onclick = () => {
      window.focus();
      options.onClick?.();
      notification.close();
    };
  }

  return notification;
}

// Notification types for e-commerce
export const NotificationTypes = {
  ORDER_CONFIRMED: (orderNumber: string) => sendNotification('Order Confirmed! 🎉', {
    body: `Your order #${orderNumber} has been confirmed.`,
    tag: 'order-confirmed',
  }),
  
  ORDER_SHIPPED: (orderNumber: string, trackingUrl?: string) => sendNotification('Your Order Has Shipped! 🚚', {
    body: `Order #${orderNumber} is on its way!`,
    tag: 'order-shipped',
    onClick: () => trackingUrl && window.open(trackingUrl, '_blank'),
  }),
  
  ORDER_DELIVERED: (orderNumber: string) => sendNotification('Order Delivered! 📦', {
    body: `Order #${orderNumber} has been delivered.`,
    tag: 'order-delivered',
  }),
  
  FLASH_SALE: (message: string, url?: string) => sendNotification('🔥 Flash Sale!', {
    body: message,
    tag: 'flash-sale',
    onClick: () => url && (window.location.href = url),
  }),
  
  BACK_IN_STOCK: (productName: string, url?: string) => sendNotification('Back in Stock! 🎁', {
    body: `${productName} is available again!`,
    tag: 'back-in-stock',
    onClick: () => url && (window.location.href = url),
  }),
  
  PRICE_DROP: (productName: string, newPrice: string) => sendNotification('Price Drop! 💰', {
    body: `${productName} is now ${newPrice}`,
    tag: 'price-drop',
  }),
  
  WANT_REACHED: (productName: string) => sendNotification('Your Want Reached 10! 🎉', {
    body: `${productName} hit the target! You get it FREE!`,
    tag: 'want-reached',
  }),
};

// Permission status hook
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isSupported());
    if (isSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  const request = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? 'granted' : 'denied');
    return granted;
  };

  return { permission, supported, request };
}

// Enable notifications prompt component
export function EnableNotificationsPrompt() {
  const { permission, supported, request } = useNotificationPermission();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('notifications-dismissed');
    if (wasDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('notifications-dismissed', 'true');
  };

  if (!supported || permission === 'granted' || permission === 'denied' || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-xl border p-4 z-50 animate-in slide-in-from-bottom">
      <button onClick={handleDismiss} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <X className="h-5 w-5" />
      </button>
      
      <div className="flex gap-4">
        <div className="p-3 bg-[#ff6b35]/10 rounded-xl">
          <Bell className="h-6 w-6 text-[#ff6b35]" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900">Stay Updated!</h3>
          <p className="text-sm text-gray-600 mt-1">Get notified about order updates, flash sales, and exclusive deals.</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={request}
              className="flex-1 bg-[#ff6b35] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Enable Notifications
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

// Notification preferences panel
export function NotificationPreferences() {
  const { permission, supported, request } = useNotificationPermission();
  const [prefs, setPrefs] = useState({
    orders: true,
    shipping: true,
    deals: true,
    backInStock: true,
    priceDrops: true,
    wants: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('notification-prefs');
    if (saved) setPrefs(JSON.parse(saved));
  }, []);

  const updatePref = (key: keyof typeof prefs) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(newPrefs);
    localStorage.setItem('notification-prefs', JSON.stringify(newPrefs));
  };

  if (!supported) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
        <BellOff className="h-8 w-8 mx-auto mb-2" />
        <p>Your browser doesn't support notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-gray-500" />
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-gray-500">
              {permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not enabled'}
            </p>
          </div>
        </div>
        {permission !== 'granted' && (
          <button
            onClick={request}
            className="bg-[#ff6b35] text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Enable
          </button>
        )}
        {permission === 'granted' && <Check className="h-5 w-5 text-green-500" />}
      </div>

      {permission === 'granted' && (
        <div className="space-y-2">
          <PreferenceToggle icon={ShoppingBag} label="Order updates" checked={prefs.orders} onChange={() => updatePref('orders')} />
          <PreferenceToggle icon={Truck} label="Shipping updates" checked={prefs.shipping} onChange={() => updatePref('shipping')} />
          <PreferenceToggle icon={Tag} label="Flash sales & deals" checked={prefs.deals} onChange={() => updatePref('deals')} />
          <PreferenceToggle icon={Bell} label="Back in stock alerts" checked={prefs.backInStock} onChange={() => updatePref('backInStock')} />
          <PreferenceToggle icon={Gift} label="Price drop alerts" checked={prefs.priceDrops} onChange={() => updatePref('priceDrops')} />
          <PreferenceToggle icon={Gift} label="Want updates" checked={prefs.wants} onChange={() => updatePref('wants')} />
        </div>
      )}
    </div>
  );
}

function PreferenceToggle({ icon: Icon, label, checked, onChange }: { icon: any; label: string; checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-gray-400" />
        <span className="text-sm">{label}</span>
      </div>
      <div className={`w-10 h-6 rounded-full transition ${checked ? 'bg-[#ff6b35]' : 'bg-gray-300'}`}>
        <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${checked ? 'translate-x-4.5 ml-4' : 'translate-x-0.5 ml-0.5'}`} />
      </div>
    </button>
  );
}
