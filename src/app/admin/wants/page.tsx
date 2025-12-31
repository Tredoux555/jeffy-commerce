import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Eye, Users, CheckCircle, Clock, Bell, AlertTriangle, Package, ExternalLink, Image as ImageIcon, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConvertToProductButton } from '@/components/convert-to-product-button';

function getExpiryInfo(createdAt: string) {
  const created = new Date(createdAt);
  const expiry = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return { daysLeft, expired: daysLeft <= 0 };
}

// Format phone for WhatsApp (SA format)
function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  // Remove spaces, dashes, brackets
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // If starts with 0, replace with 27
  if (cleaned.startsWith('0')) {
    cleaned = '27' + cleaned.slice(1);
  }
  // If doesn't start with +, add it
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned.replace('+', ''); // wa.me doesn't need the +
}

// Generate WhatsApp message for threshold reached
function getWhatsAppUrl(phone: string, name: string, title: string): string {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const message = `🎉 Great news ${name}!

Your want "${title}" just hit 10 agrees on Jeffy!

We're now sourcing your product and will update you soon.

Thank you for using Jeffy Wants! 🛒`;
  
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

export default async function AdminWantsPage() {
  const supabase = await createClient();

  const { data: wants } = await supabase
    .from('wants')
    .select('*')
    .order('created_at', { ascending: false });

  const readyToSource = wants?.filter(w => w.current_agrees >= w.threshold && w.status === 'active') || [];
  const activeWants = wants?.filter(w => {
    if (w.status !== 'active' || w.current_agrees >= w.threshold) return false;
    return !getExpiryInfo(w.created_at).expired;
  }) || [];
  const expiredWants = wants?.filter(w => {
    if (w.status !== 'active' || w.current_agrees >= w.threshold) return false;
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
              <p className="text-sm text-green-600">WhatsApp them the good news, then source!</p>
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
          Collecting Agrees ({activeWants.length})
        </h2>
        {activeWants.length > 0 ? (
          <div className="space-y-4">
            {activeWants.map((want) => (
              <WantCard key={want.id} want={want} type="active" />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No active wants</p>
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
  const progress = (want.current_agrees / want.threshold) * 100;
  const maxPrice = want.max_price_cents ? want.max_price_cents / 100 : null;
  const isGuaranteed = maxPrice && maxPrice <= 1000;
  const hasImage = want.reference_image_url && want.reference_image_url.length > 50;
  const hasLink = want.reference_url;
  const hasPhone = want.creator_phone && want.creator_phone.length > 5;

  const borderColor = type === 'ready' ? 'border-green-300 bg-green-50' : type === 'expired' ? 'border-red-200 bg-red-50/30' : 'border-gray-200';

  // WhatsApp URL for notifying creator
  const whatsappUrl = hasPhone ? getWhatsAppUrl(want.creator_phone, want.creator_name || 'there', want.title) : null;

  return (
    <div className={`bg-white rounded-xl border ${borderColor} overflow-hidden`}>
      <div className="p-4">
        <div className="flex gap-4">
          {/* Image Preview */}
          <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
            {hasImage ? (
              <img src={want.reference_image_url} alt={want.title} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-300" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-lg">{want.title}</h3>
                <p className="text-sm text-gray-500">by {want.creator_name || 'Anonymous'} • {want.creator_phone || 'No phone'}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Users className="h-4 w-4" />
                  <span className={type === 'ready' ? 'text-green-600' : ''}>{want.current_agrees}/{want.threshold}</span>
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

            {/* Reference Link */}
            {hasLink && (
              <a 
                href={want.reference_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
              >
                <ExternalLink className="h-3 w-3" />
                View Product Link
              </a>
            )}

            {/* Price & Progress */}
            <div className="flex items-center justify-between mt-3">
              <div>
                {maxPrice && (
                  <span className={`text-sm font-medium ${isGuaranteed ? 'text-green-600' : 'text-yellow-600'}`}>
                    Max: R{maxPrice.toLocaleString()} {isGuaranteed ? '✓ Guaranteed' : '⚠️ Review'}
                  </span>
                )}
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
          <Link href={`/wants/${want.share_code}`} target="_blank">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
          </Link>
          
          {hasImage && (
            <a href={want.reference_image_url} target="_blank">
              <Button variant="outline" size="sm">
                <ImageIcon className="h-4 w-4 mr-1" /> Image
              </Button>
            </a>
          )}
          
          {/* WhatsApp Creator Button - Only for READY wants with phone */}
          {type === 'ready' && whatsappUrl && (
            <a href={whatsappUrl} target="_blank">
              <Button className="bg-[#25D366] hover:bg-[#1fb855] text-white" size="sm">
                <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp Creator
              </Button>
            </a>
          )}
          
          {type === 'ready' && (
            <Link href={`/admin/procurement/smart-finder?want_id=${want.id}&want_title=${encodeURIComponent(want.title)}`}>
              <Button className="bg-green-600 hover:bg-green-700" size="sm">
                <Package className="h-4 w-4 mr-1" /> Source
              </Button>
            </Link>
          )}

          {/* Convert to Product Button - Only for READY wants */}
          {type === 'ready' && !want.converted_product_id && (
            <ConvertToProductButton wantId={want.id} wantTitle={want.title} />
          )}
          
          {want.converted_product_id && (
            <span className="text-sm text-green-600 font-medium">✓ Converted to Product</span>
          )}
        </div>
      </div>
    </div>
  );
}
