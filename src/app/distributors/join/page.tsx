'use client';

import { useState } from 'react';

export default function DistributorJoinPage() {
  const [form, setForm] = useState({
    owner_name: '', phone: '', email: '', business_name: '',
    suburb: '', city: '', province: '', coverage_area: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  function set(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/distributors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setDone(true);
      else setError(data.error || 'Something went wrong. Please try again.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">Application received!</h1>
        <p className="text-gray-600">We&apos;ll review your application and be in touch about becoming a Jeffy distributor in your area.</p>
      </div>
    );
  }

  const input = 'w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent';

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-1">Become a Jeffy distributor</h1>
      <p className="text-gray-600 mb-6">Run your own business. Stock products, deliver locally, keep your margin. We supply; you sell.</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your name *</label>
          <input className={input} value={form.owner_name} onChange={(e) => set('owner_name', e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (WhatsApp) *</label>
            <input className={input} value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className={input} value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business name (if any)</label>
          <input className={input} value={form.business_name} onChange={(e) => set('business_name', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Suburb / town *</label>
            <input className={input} value={form.suburb} onChange={(e) => set('suburb', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input className={input} value={form.city} onChange={(e) => set('city', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Area you&apos;d cover</label>
          <input className={input} value={form.coverage_area} onChange={(e) => set('coverage_area', e.target.value)} placeholder="e.g. the whole of Soweto, or just Orlando East" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#ff6b35] text-white font-semibold rounded-xl disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Apply to join'}
        </button>
        <p className="text-xs text-gray-500 text-center">
          By applying you agree to operate as an independent reseller. We&apos;ll send the full agreement before you start.
        </p>
      </form>
    </div>
  );
}
