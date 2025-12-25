'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Image as ImageIcon, Link as LinkIcon, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createBrowserClient } from '@supabase/ssr';

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function CreateWantPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    referenceUrl: '',
    referenceImageUrl: '',
    maxPrice: '',
    creatorName: '',
    creatorPhone: '',
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Please enter what you want');
      return;
    }

    if (!formData.creatorName.trim()) {
      alert('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      const shareCode = generateShareCode();

      const { error } = await supabase
        .from('wants')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          reference_url: formData.referenceUrl.trim() || null,
          reference_image_url: formData.referenceImageUrl.trim() || null,
          max_price_cents: formData.maxPrice ? Math.round(parseFloat(formData.maxPrice) * 100) : null,
          share_code: shareCode,
          threshold: 10,
          current_agrees: 0,
          status: 'active',
          creator_name: formData.creatorName.trim(),
          creator_phone: formData.creatorPhone.trim() || null,
        });

      if (error) throw error;

      router.push(`/wants/${shareCode}`);
    } catch (error: any) {
      console.error('Error creating want:', error);
      alert('Failed to create want: ' + (error.message || 'Please try again'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href="/wants" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Wants
      </Link>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h1 className="text-2xl font-bold mb-2">Create a Want</h1>
        <p className="text-gray-600 mb-6">
          Tell us what you want. When 10 friends agree, you get it FREE!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              What do you want? *
            </label>
            <Input
              id="title"
              placeholder="e.g., Stanley Tumbler 40oz in Black"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific about the product, color, size, etc.
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Why do you want it? (Optional)
            </label>
            <textarea
              id="description"
              placeholder="Tell your friends why they should help you get this..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-jeffy-orange min-h-[100px]"
            />
          </div>

          <div>
            <label htmlFor="referenceUrl" className="block text-sm font-medium mb-1">
              <LinkIcon className="inline h-4 w-4 mr-1" />
              Reference Link (Optional)
            </label>
            <Input
              id="referenceUrl"
              type="url"
              placeholder="https://amazon.com/product..."
              value={formData.referenceUrl}
              onChange={(e) => setFormData({ ...formData, referenceUrl: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="referenceImageUrl" className="block text-sm font-medium mb-1">
              <ImageIcon className="inline h-4 w-4 mr-1" />
              Product Image URL (Optional)
            </label>
            <Input
              id="referenceImageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.referenceImageUrl}
              onChange={(e) => setFormData({ ...formData, referenceImageUrl: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium mb-1">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Maximum Price (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
              <Input
                id="maxPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="500"
                value={formData.maxPrice}
                onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                className="pl-8"
              />
            </div>
          </div>

          <hr />

          <div>
            <label htmlFor="creatorName" className="block text-sm font-medium mb-1">
              Your Name *
            </label>
            <Input
              id="creatorName"
              placeholder="John"
              value={formData.creatorName}
              onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="creatorPhone" className="block text-sm font-medium mb-1">
              Your WhatsApp Number *
            </label>
            <Input
              id="creatorPhone"
              type="tel"
              placeholder="082 123 4567"
              value={formData.creatorPhone}
              onChange={(e) => setFormData({ ...formData, creatorPhone: e.target.value })}
              required
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Want'}
          </Button>
        </form>
      </div>

      <div className="mt-8 p-6 bg-orange-50 rounded-lg">
        <h3 className="font-semibold mb-3">How it works:</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Create your want and share the link</li>
          <li>✓ Get 3 friends = 20% discount</li>
          <li>✓ Get 5 friends = 40% discount</li>
          <li>✓ Get 7 friends = 60% discount</li>
          <li>✓ Get 10 friends = 100% FREE!</li>
        </ul>
      </div>
    </div>
  );
}

