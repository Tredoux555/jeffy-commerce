'use client';

import { Share2 } from 'lucide-react';
import { useWishlistStore } from '@/lib/wishlist-store';
import { formatCurrency } from '@/lib/utils';

export function WishlistShare() {
  const { items } = useWishlistStore();

  if (items.length === 0) return null;

  const handleShare = () => {
    const productList = items
      .slice(0, 5) // Max 5 items in message
      .map((item, i) => `${i + 1}. ${item.name} - ${formatCurrency(item.price)}`)
      .join('\n');

    const total = items.reduce((sum, item) => sum + item.price, 0);
    
    const message = `🛒 Check out my Jeffy wishlist!\n\n${productList}${items.length > 5 ? `\n... and ${items.length - 5} more items` : ''}\n\n💰 Total: ${formatCurrency(total)}\n\n🔥 Shop at: ${window.location.origin}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
    >
      <Share2 className="h-4 w-4" />
      Share Wishlist
    </button>
  );
}
