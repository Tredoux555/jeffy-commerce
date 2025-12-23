import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Eye, Users, CheckCircle, Clock, Sparkles, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AdminWantsPage() {
  const supabase = await createClient();

  const { data: wants } = await supabase
    .from('wants')
    .select('*')
    .order('created_at', { ascending: false });

  const readyToSource = wants?.filter(w => w.current_agrees >= w.threshold && w.status !== 'sourced') || [];
  const activeWants = wants?.filter(w => w.current_agrees < w.threshold) || [];
  const sourcedWants = wants?.filter(w => w.status === 'sourced') || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Jeffy Wants</h1>
          <p className="text-gray-600">{wants?.length || 0} total wants</p>
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
                <p className="font-semibold text-green-800">{readyToSource.length} Want{readyToSource.length > 1 ? 's' : ''} Ready to Source!</p>
                <p className="text-sm text-green-600">These have reached their agree threshold</p>
              </div>
            </div>
            <Link href="#ready-to-source">
              <Button className="bg-green-600 hover:bg-green-700">
                <Sparkles className="h-4 w-4 mr-2" />
                Source Now
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
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Discount</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {readyToSource.map((want) => {
                  const discount = want.current_agrees >= 10 ? 100 : 
                                   want.current_agrees >= 7 ? 60 :
                                   want.current_agrees >= 5 ? 40 :
                                   want.current_agrees >= 3 ? 20 : 0;
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
                        <span className={`px-2 py-1 text-sm font-bold rounded ${discount === 100 ? 'bg-green-500 text-white' : 'bg-orange-100 text-orange-700'}`}>
                          {discount === 100 ? 'FREE!' : `${discount}% OFF`}
                        </span>
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
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Created</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeWants.length > 0 ? activeWants.map((want) => {
                const progress = (want.current_agrees / want.threshold) * 100;
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
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(want.created_at).toLocaleDateString()}
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
                    No active wants
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sourced Wants */}
      {sourcedWants.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Sourced ({sourcedWants.length})
          </h2>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-blue-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Want</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Agrees</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sourcedWants.map((want) => (
                  <tr key={want.id} className="hover:bg-blue-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{want.title}</div>
                      <div className="text-sm text-gray-500">#{want.share_code}</div>
                    </td>
                    <td className="px-6 py-4">{want.current_agrees}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Sourced
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