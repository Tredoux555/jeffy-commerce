'use client';

import { Share2, Facebook, Twitter, Link2, Check, MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
}

export function SocialShare({ url, title, description = '', image }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      setShowDropdown(!showDropdown);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition"
      >
        <Share2 className="h-5 w-5" />
        Share
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border p-2 z-50 min-w-[180px]">
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-green-50 text-gray-700"
            >
              <MessageCircle className="h-5 w-5 text-green-500" />
              WhatsApp
            </a>
            <a
              href={shareLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700"
            >
              <Facebook className="h-5 w-5 text-blue-600" />
              Facebook
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sky-50 text-gray-700"
            >
              <Twitter className="h-5 w-5 text-sky-500" />
              Twitter
            </a>
            <button
              onClick={() => { copyToClipboard(); setShowDropdown(false); }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-gray-700 w-full"
            >
              {copied ? <Check className="h-5 w-5 text-green-500" /> : <Link2 className="h-5 w-5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
