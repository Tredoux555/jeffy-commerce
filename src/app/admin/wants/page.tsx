import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Package, Image as ImageIcon, Mail, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helpers (tolerant of legacy column names still present in the table)
function getTitle(want: any): string {
  return want.product_name || want.title || 'Untitled Wish';
}

function getImage(want: any): string | null {
  const img = want.image_url || want.reference_image_url;
  return img && img.length > 50 ? img : null;
}

function getContact(want: any): { type: 'email' | 'phone' | 'none'; value: string } {
  if (want.creator_email) return { type: 'email', value: want.creator_email };
  if (want.creator_phone && want.creator_phone.length > 5) return { type: 'phone', value: want.creator_phone };
  return { type: 'none', value: '' };
}

export default async function AdminWantsPage() {
  const supabase = await createClient();

  const { data: wants } = await supabase
    .from('wants')
    .select('*')
    .order('created_at', { ascending: false });

  const allWishes = wants || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Incoming Wishes</h1>
          <p className="text-gray-600">{allWishes.length} total — every wish is one entry in the weekly draw</p>
        </div>
        <Link href="/admin/campaign">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" size="sm">
            <Gift className="h-4 w-4 mr-1" /> Run the weekly draw
          </Button>
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
        This is the live demand list. Pick any wish to source it for the catalogue. Winners are drawn at random each week from the
        {' '}<Link href="/admin/campaign" className="underline font-medium">Wishlist Campaign</Link> page.
      </div>

      {allWishes.length > 0 ? (
        <div className="space-y-4">
          {allWishes.map((want) => (
            <WishCard key={want.id} want={want} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-12">No wishes yet.</p>
      )}
    </div>
  );
}

function WishCard({ want }: { want: any }) {
  const title = getTitle(want);
  const image = getImage(want);
  const contact = getContact(want);
  const created = new Date(want.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
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
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm text-gray-500">
              {contact.type === 'email' && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" /> {contact.value}
                </span>
              )}
              {contact.type === 'phone' && <span>📱 {contact.value}</span>}
              {contact.type === 'none' && <span className="text-gray-400">No contact info</span>}
            </p>

            {want.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{want.description}</p>
            )}

            <div className="flex items-center gap-2 mt-2">
              {want.category && want.category !== 'General' && (
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {want.category}
                </span>
              )}
              {want.suburb && (
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  📍 {want.suburb}
                </span>
              )}
              <span className="text-xs text-gray-400">{created}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          {image && (
            <a href={image} target="_blank">
              <Button variant="outline" size="sm">
                <ImageIcon className="h-4 w-4 mr-1" /> Image
              </Button>
            </a>
          )}

          {contact.type === 'email' && (
            <a href={`mailto:${contact.value}?subject=Your Jeffy wish "${title}"&body=Hi there!%0A%0AAbout your wish "${title}" on Jeffy...`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">
                <Mail className="h-4 w-4 mr-1" /> Email
              </Button>
            </a>
          )}

          <Link href={`/admin/procurement?want_id=${want.id}&want_title=${encodeURIComponent(title)}`}>
            <Button className="bg-green-600 hover:bg-green-700" size="sm">
              <Package className="h-4 w-4 mr-1" /> Source
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
