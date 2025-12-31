import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Eye, Users, CheckCircle, Clock, Bell, AlertTriangle, Package, ExternalLink, Image as ImageIcon, MessageCircle, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function AdminWantsPage() {
  const supabase = await createClient();

  const { data: wants } = await supabase
    .from('wants')
    .select('*')
    .order('created_at', { ascending: false });

  // Handle both old schema (title, current_agrees) and new schema (product_name, verified_count)
  const normalizedWants = (wants || []).map(w => ({
    ...w,
    title: w.title || w.product_name,
    current_agrees: w.current_agrees ?? w.verified_count ?? 0,
    threshold: w.threshold || 10,
    // Map 'voting' status to 'active' for display purposes
    displayStatus: w.status === 'voting' ? 'active' : w.status
  }));

  const readyToSource = normalizedWants.filter(w => 
    w.current_agrees >= w.threshold && (w.status === 'active' || w.status === 'voting')
  );
  
  const activeWants = normalizedWants.filter(w => 
    w.current_agrees < w.threshold && (w.status === 'active' || w.status === 'voting')
  );
  
  const sourcingWants = normalizedWants.filter(w => w.status === 'sourcing');
  const availableWants = normalizedWants.filter(w => w.status === 'available');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Jeffy Wants</h1>
          <p className="text-gray-600">{wants?.length || 0} total wants</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{readyToSource.length}</p>
          <p className="text-sm text-green-700">Ready to Source</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{activeWants.length}</p>
          <p className="text-sm text-yellow-700">Collecting</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{sourcingWants.length}</p>
          <p className="text-sm text-amber-700">Being Sourced</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{availableWants.length}</p>
          <p className="text-sm text-blue-700">Available</p>
        </div>
      </div>

      {/* Ready to Source Alert */}
      {readyToSource.length > 0 && (
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">🎉 {readyToSource.length} Want{readyToSource.length > 1 ? 's' : ''} Ready!</p>
              <p className="text-sm text-green-600">These hit 10 verifications - time to source!</p>
            </div>
          </div>
        </div>
      )}

      {/* READY TO SOURCE */}
      {readyToSource.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Ready to Source ({readyToSource.length})
          </h2>
          <div className="space-y-4">
            {readyToSource.map((want) => (
              <WantCard key={want.id} want={want} type="ready" />
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE / COLLECTING */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-yellow-600" />
          Collecting Verifications ({activeWants.length})
        </h2>
        {activeWants.length > 0 ? (
          <div className="space-y-4">
            {activeWants.map((want) => (
              <WantCard key={want.id} want={want} type="active" />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No wants collecting verifications</p>
        )}
      </div>

      {/* BEING SOURCED */}
      {sourcingWants.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-600" />
            Being Sourced ({sourcingWants.length})
          </h2>
          <div className="space-y-4">
            {sourcingWants.map((want) => (
              <WantCard key={want.id} want={want} type="sourcing" />
            ))}
          </div>
        </div>
      )}

      {/* AVAILABLE */}
      {availableWants.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Available ({availableWants.length})
          </h2>
          <div className="space-y-4">
            {availableWants.map((want) => (
              <WantCard key={want.id} want={want} type="available" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WantCard({ want, type }: { want: any; type: 'ready' | 'active' | 'sourcing' | 'available' }) {
  const progress = (want.current_agrees / want.threshold) * 100;
  const remaining = Math.max(0, want.threshold - want.current_agrees);
  const hasImage = want.reference_image_url && want.reference_image_url.length > 50;
  const hasLink = want.reference_url;

  const borderColor = {
    ready: 'border-green-300 bg-green-50',
    active: 'border-gray-200',
    sourcing: 'border-amber-200 bg-amber-50/30',
    available: 'border-blue-200 bg-blue-50/30'
  }[type];

  // Build share link
  const shareLink = want.creator_referral_code 
    ? `https://jeffy.co.za/want/${want.id}?ref=${want.creator_referral_code}`
    : `https://jeffy.co.za/wants/${want.share_code || want.id}`;

  return (
    <div className={`bg-white rounded-xl border ${borderColor} overflow-hidden`}>
      <div className="p-4">
        <div className="flex gap-4">
          {/* Image Preview */}
          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {hasImage ? (
              <img src={want.reference_image_url} alt={want.title} className="w-full h-full object-cover" />
            ) : (
              <Package className="h-8 w-8 text-gray-300" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg">{want.title}</h3>
                <p className="text-sm text-gray-500">
                  {want.creator_email || want.creator_name || 'Anonymous'}
                  {want.category && <span className="ml-2 text-gray-400">• {want.category}</span>}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Users className="h-4 w-4" />
                  <span className={type === 'ready' ? 'text-green-600' : ''}>{want.current_agrees}/{want.threshold}</span>
                </div>
                {type === 'active' && remaining > 0 && (
                  <span className="text-xs text-gray-500">{remaining} more needed</span>
                )}
              </div>
            </div>

            {/* Description */}
            {want.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{want.description}</p>
            )}

            {/* Reference Link */}
            {hasLink && (
              <a 
                href={want.reference_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
              >
                <ExternalLink className="h-3 w-3" />
                View Reference
              </a>
            )}

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    type === 'ready' ? 'bg-green-500' : 
                    type === 'sourcing' ? 'bg-amber-500' :
                    type === 'available' ? 'bg-blue-500' :
                    'bg-orange-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
              <span>Created {new Date(want.created_at).toLocaleDateString()}</span>
              {want.popularity_clicks > 0 && <span>👀 {want.popularity_clicks} views</span>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          <a href={shareLink} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
          </a>
          
          <a href={shareLink} target="_blank">
            <Button variant="outline" size="sm">
              <Link2 className="h-4 w-4 mr-1" /> Share Link
            </Button>
          </a>
          
          {hasImage && (
            <a href={want.reference_image_url} target="_blank">
              <Button variant="outline" size="sm">
                <ImageIcon className="h-4 w-4 mr-1" /> Image
              </Button>
            </a>
          )}
          
          {type === 'ready' && (
            <Link href={`/admin/procurement/smart-finder?want_id=${want.id}&want_title=${encodeURIComponent(want.title)}`}>
              <Button className="bg-green-600 hover:bg-green-700" size="sm">
                <Package className="h-4 w-4 mr-1" /> Source This
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
