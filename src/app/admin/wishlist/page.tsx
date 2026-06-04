import { createClient } from '@/lib/supabase/server';
import { TrendingUp, Tag, MapPin, DollarSign, Trophy } from 'lucide-react';

// Demand score: a verified "yes I'd buy" is a much stronger signal than a click/vote.
function demandScore(w: any): number {
  const votes = w.vote_count ?? 0;
  const verified = w.verified_count ?? 0;
  const clicks = w.popularity_clicks ?? 0;
  return verified * 5 + votes * 1 + Math.min(clicks, 50) * 0.1;
}

function rand(cents: number | null | undefined): string {
  if (cents == null) return '—';
  return 'R' + Math.round(cents / 100).toLocaleString('en-ZA');
}

export default async function AdminWishlistPage() {
  const supabase = await createClient();
  const { data: wantsRaw } = await supabase
    .from('wants')
    .select('*')
    .order('created_at', { ascending: false });

  const wants = (wantsRaw || []).map((w: any) => ({ ...w, _score: demandScore(w) }));
  const ranked = [...wants].sort((a, b) => b._score - a._score);
  const top100 = ranked.slice(0, 100);

  // Category breakdown
  const byCategory = new Map<string, { count: number; demand: number }>();
  for (const w of wants) {
    const cat = w.category || 'General';
    const cur = byCategory.get(cat) || { count: 0, demand: 0 };
    cur.count += 1;
    cur.demand += w._score;
    byCategory.set(cat, cur);
  }
  const categories = [...byCategory.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.demand - a.demand);

  // Price insight (only where requesters told us what they'd pay)
  const priced = wants.filter((w: any) => w.price_willing_cents != null);
  const avgPrice = priced.length
    ? Math.round(priced.reduce((s: number, w: any) => s + w.price_willing_cents, 0) / priced.length)
    : null;

  const totalDemand = Math.round(wants.reduce((s, w) => s + w._score, 0));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[#ff6b35]" /> Wish List — Demand Analysis
        </h1>
        <p className="text-gray-600">What the market is actually asking for. Use this to pick the top products to source.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[#ff6b35]">{wants.length}</p>
          <p className="text-sm text-gray-600">Total wishes</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{categories.length}</p>
          <p className="text-sm text-gray-600">Categories</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{totalDemand}</p>
          <p className="text-sm text-gray-600">Total demand signal</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{avgPrice != null ? rand(avgPrice) : '—'}</p>
          <p className="text-sm text-gray-600">Avg price willing ({priced.length})</p>
        </div>
      </div>

      {/* Category demand */}
      <div className="bg-white border rounded-xl p-5 mb-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Tag className="h-4 w-4" /> Demand by category</h2>
        <div className="space-y-2">
          {categories.slice(0, 12).map((c) => {
            const max = categories[0]?.demand || 1;
            return (
              <div key={c.name} className="flex items-center gap-3">
                <div className="w-40 text-sm truncate">{c.name}</div>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff6b35] rounded-full" style={{ width: `${Math.max(4, (c.demand / max) * 100)}%` }} />
                </div>
                <div className="w-24 text-right text-sm text-gray-500">{c.count} • {Math.round(c.demand)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 100 ranked */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-5 border-b flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="font-semibold">Top {top100.length} most-wanted (shortlist to source)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-4 py-2 w-12">#</th>
                <th className="text-left px-4 py-2">Product</th>
                <th className="text-left px-4 py-2">Category</th>
                <th className="text-right px-4 py-2">Verified</th>
                <th className="text-right px-4 py-2">Votes</th>
                <th className="text-right px-4 py-2">Would pay</th>
                <th className="text-right px-4 py-2">Demand</th>
              </tr>
            </thead>
            <tbody>
              {top100.map((w: any, i: number) => (
                <tr key={w.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-2 font-medium">
                    {w.product_name || 'Untitled'}
                    {w.suburb && (
                      <span className="ml-2 text-xs text-gray-400 inline-flex items-center gap-0.5">
                        <MapPin className="h-3 w-3" />{w.suburb}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{w.category || 'General'}</td>
                  <td className="px-4 py-2 text-right font-semibold text-green-600">{w.verified_count ?? 0}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{w.vote_count ?? 0}</td>
                  <td className="px-4 py-2 text-right text-gray-600">{rand(w.price_willing_cents)}</td>
                  <td className="px-4 py-2 text-right font-bold">{Math.round(w._score)}</td>
                </tr>
              ))}
              {top100.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No wishes yet — launch the Wish List campaign to start collecting demand.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 flex items-center gap-1">
        <DollarSign className="h-3 w-3" /> Demand = verified×5 + votes + clicks. "Would pay" fills in once requesters submit a price (structured Wish List capture).
      </p>
    </div>
  );
}
