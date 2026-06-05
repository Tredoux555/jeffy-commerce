'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DistributorActions({
  id,
  status,
  creditLimitCents,
}: {
  id: string;
  status: string;
  creditLimitCents: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [limit, setLimit] = useState(String(Math.round(creditLimitCents / 100)));

  async function update(patch: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch('/api/admin/distributors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">Credit R</span>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="w-24 px-2 py-1 border rounded text-sm"
        />
        <button
          disabled={busy}
          onClick={() => update({ credit_limit_cents: Math.round(parseFloat(limit || '0') * 100) })}
          className="px-2 py-1 text-xs bg-gray-800 text-white rounded disabled:opacity-50"
        >
          Set
        </button>
      </div>
      <div className="flex gap-2">
        {status !== 'active' && (
          <button
            disabled={busy}
            onClick={() => update({ status: 'active' })}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded disabled:opacity-50"
          >
            Approve
          </button>
        )}
        {status === 'active' && (
          <button
            disabled={busy}
            onClick={() => update({ status: 'suspended' })}
            className="px-3 py-1 text-sm bg-orange-500 text-white rounded disabled:opacity-50"
          >
            Suspend
          </button>
        )}
      </div>
    </div>
  );
}
