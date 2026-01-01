import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Bell, MessageCircle, Mail, Send, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getNotifications() {
  const supabase = await createClient();
  
  // Get want notifications
  const { data: wantNotifications, error: wantError } = await supabase
    .from('want_notifications')
    .select('*, wants(product_name)')
    .order('created_at', { ascending: false })
    .limit(50);
  
  // Get general notifications
  const { data: generalNotifications, error: generalError } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  return {
    wantNotifications: wantNotifications || [],
    generalNotifications: generalNotifications || [],
    errors: [wantError, generalError].filter(Boolean)
  };
}

async function getStats() {
  const supabase = await createClient();
  
  const { count: pending } = await supabase
    .from('want_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: sent } = await supabase
    .from('want_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent');

  const { count: failed } = await supabase
    .from('want_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'failed');

  return {
    pending: pending || 0,
    sent: sent || 0,
    failed: failed || 0
  };
}

export default async function AdminNotificationsPage() {
  const { wantNotifications, generalNotifications, errors } = await getNotifications();
  const stats = await getStats();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <MessageCircle className="h-4 w-4 text-green-600" />;
      case 'email': return <Mail className="h-4 w-4 text-blue-600" />;
      case 'sms': return <MessageCircle className="h-4 w-4 text-purple-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">Manage WhatsApp, email, and SMS notifications</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
          <Send className="h-4 w-4" />
          Send All Pending
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.sent}</p>
              <p className="text-sm text-gray-500">Sent</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.failed}</p>
              <p className="text-sm text-gray-500">Failed</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending + stats.sent + stats.failed}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">Some tables may not exist yet:</p>
          <p className="text-sm text-red-500 mt-1">Run the migrations to enable full notification features.</p>
        </div>
      )}

      {/* Want Notifications */}
      <div className="bg-white rounded-xl border overflow-hidden mb-6">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold">Want Notifications (WhatsApp Queue)</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Recipient</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Want</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Message</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Created</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {wantNotifications.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">No notifications yet</p>
                  <p className="text-sm">Notifications will appear here when wants reach threshold</p>
                </td>
              </tr>
            ) : (
              wantNotifications.map((notif: any) => (
                <tr key={notif.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(notif.type)}
                      <span className="text-sm capitalize">{notif.type || 'whatsapp'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono">{notif.phone || notif.email || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm">{notif.wants?.product_name || notif.want_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500 truncate max-w-xs block">
                      {notif.message?.substring(0, 50)}...
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notif.status)}`}>
                      {notif.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {notif.status === 'pending' && (
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                        <Send className="h-4 w-4" />
                      </button>
                    )}
                    {notif.status === 'failed' && (
                      <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* General Notifications */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold">System Notifications</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">User</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Message</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Read</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {generalNotifications.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  <p className="text-sm">No system notifications</p>
                </td>
              </tr>
            ) : (
              generalNotifications.map((notif: any) => (
                <tr key={notif.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm capitalize">{notif.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono">{notif.user_id?.substring(0, 8)}...</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{notif.message}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {notif.read ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(notif.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
