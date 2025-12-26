'use client';

import { useState } from 'react';
import { Share2, Link, MessageCircle, Facebook, Twitter, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonsProps {
  url: string;
  title: string;
  image?: string;
}

export function ShareButtons({ url, title, image }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank');
  };

  // Native share if available
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch (e) {
        // User cancelled
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Share:</span>
      
      <button
        onClick={copyLink}
        className="p-2 rounded-full hover:bg-gray-100 transition"
        title="Copy link"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Link className="h-4 w-4 text-gray-500" />}
      </button>

      <button
        onClick={shareWhatsApp}
        className="p-2 rounded-full hover:bg-green-50 transition"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4 text-[#25D366]" />
      </button>

      <button
        onClick={shareFacebook}
        className="p-2 rounded-full hover:bg-blue-50 transition"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4 text-[#1877F2]" />
      </button>

      <button
        onClick={shareTwitter}
        className="p-2 rounded-full hover:bg-sky-50 transition"
        title="Share on Twitter"
      >
        <Twitter className="h-4 w-4 text-[#1DA1F2]" />
      </button>

      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button
          onClick={nativeShare}
          className="p-2 rounded-full hover:bg-gray-100 transition"
          title="More options"
        >
          <Share2 className="h-4 w-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}

// Compact share button
export function ShareButton({ url, title }: { url: string; title: string }) {
  const [showOptions, setShowOptions] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(title)}%20${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowOptions(!showOptions)}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      {showOptions && (
        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-xl border py-2 z-50 min-w-[160px]">
          <button
            onClick={shareWhatsApp}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
          >
            <MessageCircle className="h-4 w-4 text-[#25D366]" />
            WhatsApp
          </button>
          <button
            onClick={copyLink}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
          >
            <Copy className="h-4 w-4 text-gray-500" />
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
}
