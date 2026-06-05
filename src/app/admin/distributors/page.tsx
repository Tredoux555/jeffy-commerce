import { createClient } from '@/lib/supabase/server';
import { Users, MapPin, CheckCircle, Clock } from 'lucide-react';
import DistributorActions from './actions-client';

function rand(cents: number | null | undefined): string {
  if (cents == null) return 'R0';
  return 'R' + Math.round(cents / 100).toLocaleString('en-ZA');
}

export default async function AdminDistributorsPage() {
  const supabase = await createClient();
  const { data: distributorsRaw } = await supabase
    .from('distributors')
    .select('*')
    .order('created_at', { ascending: false });

  const distributors = distributorsRaw || [];
  const pending = distributors.filter((d: any) => d.status === 'pending');
  const active = distributors.filter((d: any) => d.status === 'active');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-[#ff6b35]" /> Distributors
        </h1>
        <p className="text-gray-600">Independent resellers in your network.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{distributors.length}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pending.length}</p>
          <p className="text-sm text-gray-600">Pending approval</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{active.length}</p>
          <p className="text-sm text-gray-600">Active</p>
        </div>
      </div>

      {distributors.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No distributor applications yet.</p>
      ) : (
        <div className="space-y-3">
          {distributors.map((d: any) => (
            <div key={d.id} className="bg-white border rounded-xl p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{d.owner_name}</h3>
                    <StatusBadge status={d.status} />
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{d.phase}</span>
                  </div>
                  <p className="text-sm text-gray-500">{d.business_name || '—'} · {d.phone}{d.email ? ` · ${d.email}` : ''}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {[d.suburb, d.city, d.province].filter(Boolean).join(', ') || d.coverage_area || 'No location'}
                  </p>
                  <p className="text-sm mt-1">
                    Credit limit: <strong>{rand(d.credit_limit_cents)}</strong> · Owed: <strong className={d.balance_owed_cents > 0 ? 'text-red-600' : ''}>{rand(d.balance_owed_cents)}</strong>
                  </p>
                </div>
                <DistributorActions
                  id={d.id}
                  status={d.status}
                  creditLimitCents={d.credit_limit_cents ?? 0}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-orange-100 text-orange-700',
    terminated: 'bg-gray-200 text-gray-600',
  };
  const Icon = status === 'active' ? CheckCircle : Clock;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      <Icon className="h-3 w-3" /> {status}
    </span>
  );
}
