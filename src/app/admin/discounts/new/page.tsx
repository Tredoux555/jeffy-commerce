'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewDiscountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order: '',
    max_uses: '',
    expires_at: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.toUpperCase().trim(),
          description: form.description,
          discount_type: form.discount_type,
          discount_value: form.discount_type === 'percentage' 
            ? parseInt(form.discount_value) 
            : Math.round(parseFloat(form.discount_value) * 100),
          min_order_cents: form.min_order ? Math.round(parseFloat(form.min_order) * 100) : 0,
          max_uses: form.max_uses ? parseInt(form.max_uses) : null,
          expires_at: form.expires_at || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin/discounts');
      } else {
        setError(data.error || 'Failed to create discount code');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link href="/admin/discounts" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Discounts
      </Link>

      <h1 className="text-2xl font-bold mb-6">Create Discount Code</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="e.g., SAVE20"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="e.g., 20% off for new customers"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (R)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.discount_type === 'percentage' ? 'Percentage *' : 'Amount (R) *'}
            </label>
            <input
              type="number"
              value={form.discount_value}
              onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
              placeholder={form.discount_type === 'percentage' ? 'e.g., 20' : 'e.g., 50'}
              min="1"
              max={form.discount_type === 'percentage' ? '100' : undefined}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order (R)</label>
            <input
              type="number"
              value={form.min_order}
              onChange={(e) => setForm({ ...form, min_order: e.target.value })}
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
            <input
              type="number"
              value={form.max_uses}
              onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
              placeholder="Unlimited"
              min="1"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
          <input
            type="datetime-local"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#ff6b35] text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          {loading ? 'Creating...' : 'Create Discount Code'}
        </button>
      </form>
    </div>
  );
}
