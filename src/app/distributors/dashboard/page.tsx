'use client';

import { useEffect, useState } from 'react';

// Independent-reseller dashboard.
// Phase D-finish: shows the reseller their stock, balance owed / available credit,
// and today's delivery list. Logs in via email/phone for now (see API note: gate behind
// the site's existing magic-link before go-live).

const rand = (c: number) => `R${(c / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Dash = {
  distributor: { owner_name: string; business_name: string | null; suburb: string | null; city: string | null; province: string | null; status: string; phase: string; payfastLinked?: boolean };
  summary: { unitsOnHand: number; stockValueOwedCents: number; balanceOwedCents: number; creditLimitCents: number; availableCreditCents: number; marginPayableCents: number };
  stock: { product: string; qty_on_hand: number; unit_wholesale_cents: number; retail_cents: number; margin_cents: number }[];
  deliveriesToday: { product: string; qty: number; amount_cents: number }[];
  ledger: { entry_type: string; product: string | null; quantity: number; amount_cents: number; balance_after_cents: number | null; note: string | null; created_at: string }[];
};

const PHASE_LABEL: Record<string, string> = { consignment: 'On credit (consignment)', buy_upfront: 'Buys upfront' };

export default function DistributorDashboardPage() {
  const [email, setEmail] = useState('');
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkMsg, setLinkMsg] = useState('');

  async function loadToken(token: string) {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/distributors/dashboard?token=${encodeURIComponent(token)}`);
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.error || 'Could not load your dashboard.'); setData(null); }
      else setData(json);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  async function requestLink() {
    if (!email) { setError('Enter your email.'); return; }
    setLoading(true); setError(''); setLinkMsg('');
    try {
      const res = await fetch('/api/distributors/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error || 'Could not send the link.');
      else setLinkMsg(json.message || 'Check your email for your login link.');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  // On load, if the URL carries a magic-link token, open the dashboard.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = new URLSearchParams(window.location.search).get('token') || '';
    if (token) loadToken(token);
  }, []);

  const badge = (text: string, tone: 'green' | 'amber' | 'red' | 'blue') => {
    const tones = { green: 'bg-green-100 text-green-800', amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-800', blue: 'bg-blue-100 text-blue-800' };
    return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{text}</span>;
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reseller Dashboard</h1>
        <p className="text-sm text-slate-500">Your stock, what you owe, and today&rsquo;s deliveries.</p>
      </div>

      {/* Login box */}
      {!data && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">Sign in with the email you registered with</label>
          <p className="mb-3 text-xs text-slate-500">We&rsquo;ll email you a secure one-tap link to your dashboard.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && requestLink()}
              placeholder="you@email.com"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button onClick={requestLink} disabled={loading}
              className="rounded-lg bg-blue-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
              {loading ? 'Sending…' : 'Email me a link'}
            </button>
          </div>
          {linkMsg && <p className="mt-3 text-sm text-green-700">{linkMsg}</p>}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* Header / identity */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-lg font-semibold text-slate-900">{data.distributor.business_name || data.distributor.owner_name}</p>
              <p className="text-sm text-slate-500">
                {[data.distributor.suburb, data.distributor.city, data.distributor.province].filter(Boolean).join(', ') || 'Area not set'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {data.distributor.status === 'active' ? badge('Active', 'green')
                : data.distributor.status === 'pending' ? badge('Pending approval', 'amber')
                : badge(data.distributor.status, 'red')}
              {badge(PHASE_LABEL[data.distributor.phase] || data.distributor.phase, 'blue')}
            </div>
          </div>

          {/* PayFast payout status */}
          <div className={`rounded-xl border p-4 text-sm shadow-sm ${data.distributor.payfastLinked ? 'border-green-200 bg-green-50 text-green-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            {data.distributor.payfastLinked
              ? 'PayFast linked — your sales margin is paid to you instantly on every sale.'
              : 'Your margin is being saved to your Jeffy balance (see “Margin earned” below). Link PayFast to be paid instantly per sale — ask Jeffy to add your PayFast merchant ID.'}
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Units on hand', value: String(data.summary.unitsOnHand) },
              { label: 'Balance owed to Jeffy', value: rand(data.summary.balanceOwedCents) },
              { label: 'Available credit', value: rand(data.summary.availableCreditCents) },
              { label: 'Margin earned (payable)', value: rand(data.summary.marginPayableCents) },
            ].map((c) => (
              <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{c.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Today's deliveries */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Today&rsquo;s delivery run</h2>
            {data.deliveriesToday.length === 0 ? (
              <p className="text-sm text-slate-500">No deliveries booked today yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.deliveriesToday.map((d, i) => (
                  <li key={i} className="flex items-center justify-between py-2.5">
                    <span className="text-sm font-medium text-slate-800">{d.product}</span>
                    <span className="text-sm text-slate-500">{d.qty} × &nbsp; <span className="font-semibold text-slate-700">{rand(d.amount_cents)}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Stock */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Your stock</h2>
            {data.stock.length === 0 ? (
              <p className="text-sm text-slate-500">No stock allocated yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                      <th className="py-2 pr-3">Product</th>
                      <th className="py-2 px-3 text-right">On hand</th>
                      <th className="py-2 px-3 text-right">Your cost</th>
                      <th className="py-2 px-3 text-right">Sell at</th>
                      <th className="py-2 pl-3 text-right">Your margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stock.map((s, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-2.5 pr-3 font-medium text-slate-800">{s.product}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {s.qty_on_hand}
                          {s.qty_on_hand <= 3 && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800">low</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{rand(s.unit_wholesale_cents)}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">{rand(s.retail_cents)}</td>
                        <td className="py-2.5 pl-3 text-right font-semibold text-green-700">{rand(s.margin_cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Ledger */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Recent activity</h2>
            {data.ledger.length === 0 ? (
              <p className="text-sm text-slate-500">No activity yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.ledger.map((e, i) => (
                  <li key={i} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-slate-700">
                      <span className="font-medium capitalize">{e.entry_type.replace('_', ' ')}</span>
                      {e.product ? ` · ${e.product}` : ''}{e.note ? ` · ${e.note}` : ''}
                    </span>
                    <span className="whitespace-nowrap text-slate-500">
                      {new Date(e.created_at).toLocaleDateString('en-ZA')} &nbsp;
                      <span className={e.entry_type === 'payment' ? 'font-semibold text-green-700' : 'text-slate-700'}>{rand(e.amount_cents)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <button onClick={() => { setData(null); setEmail(''); setLinkMsg(''); }}
            className="text-sm text-slate-400 underline hover:text-slate-600">Sign out</button>
        </div>
      )}
    </main>
  );
}
