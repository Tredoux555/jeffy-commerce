'use client';

import { Share2 } from 'lucide-react';
import { useWishlistStore } from '@/lib/wishlist-store';
import { formatCurrency } from '@/lib/utils';

export function WishlistShare() {
  const items = useWishlistStore((state) => state.items);

  const handleShare = () => {
    if (items.length === 0) return;

    const itemsList = items
      .slice(0, 5)
      .map((item, i) => `${i + 1}. ${item.name} - ${formatCurrency(item.price)}`)
      .join('\n');

    const moreText = items.length > 5 ? `\n...and ${items.length - 5} more items` : '';

    const message = `🛍️ Check out my Jeffy wishlist!\n\n${itemsList}${moreText}\n\n👉 Shop at jeffy.co.za`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (items.length === 0) return null;

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-green-600 transition"
    >
      <Share2 className="h-4 w-4" />
      Share Wishlist
    </button>
  );
}
