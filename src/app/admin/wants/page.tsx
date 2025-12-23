import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Eye, Users, CheckCircle, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AdminWantsPage() {
  const supabase = await createClient();

  const { data: wants } = await supabase
    .from('wants')
    .select('*')
    .order('created_at', { ascending: false });

  const readyToSource = wants?.filter(w => w.current_agrees >= w.threshold) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Jeffy Wants</h1>
          <p className="text-gray-600">{wants?.length || 0} total wants, {readyToSource.length} ready to source</p>
        </div>
        <Link href="/admin/procurement/research">
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Research 1688
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Want</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Creator</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Progress</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Created</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {wants && wants.length > 0 ? (
              wants.map((want) => {
                const progress = (want.current_agrees / want.threshold) * 100;
                const isComplete = want.current_agrees >= want.threshold;

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
                            className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-jeffy-orange'}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm">{want.current_agrees}/{want.threshold}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isComplete ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          Ready to source
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          <Clock className="h-3 w-3" />
                          Collecting
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(want.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link href={`/wants/${want.share_code}`} target="_blank">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {isComplete && (
                          <Link href={`/admin/procurement/research?want=${want.id}`}>
                            <Button size="sm">Source</Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No wants yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
