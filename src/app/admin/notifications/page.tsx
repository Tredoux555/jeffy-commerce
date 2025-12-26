'use client';

import { useState, useEffect } from 'react';
import { Bell, MessageCircle, Check, RefreshCw, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPendingNotifications, markNotificationSent } from '@/lib/notification-service';
import { getWhatsAppUrl, getMilestoneEmoji } from '@/lib/notification-utils';

interface Notification {
  id: string;
  want_id: string;
  recipient_phone: string;
  recipient_name: string;
  milestone: number;
  message: string;
  status: string;
  created_at: string;
  wants?: {
    title: string;
    creator_name: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    const result = await getPendingNotifications();
    if (result.success) {
      setNotifications(result.notifications);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleSend = async (notification: Notification) => {
    const url = getWhatsAppUrl(notification.recipient_phone, notification.message);
    window.open(url, '_blank');
    await markNotificationSent(notification.id, 'manual');
    setNotifications(prev => prev.filter(n => n.id !== notification.id));
  };

  const handleSendAll = async () => {
    for (const notification of notifications) {
      const url = getWhatsAppUrl(notification.recipient_phone, notification.message);
      window.open(url, '_blank');
      await markNotificationSent(notification.id, 'manual');
      await new Promise(r => setTimeout(r, 500));
    }
    setNotifications([]);
  };

  const getMilestoneColor = (milestone: number) => {
    if (milestone === 10) return 'bg-green-100 border-green-300';
    if (milestone >= 7) return 'bg-orange-100 border-orange-300';
    if (milestone >= 5) return 'bg-yellow-100 border-yellow-300';
    return 'bg-blue-100 border-blue-300';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#ff6b35]" />
            WhatsApp Notifications
          </h1>
          <p className="text-gray-600">{notifications.length} pending to send</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadNotifications} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {notifications.length > 0 && (
            <Button onClick={handleSendAll} className="bg-[#25D366] hover:bg-[#1fb855]">
              <Send className="h-4 w-4 mr-2" />
              Send All ({notifications.length})
            </Button>
          )}
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className={`bg-white rounded-xl border-2 p-4 ${getMilestoneColor(notification.milestone)}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getMilestoneEmoji(notification.milestone)}</span>
                    <span className="font-bold">Milestone {notification.milestone}</span>
                    <span className="text-sm text-gray-600">
                      {notification.milestone === 10 ? '🏆 WINNER!' : `${notification.milestone}/10`}
                    </span>
                  </div>
                  
                  <p className="font-medium">{notification.wants?.title || 'Want'}</p>
                  <p className="text-sm text-gray-600">
                    To: {notification.recipient_name} ({notification.recipient_phone})
                  </p>
                  
                  <div className="mt-3 p-3 bg-white rounded-lg text-sm whitespace-pre-wrap max-h-32 overflow-auto border">
                    {notification.message}
                  </div>
                </div>

                <Button onClick={() => handleSend(notification)} className="bg-[#25D366] hover:bg-[#1fb855]">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">All caught up!</h3>
          <p className="text-gray-500">No pending notifications</p>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 className="font-semibold text-blue-800 mb-2">How this works:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Milestones: 1, 3, 5, 7, 9, 10 agrees trigger notifications</li>
          <li>• Click "Send" → WhatsApp opens with message ready</li>
          <li>• Just tap send in WhatsApp!</li>
        </ul>
        <p className="text-xs text-blue-600 mt-3 pt-3 border-t border-blue-200">
          🔮 <strong>Coming:</strong> Auto-send via WhatsApp Business API
        </p>
      </div>
    </div>
  );
}
