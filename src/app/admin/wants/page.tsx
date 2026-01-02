import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Eye, Users, CheckCircle, Clock, Bell, AlertTriangle, Package, ExternalLink, Image as ImageIcon, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper to get count - supports both column names
function getCount(want: any): number {
  return want.verified_count ?? want.current_agrees ?? 0;
}

// Helper to get threshold - default 10
function getThreshold(want: any): number {
  return want.threshold ?? 10;
}

// Helper to get title - supports both column names
function getTitle(want: any): string {
  return want.product_name || want.title || 'Untitled Want';
}

// Helper to get image - supports both column names
function getImage(want: any): string | null {
  const img = want.image_url || want.reference_image_url;
  return img && img.length > 50 ? img : null;
}

// Helper to get contact info
function getContact(want: any): { type: 'email' | 'phone' | 'none'; value: string } {
  if (want.creator_email) return { type: 'email', value: want.creator_email };
  if (want.creator_phone && want.creator_phone.length > 5) return { type: 'phone', value: want.creator_phone };
  return { type: 'none', value: '' };
}

// Check if want is in "collecting" state (active or voting)
function isCollecting(want: any): boolean {
  return want.status === 'active' || want.status === 'voting';
}

// Check if want reached threshold
function isReady(want: any): boolean {
  return getCount(want) >= getThreshold(want);
}

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

  // Ready to source: collecting status + reached threshold
  const readyToSource = wants?.filter(w => isCollecting(w) && isReady(w)) || [];
  
  // Active: collecting status + not reached threshold + not expired
  const activeWants = wants?.filter(w => {
    if (!isCollecting(w) || isReady(w)) return false;
    return !getExpiryInfo(w.created_at).expired;
  }) || [];
  
  // Expired: collecting status + not reached threshold + expired
  const expiredWants = wants?.filter(w => {
    if (!isCollecting(w) || isReady(w)) return false;
    return getExpiryInfo(w.created_at).expired;
  }) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Jeffy Wants</h1>
          <p className="text-gray-600">{wants?.length || 0} total wants</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{readyToSource.length}</p>
          <p className="text-sm text-green-700">Ready to Source</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{activeWants.length}</p>
          <p className="text-sm text-yellow-700">Collecting</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{expiredWants.length}</p>
          <p className="text-sm text-red-700">Expired</p>
        </div>
      </div>

      {/* Ready to Source Alert */}
      {readyToSource.length > 0 && (
        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">🎉 {readyToSource.length} Want{readyToSource.length > 1 ? 's' : ''} Ready!</p>
              <p className="text-sm text-green-600">Contact them with the good news, then source!</p>
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

      {/* ACTIVE */}
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
          <p className="text-gray-500 text-center py-8">No active wants yet</p>
        )}
      </div>

      {/* EXPIRED */}
      {expiredWants.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Expired ({expiredWants.length})
          </h2>
          <div className="space-y-4">
            {expiredWants.map((want) => (
              <WantCard key={want.id} want={want} type="expired" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WantCard({ want, type }: { want: any; type: 'ready' | 'active' | 'expired' }) {
  const { daysLeft } = getExpiryInfo(want.created_at);
  const count = getCount(want);
  const threshold = getThreshold(want);
  const progress = (count / threshold) * 100;
  const title = getTitle(want);
  const image = getImage(want);
  const contact = getContact(want);
  
  const borderColor = type === 'ready' ? 'border-green-300 bg-green-50' : type === 'expired' ? 'border-red-200 bg-red-50/30' : 'border-gray-200';

  // View link - use share_code if available, otherwise use ID
  const viewUrl = want.share_code 
    ? `/wants/${want.share_code}` 
    : `/want/${want.id}?ref=${want.creator_referral_code || ''}`;

  return (
    <div className={`bg-white rounded-xl border ${borderColor} overflow-hidden`}>
      <div className="p-4">
        <div className="flex gap-4">
          {/* Image Preview */}
          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-300" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-sm text-gray-500">
                  {contact.type === 'email' && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {contact.value}
                    </span>
                  )}
                  {contact.type === 'phone' && (
                    <span>📱 {contact.value}</span>
                  )}
                  {contact.type === 'none' && (
                    <span className="text-gray-400">No contact info</span>
                  )}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Users className="h-4 w-4" />
                  <span className={type === 'ready' ? 'text-green-600' : ''}>{count}/{threshold}</span>
                </div>
                {type === 'active' && (
                  <span className={`text-xs ${daysLeft <= 2 ? 'text-orange-600' : 'text-gray-500'}`}>
                    {daysLeft}d left
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {want.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{want.description}</p>
            )}

            {/* Category */}
            {want.category && want.category !== 'General' && (
              <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {want.category}
              </span>
            )}

            {/* Progress Bar */}
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-gray-500">
                {type === 'ready' ? '✅ Threshold reached!' : `${threshold - count} more needed`}
              </div>
              <div className="w-32">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${type === 'ready' ? 'bg-green-500' : 'bg-[#ff6b35]'}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          <Link href={viewUrl} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
          </Link>
          
          {image && (
            <a href={image} target="_blank">
              <Button variant="outline" size="sm">
                <ImageIcon className="h-4 w-4 mr-1" /> Image
              </Button>
            </a>
          )}
          
          {/* Email Creator Button */}
          {contact.type === 'email' && (
            <a href={`mailto:${contact.value}?subject=Your Jeffy Want "${title}"&body=Hi there!%0A%0AGreat news about your want "${title}" on Jeffy!`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                <Mail className="h-4 w-4 mr-1" /> Email Creator
              </Button>
            </a>
          )}
          
          {type === 'ready' && (
            <Link href={`/admin/procurement/smart-finder?want_id=${want.id}&want_title=${encodeURIComponent(title)}`}>
              <Button className="bg-green-600 hover:bg-green-700" size="sm">
                <Package className="h-4 w-4 mr-1" /> Source
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
