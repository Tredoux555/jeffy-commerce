'use client';

import { useEffect, useState } from 'react';

// Live finance dashboard — real revenue, landed COGS, gross margin, reseller balances.
const rand = (c: number) => `R${(c / 100).toLocaleString('en-ZA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

type Agg = { orders: number; revenueCents: number; cogsCents: number; grossProfitCents: number; grossMarginPct: number; aovCents: number };
type Vat = { registered: boolean; outputVatAllTimeCents: number; outputVatLast30Cents: number };
type Fin = {
  allTime: Agg; last30: Agg;
  vat?: Vat;
  resellers: { active: number; total: number; totalOwedCents: number; list: { name: string; suburb: string | null; status: string; balanceOwedCents: number; creditLimitCents: number }[] };
  recentOrders: { orderNumber: string; date: string; revenueCents: number; cogsCents: number; profitCents: number; routed: boolean }[];
};

export default function FinancePage() {
  const [d, setD] = useState<Fin | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/finance');
        const j = await res.json();
        if (!res.ok || !j.success) setErr(j.error || 'Could not load finance data.');
        else setD(j);
      } catch { setErr('Network error.'); }
      finally { setLoading(false); }
    })();
  }, []);

  const card = (label: string, value: string, sub?: string, tone?: string) => (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone || 'text-slate-900'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Finance</h1>
        <p className="text-sm text-slate-500">Live revenue, landed cost, margin, and money out in the reseller network.</p>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading…</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      {d && (
        <div className="space-y-7">
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">Last 30 days</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {card('Revenue', rand(d.last30.revenueCents))}
              {card('Landed COGS', rand(d.last30.cogsCents))}
              {card('Gross profit', rand(d.last30.grossProfitCents), undefined, 'text-green-700')}
              {card('Gross margin', pct(d.last30.grossMarginPct))}
            </div>
            <p className="mt-2 text-xs text-slate-400">{d.last30.orders} paid orders · avg order {rand(d.last30.aovCents)}</p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">All time</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {card('Revenue', rand(d.allTime.revenueCents))}
              {card('Landed COGS', rand(d.allTime.cogsCents))}
              {card('Gross profit', rand(d.allTime.grossProfitCents), undefined, 'text-green-700')}
              {card('Gross margin', pct(d.allTime.grossMarginPct))}
            </div>
            <p className="mt-2 text-xs text-slate-400">{d.allTime.orders} paid orders total</p>
          </section>

          {d.vat && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">VAT (output, wholesale leg)</h2>
              {d.vat.registered ? (
                <>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {card('Output VAT — 30 days', rand(d.vat.outputVatLast30Cents), 'payable to SARS', 'text-amber-700')}
                    {card('Output VAT — all time', rand(d.vat.outputVatAllTimeCents), undefined, 'text-amber-700')}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">VAT ends at the wholesale leg. Import VAT is recoverable as input VAT — net these off when filing (confirm treatment with your accountant).</p>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">Not VAT-registered yet. Once registered, set <code className="rounded bg-slate-200 px-1 text-xs">VAT_REGISTERED=true</code> and output VAT on the wholesale leg will be tracked here.</p>
                </div>
              )}
            </section>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Reseller balances</h2>
              <span className="text-xs text-slate-500">{d.resellers.active} active · {rand(d.resellers.totalOwedCents)} owed to Jeffy</span>
            </div>
            {d.resellers.list.length === 0 ? (
              <p className="text-sm text-slate-500">No resellers yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-3">Reseller</th><th className="py-2 px-3">Area</th><th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Owed</th><th className="py-2 pl-3 text-right">Credit limit</th>
                  </tr></thead>
                  <tbody>
                    {d.resellers.list.map((r, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-2 pr-3 font-medium text-slate-800">{r.name}</td>
                        <td className="py-2 px-3 text-slate-500">{r.suburb || '—'}</td>
                        <td className="py-2 px-3 text-slate-500 capitalize">{r.status}</td>
                        <td className="py-2 px-3 text-right text-slate-700">{rand(r.balanceOwedCents)}</td>
                        <td className="py-2 pl-3 text-right text-slate-500">{rand(r.creditLimitCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-slate-900">Recent paid orders</h2>
            {d.recentOrders.length === 0 ? (
              <p className="text-sm text-slate-500">No paid orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-3">Order</th><th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3 text-right">Revenue</th><th className="py-2 px-3 text-right">COGS</th>
                    <th className="py-2 px-3 text-right">Profit</th><th className="py-2 pl-3">Routed</th>
                  </tr></thead>
                  <tbody>
                    {d.recentOrders.map((o, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-2 pr-3 font-medium text-slate-800">{o.orderNumber}</td>
                        <td className="py-2 px-3 text-slate-500">{new Date(o.date).toLocaleDateString('en-ZA')}</td>
                        <td className="py-2 px-3 text-right text-slate-700">{rand(o.revenueCents)}</td>
                        <td className="py-2 px-3 text-right text-slate-500">{rand(o.cogsCents)}</td>
                        <td className="py-2 px-3 text-right font-semibold text-green-700">{rand(o.profitCents)}</td>
                        <td className="py-2 pl-3 text-slate-500">{o.routed ? '✓' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
