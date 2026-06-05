'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Tag, Layers, MapPin, Lightbulb, RefreshCw } from 'lucide-react';

interface Insights {
  summary: string;
  categories: { name: string; count: number; examples: string[] }[];
  clusters: { label: string; count: number; samples: string[] }[];
  by_area: { area: string; top: string[] }[];
  sourcing_recommendations: string[];
}

export default function WishInsightsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/wish-insights', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setCount(data.count);
        setInsights(data.insights);
        if (data.count === 0) setError('No wishes yet — once people start wishing, run this again.');
      } else {
        setError(data.error || 'Analysis failed.');
      }
    } catch (e: any) {
      setError(e?.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const maxCat = insights?.categories?.[0]?.count || 1;
  const maxClu = insights?.clusters?.[0]?.count || 1;

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-orange-500" /> AI Wish Insights
          </h1>
          <p className="text-gray-600">Runs every wish through Claude to categorise demand, cluster similar requests, and recommend what to source first.</p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="shrink-0 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : insights ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Analysing…' : insights ? 'Re-run' : 'Analyse wishes'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">{error}</div>
      )}

      {!insights && !loading && !error && (
        <div className="p-10 text-center text-gray-400 border border-dashed rounded-2xl">
          Click <span className="font-semibold text-gray-600">Analyse wishes</span> to generate insights. Takes ~10–30 seconds.
        </div>
      )}

      {loading && (
        <div className="p-10 text-center text-gray-500 border border-dashed rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-orange-500" />
          Reading the wishes and thinking…
        </div>
      )}

      {insights && (
        <div className="space-y-6">
          {count != null && <p className="text-sm text-gray-500">Analysed the latest <strong>{count}</strong> wishes.</p>}

          {/* Summary */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5">
            <p className="text-gray-800 leading-relaxed">{insights.summary}</p>
          </div>

          {/* Sourcing recommendations */}
          {insights.sourcing_recommendations?.length > 0 && (
            <div className="bg-white border rounded-2xl p-5">
              <h2 className="font-semibold mb-3 flex items-center gap-2"><Lightbulb className="h-5 w-5 text-green-600" /> Source these first</h2>
              <ol className="space-y-2 list-decimal list-inside text-sm text-gray-700">
                {insights.sourcing_recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ol>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Categories */}
            {insights.categories?.length > 0 && (
              <div className="bg-white border rounded-2xl p-5">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><Tag className="h-5 w-5 text-blue-600" /> Categories</h2>
                <div className="space-y-3">
                  {insights.categories.map((c, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-800">{c.name}</span>
                        <span className="text-gray-500">{c.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.max(6, (c.count / maxCat) * 100)}%` }} />
                      </div>
                      {c.examples?.length > 0 && <p className="text-xs text-gray-400 mt-1 truncate">{c.examples.join(' · ')}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clusters */}
            {insights.clusters?.length > 0 && (
              <div className="bg-white border rounded-2xl p-5">
                <h2 className="font-semibold mb-4 flex items-center gap-2"><Layers className="h-5 w-5 text-purple-600" /> Most-wished product types</h2>
                <div className="space-y-3">
                  {insights.clusters.map((c, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-800">{c.label}</span>
                        <span className="text-gray-500">{c.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.max(6, (c.count / maxClu) * 100)}%` }} />
                      </div>
                      {c.samples?.length > 0 && <p className="text-xs text-gray-400 mt-1 truncate">{c.samples.join(' · ')}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* By area */}
          {insights.by_area?.length > 0 && (
            <div className="bg-white border rounded-2xl p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-rose-600" /> Demand by area</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.by_area.map((a, i) => (
                  <div key={i} className="border rounded-xl p-3">
                    <p className="font-medium text-gray-800 mb-1">{a.area}</p>
                    <p className="text-xs text-gray-500">{a.top?.join(', ')}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">Area is approximate, derived from each wisher&apos;s IP at submission. Requires the location migration to be applied.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
