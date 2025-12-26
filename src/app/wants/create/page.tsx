'use client';

import { useState, useRef } from 'react';
import { createWant } from '@/lib/wants-service';
import { useRouter } from 'next/navigation';
import { Upload, Link as LinkIcon, X, Image as ImageIcon } from 'lucide-react';

export default function CreateWantPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    creatorName: '',
    creatorPhone: '',
    maxPrice: '',
    referenceUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    if (!imagePreview && !formData.referenceUrl) {
      setError('Please upload an image OR provide a product link so we know exactly what you want');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const maxPriceCents = formData.maxPrice ? Math.round(parseFloat(formData.maxPrice) * 100) : null;
      
      // For now, we'll pass the base64 image or URL
      const referenceImageUrl = imagePreview || null;
      const referenceUrl = formData.referenceUrl || null;
      
      const res = await createWant(
        formData.title,
        formData.creatorName,
        formData.creatorPhone,
        10,
        formData.description || null,
        referenceUrl,
        referenceImageUrl,
        maxPriceCents
      );

      if (res.success && res.want) {
        setFormData({ title: '', description: '', creatorName: '', creatorPhone: '', maxPrice: '', referenceUrl: '' });
        setImageFile(null);
        setImagePreview(null);
        setSuccess(true);
        
        setTimeout(() => {
          router.push(`/wants/${res.want.share_code}`);
        }, 800);
      } else {
        setError(res.error || 'Failed to create want');
        setSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-[#ff6b35] mb-4">🔥 Create a Want</h1>
        <p className="text-gray-400 mb-8">
          Tell us what you want. Get 10 friends to agree, and we'll source it FREE!
        </p>

        <form onSubmit={handleSubmit} className="bg-white/5 rounded-lg border border-gray-600 p-6 md:p-8 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-green-400 font-bold">
              ✅ Want created! Redirecting...
            </div>
          )}

          {/* What do you want */}
          <div>
            <label className="block text-sm font-semibold mb-2">What do you want? *</label>
            <input
              type="text"
              placeholder="e.g., Wireless Earbuds, Gaming Headset, Smart Watch..."
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-white text-[#0f172a] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
              required
              disabled={submitting}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Upload a picture of what you want
              <span className="text-gray-400 font-normal ml-2">(helps us find the exact product)</span>
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  className="w-full max-h-64 object-contain rounded-lg bg-gray-800"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-500 rounded-lg p-8 text-center cursor-pointer hover:border-[#ff6b35] transition"
              >
                <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-400">Click to upload image</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={submitting}
            />
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="text-gray-400 text-sm">OR</span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          {/* Product Link */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              <LinkIcon className="inline h-4 w-4 mr-1" />
              Paste a product link
              <span className="text-gray-400 font-normal ml-2">(Takealot, Amazon, any store)</span>
            </label>
            <input
              type="url"
              placeholder="https://www.takealot.com/product/..."
              value={formData.referenceUrl}
              onChange={e => setFormData({ ...formData, referenceUrl: e.target.value })}
              className="w-full bg-white text-[#0f172a] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
              disabled={submitting}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Tell us more <span className="text-gray-400 font-normal">(optional - color, size, specs)</span>
            </label>
            <textarea
              placeholder="e.g., I want it in black, size large, with noise cancellation..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full bg-white text-[#0f172a] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] resize-none"
              disabled={submitting}
            />
          </div>

          {/* Your Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Your Name *</label>
              <input
                type="text"
                placeholder="Your name"
                value={formData.creatorName}
                onChange={e => setFormData({ ...formData, creatorName: e.target.value })}
                className="w-full bg-white text-[#0f172a] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Your WhatsApp *</label>
              <input
                type="tel"
                placeholder="082 123 4567"
                value={formData.creatorPhone}
                onChange={e => setFormData({ ...formData, creatorPhone: e.target.value })}
                className="w-full bg-white text-[#0f172a] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-semibold mb-2">Maximum Price (optional)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">R</span>
              <input
                type="number"
                placeholder="1000"
                value={formData.maxPrice}
                onChange={e => setFormData({ ...formData, maxPrice: e.target.value })}
                className="w-full bg-white text-[#0f172a] p-4 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                disabled={submitting}
                min="0"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              💡 Products under R1,000 are <span className="text-green-400 font-bold">guaranteed</span>. Above R1,000 subject to review.
            </p>
          </div>

          {/* Terms */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded accent-[#ff6b35]"
                disabled={submitting}
              />
              <span className="text-sm text-gray-300">
                I agree to the{' '}
                <a href="/wants/terms" target="_blank" className="text-[#ff6b35] underline">
                  Terms & Conditions
                </a>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !agreedToTerms}
            className="w-full bg-[#ff6b35] text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition disabled:opacity-50"
          >
            {submitting ? '⏳ Creating...' : '✓ Create My Want'}
          </button>
        </form>
      </div>
    </div>
  );
}
