'use client';

import { useState } from 'react';
import { createWant } from '@/lib/wants-service';
import { useRouter } from 'next/navigation';

export default function CreateWantPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    creatorName: '',
    creatorPhone: '',
    maxPrice: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      console.log('Creating want with data:', formData);
      
      const maxPriceCents = formData.maxPrice ? Math.round(parseFloat(formData.maxPrice) * 100) : null;
      
      const res = await createWant(
        formData.title,
        formData.creatorName,
        formData.creatorPhone,
        10,
        null, // description
        null, // reference_url
        null, // reference_image_url
        maxPriceCents
      );

      console.log('Server response:', res);
      console.log('Want object:', res.want);
      console.log('Share code:', res.want?.share_code);

      if (res.success && res.want) {
        console.log('✅ Want created successfully:', res.want);
        setFormData({ title: '', creatorName: '', creatorPhone: '', maxPrice: '' });
        setSuccess(true);
        
        setTimeout(() => {
          const redirectUrl = `/wants/${res.want.share_code}`;
          console.log('🚀 Redirecting to:', redirectUrl);
          router.push(redirectUrl);
        }, 800);
      } else {
        const errorMsg = res.error || 'Failed to create want';
        console.error('❌ Creation failed:', errorMsg);
        setError(errorMsg);
        setSubmitting(false);
      }
    } catch (err: any) {
      console.error('❌ Form submission error:', err);
      setError(err.message || 'An unexpected error occurred');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold text-[#ff6b35] mb-4">🔥 Create a Want</h1>
        <p className="text-gray-400 mb-12">
          Tell people what you want. When 10 people agree, we'll source it and ship to everyone!
        </p>

        <form onSubmit={handleSubmit} className="bg-white/5 rounded-lg border border-gray-600 p-8 space-y-6">
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

          <div>
            <label className="block text-sm font-semibold mb-2">What do you want?</label>
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

          <div>
            <label className="block text-sm font-semibold mb-2">Your Name</label>
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
            <label className="block text-sm font-semibold mb-2">Your Phone</label>
            <input
              type="tel"
              placeholder="Your phone number"
              value={formData.creatorPhone}
              onChange={e => setFormData({ ...formData, creatorPhone: e.target.value })}
              className="w-full bg-white text-[#0f172a] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
              required
              disabled={submitting}
            />
          </div>

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
                step="0.01"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              💡 Products under R1,000 are <span className="text-green-400 font-bold">guaranteed</span>. Above R1,000 will be under consideration.
            </p>
          </div>

          {/* Terms Agreement */}
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
                I have read and agree to the{' '}
                <a 
                  href="/wants/terms" 
                  target="_blank" 
                  className="text-[#ff6b35] font-semibold underline hover:text-orange-400"
                >
                  Jeffy Wants Terms & Conditions
                </a>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || !agreedToTerms}
            className="w-full bg-[#ff6b35] text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '⏳ Creating...' : '✓ Create Want & Share'}
          </button>
        </form>

        {/* Quick Summary */}
        <div className="mt-8 bg-gray-800/30 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4">⚡ Quick Summary</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>✓ First to create a want for a product gets priority</li>
            <li>✓ 7 days to get 10 friends to agree via your unique link</li>
            <li>✓ Products under R1,000 = guaranteed | Over R1,000 = reviewed</li>
            <li>✓ Only official agrees (with phone number) count</li>
          </ul>
          <a 
            href="/wants/terms" 
            target="_blank"
            className="inline-block mt-4 text-[#ff6b35] text-sm font-semibold hover:underline"
          >
            Read Full Terms & Conditions →
          </a>
        </div>
      </div>
    </div>
  );
}
