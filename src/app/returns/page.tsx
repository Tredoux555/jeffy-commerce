'use client';

import { useState } from 'react';

// Customer-facing returns. The shopper enters their order number + the email used on the
// order and picks a reason. We verify the match server-side and log a PENDING return for
// the team to action (collection + refund). No money moves here.
const REASONS: { value: string; label: string }[] = [
  { value: 'damaged', label: 'Arrived damaged' },
  { value: 'defective', label: 'Faulty / not working' },
  { value: 'wrong_item', label: 'Wrong item sent' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Something else' },
];

export default function ReturnsPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('damaged');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [rma, setRma] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setMsg('');
    try {
      const res = await fetch('/api/returns/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, email, reason, note }),
      });
      const j = await res.json();
      if (!res.ok || !j.success) {
        setStatus('error');
        setMsg(j.error || 'Could not submit your return. Please try again.');
        return;
      }
      setStatus('done');
      setRma(j.rmaNumber || '');
      setMsg(j.message || 'Return request received.');
    } catch {
      setStatus('error');
      setMsg('Network error. Please try again.');
    }
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Return an order</h1>
      <p className="mt-1 text-sm text-slate-500">
        Within 6 months for faulty goods, or 7 days if you&apos;ve changed your mind (CPA). Enter
        your order details and we&apos;ll arrange collection.
      </p>

      {status === 'done' ? (
        <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5">
          <p className="font-semibold text-green-800">Thanks — we&apos;ve got it.</p>
          <p className="mt-1 text-sm text-green-700">{msg}</p>
          {rma && (
            <p className="mt-3 text-sm text-green-700">
              Your reference: <strong className="font-mono">{rma}</strong>
            </p>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Order number</label>
            <input
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. JFY-10234"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#ff6b35] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email used on the order</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#ff6b35] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#ff6b35] focus:outline-none"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Anything else? (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[#ff6b35] focus:outline-none"
            />
          </div>

          {status === 'error' && <p className="text-sm text-red-600">{msg}</p>}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-lg bg-[#ff6b35] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {status === 'sending' ? 'Submitting…' : 'Request return'}
          </button>
        </form>
      )}
    </main>
  );
}
