import { getAllWantsForAdmin } from '@/lib/wants-service';
import Link from 'next/link';
import { Clock, AlertTriangle } from 'lucide-react';

export default async function AdminWantsStatsPage() {
  const res = await getAllWantsForAdmin();
  const wants = res.success && res.wants ? res.wants : [];
  
  // Sort by survey_votes for this page
  const sortedWants = [...(wants || [])].sort((a, b) => (b.survey_votes || 0) - (a.survey_votes || 0));

  // Calculate days remaining for each want
  const getExpiryInfo = (createdAt: string) => {
    const created = new Date(createdAt);
    const expiry = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return { daysLeft, expired: daysLeft <= 0 };
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📊 Wants Stats</h1>
        <p className="text-gray-600 mt-1">All product suggestions ranked by interest</p>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">All Wants (Ranked by Interest)</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">By</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Interest</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Official</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Max Price</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Time Left</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedWants.map((want, index) => {
                const { daysLeft, expired } = getExpiryInfo(want.created_at);
                const maxPrice = want.max_price_cents ? want.max_price_cents / 100 : null;
                const isGuaranteed = maxPrice && maxPrice <= 1000;
                
                return (
                  <tr key={want.id} className={`hover:bg-gray-50 ${expired ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${index < 3 ? 'text-[#ff6b35]' : 'text-gray-400'}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{want.title}</div>
                      <div className="text-xs text-gray-500">#{want.share_code}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{want.creator_name || 'Anonymous'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {want.survey_votes || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        want.current_agrees >= want.threshold 
                          ? 'bg-green-500 text-white' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {want.current_agrees || 0}/{want.threshold}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {maxPrice ? (
                        <span className={`text-sm font-medium ${isGuaranteed ? 'text-green-600' : 'text-yellow-600'}`}>
                          R{maxPrice.toLocaleString()}
                          {!isGuaranteed && <span className="text-xs ml-1">⚠️</span>}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {expired ? (
                        <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                          <AlertTriangle className="h-4 w-4" />
                          Expired
                        </span>
                      ) : (
                        <span className={`flex items-center gap-1 text-sm ${daysLeft <= 2 ? 'text-orange-600 font-medium' : 'text-gray-600'}`}>
                          <Clock className="h-4 w-4" />
                          {daysLeft}d left
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {wants.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No wants data yet
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-6 text-sm text-gray-600">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          Under R1,000 (Guaranteed)
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          Over R1,000 (Under consideration)
        </span>
      </div>
    </div>
  );
}
