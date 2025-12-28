'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell, X, CheckCircle, Gift } from 'lucide-react';

interface Notification {
  id: string;
  type: 'threshold_reached' | 'new_want' | 'expired';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface SuccessfulWant {
  id: string;
  title: string;
  creator_name: string;
  current_agrees: number;
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check for new threshold-reached wants
  const checkForSuccesses = async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      const data = await res.json();

      if (data.success && data.newSuccesses?.length > 0) {
        const newNotifs: Notification[] = data.newSuccesses.map((want: SuccessfulWant) => ({
          id: want.id,
          type: 'threshold_reached' as const,
          title: '🎉 Goal Reached!',
          message: `"${want.title}" by ${want.creator_name} reached ${want.current_agrees} agrees!`,
          timestamp: new Date(),
          read: false,
        }));

        setNotifications(prev => [...newNotifs, ...prev]);
        setUnreadCount(prev => prev + newNotifs.length);

        // Play notification sound
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }

        // Store last checked time
        localStorage.setItem('admin_notif_last_checked', new Date().toISOString());
      }
    } catch (err) {
      console.error('Failed to check notifications:', err);
    }
  };

  useEffect(() => {
    // Get last checked time from localStorage
    const stored = localStorage.getItem('admin_notif_last_checked');
    if (stored) setLastChecked(stored);

    // Initial check
    checkForSuccesses();

    // Poll every 30 seconds
    const interval = setInterval(checkForSuccesses, 30000);

    return () => clearInterval(interval);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <>
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
      </audio>

      {/* Notification Bell */}
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {showPanel && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[#ff6b35] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b hover:bg-gray-50 transition ${
                      !notif.read ? 'bg-orange-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        notif.type === 'threshold_reached' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {notif.type === 'threshold_reached' ? (
                          <Gift className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{notif.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notif.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => clearNotification(notif.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
