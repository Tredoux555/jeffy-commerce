'use client';

import { useEffect, useState } from 'react';

interface Row {
  id: string;
  name: string;
  sellingPriceCents: number | null;
  wholesalePriceCents: number | null;
  landedCostCents: number | null;
  ok: boolean;
}

export default function WholesaleAdminPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [missing, setMissing] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/wholesale');
      const json = await res.json();
      if (json.success) {
        setRows(json.products as Row[]);
        setMissing(json.missingWholesale as number);
      } else {
        setMsg(json.error || 'Failed to load');
      }
    } catch {
      setMsg('Failed to load');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const rands = (cents: number | null) => (cents == null ? '' : (cents / 100).toFixed(2));

  const save = async () => {
    setSaving(true);
    setMsg('');
    const updates = Object.entries(edits)
      .filter(([, v]) => v.trim() !== '')
      .map(([id, v]) => ({ id, wholesalePriceCents: Math.round(parseFloat(v) * 100) }))
      .filter((u) => Number.isFinite(u.wholesalePriceCents) && u.wholesalePriceCents >= 0);

    if (updates.length === 0) {
      setSaving(false);
      setMsg('Nothing to save — enter a wholesale price (in Rands) first.');
      return;
    }

    try {
      const res = await fetch('/api/admin/wholesale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      const json = await res.json();
      setMsg(json.success ? `Saved ${json.updated} product(s).` : json.error || 'Save failed');
    } catch {
      setMsg('Save failed');
    }
    setSaving(false);
    setEdits({});
    load();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900">Wholesale prices</h1>
      <p className="text-gray-600 mt-1 text-sm">
        Set the price each reseller pays Jeffy. The two-tier split (Jeffy wholesale + seller margin)
        only records when a product has a wholesale price.
      </p>

      <div
        className={`mt-4 rounded-md px-4 py-3 text-sm ${
          missing > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-green-50 text-green-800 border border-green-200'
        }`}
      >
        {missing > 0
          ? `${missing} of ${rows.length} products have no wholesale price — set them before go-live.`
          : `All ${rows.length} products have a wholesale price. ✓`}
      </div>

      {msg && <div className="mt-3 text-sm text-gray-700">{msg}</div>}

      <div className="mt-4 flex gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button onClick={load} className="rounded-md border border-gray-300 px-4 py-2 text-sm">
          Reload
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-gray-500">Loading…</p>
      ) : (
        <table className="mt-4 w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2 pr-3">Product</th>
              <th className="py-2 px-3 text-right">Retail (R)</th>
              <th className="py-2 px-3 text-right">Landed (R)</th>
              <th className="py-2 px-3 text-right">Wholesale (R)</th>
              <th className="py-2 pl-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="py-2 pr-3 text-gray-900">{r.name}</td>
                <td className="py-2 px-3 text-right tabular-nums text-gray-700">{rands(r.sellingPriceCents)}</td>
                <td className="py-2 px-3 text-right tabular-nums text-gray-500">{rands(r.landedCostCents)}</td>
                <td className="py-2 px-3 text-right">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={rands(r.wholesalePriceCents) || '—'}
                    value={edits[r.id] ?? ''}
                    onChange={(e) => setEdits((prev) => ({ ...prev, [r.id]: e.target.value }))}
                    className="w-24 rounded border border-gray-300 px-2 py-1 text-right"
                  />
                </td>
                <td className="py-2 pl-3">
                  {r.ok ? (
                    <span className="text-green-700">set</span>
                  ) : (
                    <span className="text-amber-700">missing</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
