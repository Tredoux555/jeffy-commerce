'use client';

import { useState, useRef } from 'react';
import { createWant } from '@/lib/wants-service';
import Link from 'next/link';
import { Upload, Link as LinkIcon, X, Check, Share2, MessageCircle, Copy, Home } from 'lucide-react';

type Step = 'create' | 'share' | 'done';

export default function CreateWantPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('create');
  const [shareCode, setShareCode] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    creatorName: '',
    creatorPhone: '',
    maxPrice: '',
    referenceUrl: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    if (!imagePreview && !formData.referenceUrl) {
      setError('Please upload an image OR provide a product link');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      const maxPriceCents = formData.maxPrice ? Math.round(parseFloat(formData.maxPrice) * 100) : null;
      
      const res = await createWant(
        formData.title,
        formData.creatorName,
        formData.creatorPhone,
        10,
        formData.description || null,
        formData.referenceUrl || null,
        imagePreview || null,
        maxPriceCents
      );

      if (res.success && res.want) {
        const code = res.want.share_code;
        const url = `${window.location.origin}/wants/${code}`;
        setShareCode(code);
        setShareUrl(url);
        setStep('share');
      } else {
        setError(res.error || 'Failed to create want');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWhatsAppShare = () => {
    const message = `🔥 Help me get "${formData.title}" FREE!\n\nI need 10 friends to agree. Just tap the link and hit "Agree" - takes 5 seconds!\n\n👇 Tap here:\n${shareUrl}\n\nThen you can create YOUR own want and get free stuff too! 🎁`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ============ SCREEN 1: CREATE FORM ============
  if (step === 'create') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold text-[#ff6b35] mb-2">🔥 Create a Want</h1>
          <p className="text-gray-400 mb-6">Tell us what you want. Get 10 friends to agree = FREE!</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* What do you want */}
            <div>
              <label className="block text-sm font-semibold mb-2">What do you want? *</label>
              <input
                type="text"
                placeholder="e.g., Wireless Earbuds, Smart Watch..."
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white text-[#0f172a] p-4 rounded-lg"
                required
                disabled={submitting}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">Upload a picture</label>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-contain rounded-lg bg-gray-800" />
                  <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500 p-2 rounded-full">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-500 rounded-lg p-6 text-center cursor-pointer hover:border-[#ff6b35]">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-400 text-sm">Tap to upload</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            {/* OR */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-600"></div>
              <span className="text-gray-500 text-sm">OR</span>
              <div className="flex-1 h-px bg-gray-600"></div>
            </div>

            {/* Product Link */}
            <div>
              <label className="block text-sm font-semibold mb-2">Paste a product link</label>
              <input
                type="url"
                placeholder="https://www.takealot.com/..."
                value={formData.referenceUrl}
                onChange={e => setFormData({ ...formData, referenceUrl: e.target.value })}
                className="w-full bg-white text-[#0f172a] p-4 rounded-lg"
                disabled={submitting}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">Details <span className="text-gray-500 font-normal">(color, size, etc)</span></label>
              <textarea
                placeholder="e.g., Black, size large..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full bg-white text-[#0f172a] p-4 rounded-lg resize-none"
                disabled={submitting}
              />
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-2">Your Name *</label>
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.creatorName}
                  onChange={e => setFormData({ ...formData, creatorName: e.target.value })}
                  className="w-full bg-white text-[#0f172a] p-4 rounded-lg"
                  required
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">WhatsApp *</label>
                <input
                  type="tel"
                  placeholder="082 123 4567"
                  value={formData.creatorPhone}
                  onChange={e => setFormData({ ...formData, creatorPhone: e.target.value })}
                  className="w-full bg-white text-[#0f172a] p-4 rounded-lg"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-semibold mb-2">Max Price <span className="text-gray-500 font-normal">(optional)</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                <input
                  type="number"
                  placeholder="1000"
                  value={formData.maxPrice}
                  onChange={e => setFormData({ ...formData, maxPrice: e.target.value })}
                  className="w-full bg-white text-[#0f172a] p-4 pl-10 rounded-lg"
                  disabled={submitting}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Under R1,000 = guaranteed ✓</p>
            </div>

            {/* Terms */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-5 h-5 rounded accent-[#ff6b35]"
                disabled={submitting}
              />
              <span className="text-sm text-gray-400">
                I agree to the <a href="/wants/terms" target="_blank" className="text-[#ff6b35] underline">Terms</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting || !agreedToTerms}
              className="w-full bg-[#ff6b35] text-white py-4 rounded-lg font-bold text-lg disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Next →'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============ SCREEN 2: SHARE ============
  if (step === 'share') {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Now share it!</h1>
          <p className="text-gray-400 mb-8">
            You need <span className="text-[#ff6b35] font-bold">10 friends</span> to agree.<br/>
            Send to as many people as possible!
          </p>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#1fb855] transition mb-4"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share on WhatsApp
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopyLink}
            className="w-full border border-gray-600 text-gray-300 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800 transition mb-8"
          >
            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          {/* Your Link */}
          <div className="bg-gray-800 rounded-lg p-3 mb-8">
            <p className="text-xs text-gray-500 mb-1">Your unique link:</p>
            <p className="text-sm text-[#ff6b35] break-all">{shareUrl}</p>
          </div>

          <button
            onClick={() => setStep('done')}
            className="text-[#ff6b35] font-semibold hover:underline"
          >
            Done sharing →
          </button>
        </div>
      </div>
    );
  }

  // ============ SCREEN 3: DONE ============
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-white" />
        </div>

        <h1 className="text-2xl font-bold mb-2">Want Created! 🎉</h1>
        <p className="text-gray-400 mb-8">
          Now just wait for your friends to agree.<br/>
          <span className="text-white font-semibold">We'll notify you when 10 people have agreed!</span>
        </p>

        {/* Summary */}
        <div className="bg-gray-800 rounded-xl p-4 mb-8 text-left">
          <p className="text-sm text-gray-500 mb-1">Your want:</p>
          <p className="font-bold text-lg">{formData.title}</p>
          <p className="text-sm text-gray-400 mt-2">Share code: {shareCode}</p>
        </div>

        {/* Share Again */}
        <button
          onClick={handleWhatsAppShare}
          className="w-full bg-[#25D366] text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 mb-4"
        >
          <Share2 className="h-5 w-5" />
          Share again on WhatsApp
        </button>

        {/* Browse Jeffy */}
        <Link href="/" className="block">
          <button className="w-full border border-gray-600 text-gray-300 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-800">
            <Home className="h-5 w-5" />
            Browse Jeffy Store
          </button>
        </Link>
      </div>
    </div>
  );
}

