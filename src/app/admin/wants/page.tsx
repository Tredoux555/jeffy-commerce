import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Eye, Users, CheckCircle, Clock, Sparkles, Bell, AlertTriangle, RefreshCw, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper to calculate expiry
function getExpiryInfo(createdAt: string) {
  const created = new Date(createdAt);
  const expiry = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return { daysLeft, expired: daysLeft <= 0 };
}

export default async function AdminWantsPage() {
  const supabase = await createClient();

  const { data: wants } = await supabase
    .from('wants')
    .select('*')
    .order('created_at', { ascending: false });

  // Categorize wants by status
  const now = new Date();
  
  const readyToSource = wants?.filter(w => {
    const reached = w.current_agrees >= w.threshold;
    return reached && w.status === 'active';
  }) || [];

  const processing = wants?.filter(w => 
    w.status === 'threshold_reached' || w.status === 'sourcing'
  ) || [];

  const activeWants = wants?.filter(w => {
    if (w.status !== 'active') return false;
    if (w.current_agrees >= w.threshold) return false;
    const { expired } = getExpiryInfo(w.created_at);
    return !expired;
  }) || [];

  const expiredWants = wants?.filter(w => {
    if (w.status !== 'active') return false;
    if (w.current_agrees >= w.threshold) return false;
    const { expired } = getExpiryInfo(w.created_at);
    return expired;
  }) || [];

  const completedWants = wants?.filter(w => 
    w.status === 'sourced' || w.status === 'shipped' || w.status === 'delivered'
  ) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Jeffy Wants</h1>
          <p className="text-gray-600">{wants?.length || 0} total wants</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{readyToSource.length}</p>
          <p className="text-xs text-green-700">Ready to Source</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{processing.length}</p>
          <p className="text-xs text-blue-700">Processing</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{activeWants.length}</p>
          <p className="text-xs text-yellow-700">Collecting</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{expiredWants.length}</p>
          <p className="text-xs text-red-700">Expired</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{completedWants.length}</p>
          <p className="text-xs text-gray-700">Completed</p>
        </div>
      </div>

      {/* Ready to Source Alert */}
      {readyToSource.length > 0 && (
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-800">🎉 {readyToSource.length} Want{readyToSource.length > 1 ? 's' : ''} Ready to Source!</p>
                <p className="text-sm text-green-600">These have reached 10 agrees - time to process!</p>
              </div>
            </div>
            <Link href="#ready-to-source">
              <Button className="bg-green-600 hover:bg-green-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Process Now
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Ready to Source Section */}
      {readyToSource.length > 0 && (
        <div id="ready-to-source" className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Ready to Source ({readyToSource.length})
          </h2>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-green-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Want</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Creator</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Agrees</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Max Price</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {readyToSource.map((want) => {
                  const maxPrice = want.max_price_cents ? want.max_price_cents / 100 : null;
                  const isGuaranteed = maxPrice && maxPrice <= 1000;
                  return (
                    <tr key={want.id} className="hover:bg-green-50">
                      <td className="px-6 py-4">
                        <div className="font-medium">{want.title}</div>
                        <div className="text-sm text-gray-500">#{want.share_code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{want.creator_name || 'Anonymous'}</div>
                        <div className="text-sm text-gray-500">{want.creator_phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                          <Users className="h-4 w-4" />
                          {want.current_agrees}/{want.threshold}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {maxPrice ? (
                          <span className={`font-medium ${isGuaranteed ? 'text-green-600' : 'text-yellow-600'}`}>
                            R{maxPrice.toLocaleString()}
                            {isGuaranteed ? ' ✓' : ' ⚠️'}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link href={`/wants/${want.share_code}`} target="_blank">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/procurement/smart-finder?want_id=${want.id}&want_title=${encodeURIComponent(want.title)}&share_code=${want.share_code}`}>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <Sparkles className="h-4 w-4 mr-1" />
                              Source
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Wants */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-600" />
          Collecting Agrees ({activeWants.length})
        </h2>
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Want</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Creator</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Progress</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Time Left</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeWants.length > 0 ? activeWants.map((want) => {
                const progress = (want.current_agrees / want.threshold) * 100;
                const { daysLeft } = getExpiryInfo(want.created_at);
                const isUrgent = daysLeft <= 2;
                return (
                  <tr key={want.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{want.title}</div>
                      <div className="text-sm text-gray-500">#{want.share_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{want.creator_name || 'Anonymous'}</div>
                      <div className="text-sm text-gray-500">{want.creator_phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-jeffy-orange"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm">{want.current_agrees}/{want.threshold}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 text-sm ${isUrgent ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                        <Clock className="h-4 w-4" />
                        {daysLeft}d left
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/wants/${want.share_code}`} target="_blank">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No active wants collecting agrees
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expired Wants */}
      {expiredWants.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Expired Wants ({expiredWants.length})
          </h2>
          <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
            <div className="bg-red-50 px-6 py-3 border-b border-red-200">
              <p className="text-sm text-red-700">
                These wants didn't reach 10 agrees within 7 days. Users can create a new want to try again.
              </p>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Want</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Creator</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Final Count</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Expired</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expiredWants.map((want) => {
                  const { daysLeft } = getExpiryInfo(want.created_at);
                  const daysExpired = Math.abs(daysLeft);
                  return (
                    <tr key={want.id} className="hover:bg-red-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-700">{want.title}</div>
                        <div className="text-sm text-gray-500">#{want.share_code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{want.creator_name || 'Anonymous'}</div>
                        <div className="text-sm text-gray-500">{want.creator_phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                          <Users className="h-4 w-4" />
                          {want.current_agrees}/{want.threshold}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-red-600 text-sm">
                          {daysExpired} day{daysExpired > 1 ? 's' : ''} ago
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link href={`/wants/${want.share_code}`} target="_blank">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completed Wants */}
      {completedWants.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-600" />
            Completed ({completedWants.length})
          </h2>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Want</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Creator</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Agrees</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {completedWants.map((want) => (
                  <tr key={want.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{want.title}</div>
                      <div className="text-sm text-gray-500">#{want.share_code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{want.creator_name || 'Anonymous'}</div>
                    </td>
                    <td className="px-6 py-4">{want.current_agrees}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        want.status === 'delivered' 
                          ? 'bg-green-100 text-green-700'
                          : want.status === 'shipped'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {want.status === 'delivered' && '✓ Delivered'}
                        {want.status === 'shipped' && '🚚 Shipped'}
                        {want.status === 'sourced' && '📦 Sourced'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/wants/${want.share_code}`} target="_blank">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
