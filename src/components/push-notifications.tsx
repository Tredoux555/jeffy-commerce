'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';

// Check if push is supported
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

// Request permission
export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied';
  return await Notification.requestPermission();
}

// Show a local notification
export function showNotification(title: string, options?: NotificationOptions): void {
  if (!isPushSupported() || Notification.permission !== 'granted') return;
  
  new Notification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    ...options,
  });
}

// Push notification prompts
const NOTIFICATION_TYPES = {
  orderUpdate: { title: 'Order Updates', description: 'Get notified when your order ships or delivers' },
  newProducts: { title: 'New Products', description: 'Be the first to know about new arrivals' },
  sales: { title: 'Sales & Deals', description: 'Never miss a flash sale or discount' },
  wantUpdates: { title: 'Want Updates', description: 'Know when your wants get more agrees' },
};

// Push Permission Prompt Component
export function PushPermissionPrompt({ onClose }: { onClose: () => void }) {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (isPushSupported()) {
      setPermission(Notification.permission);
    }
  }, []);

  const handleEnable = async () => {
    const result = await requestPushPermission();
    setPermission(result);
    if (result === 'granted') {
      showNotification('Notifications Enabled! 🔔', {
        body: 'You\'ll now receive updates about your orders and deals.',
      });
      onClose();
    }
  };

  if (permission === 'granted' || permission === 'denied') return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-2xl border p-6 z-50 animate-slide-up">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
        <X className="h-5 w-5" />
      </button>
      
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[#ff6b35]/10 rounded-xl">
          <Bell className="h-6 w-6 text-[#ff6b35]" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">Stay Updated!</h3>
          <p className="text-gray-600 text-sm mt-1">
            Get instant notifications for order updates, deals, and more.
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          className="flex-1 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
        >
          Maybe Later
        </button>
        <button
          onClick={handleEnable}
          className="flex-1 py-2 bg-[#ff6b35] text-white rounded-lg font-medium hover:bg-orange-600"
        >
          Enable
        </button>
      </div>
    </div>
  );
}

// Notification Settings Component
export function NotificationSettings() {
  const [settings, setSettings] = useState({
    orderUpdate: true,
    newProducts: true,
    sales: true,
    wantUpdates: true,
  });
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (isPushSupported()) {
      setPermission(Notification.permission);
      // Load saved settings from localStorage
      const saved = localStorage.getItem('notificationSettings');
      if (saved) setSettings(JSON.parse(saved));
    }
  }, []);

  const handleToggle = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const handleEnableAll = async () => {
    const result = await requestPushPermission();
    setPermission(result);
  };

  if (!isPushSupported()) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
        Push notifications are not supported in your browser.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="font-bold">Notification Preferences</h3>
      </div>

      {permission !== 'granted' ? (
        <div className="p-6 text-center">
          <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">Enable notifications to customize your preferences</p>
          <button onClick={handleEnableAll} className="bg-[#ff6b35] text-white px-6 py-2 rounded-lg font-medium">
            Enable Notifications
          </button>
        </div>
      ) : (
        <div className="divide-y">
          {Object.entries(NOTIFICATION_TYPES).map(([key, { title, description }]) => (
            <div key={key} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
              <button
                onClick={() => handleToggle(key as keyof typeof settings)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  settings[key as keyof typeof settings] ? 'bg-[#ff6b35]' : 'bg-gray-300'
                }`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings[key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
