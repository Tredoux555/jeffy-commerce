'use client';

import { Share2, MessageCircle, Facebook, Twitter, Link2, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareButtonsProps {
  url: string;
  title: string;
  price?: number;
}

export function ShareButtons({ url, title, price }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const priceText = price ? ` - Only R${(price / 100).toFixed(2)}!` : '';
  const shareText = `Check out ${title}${priceText} on Jeffy Commerce!`;
  
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${fullUrl}`)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(fullUrl)}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 text-gray-600 hover:text-[#ff6b35] transition"
      >
        <Share2 className="h-5 w-5" />
        <span className="text-sm font-medium">Share</span>
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border p-3 z-50 w-48">
            <div className="space-y-1">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 hover:bg-green-50 rounded-lg transition text-gray-700"
              >
                <MessageCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">WhatsApp</span>
              </a>
              <a 
                href={facebookUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg transition text-gray-700"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Facebook</span>
              </a>
              <a 
                href={twitterUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 hover:bg-sky-50 rounded-lg transition text-gray-700"
              >
                <Twitter className="h-5 w-5 text-sky-500" />
                <span className="text-sm">Twitter</span>
              </a>
              <button 
                onClick={copyLink}
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition text-gray-700 w-full"
              >
                {copied ? (
                  <>
                    <Check className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="h-5 w-5 text-gray-500" />
                    <span className="text-sm">Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
