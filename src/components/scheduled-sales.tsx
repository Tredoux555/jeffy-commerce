'use client';

import { useState } from 'react';
import { Calendar, Clock, Plus, Play, Pause, Trash2, Edit2, Zap } from 'lucide-react';

interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'free_shipping';
  value?: number;
  startsAt: string;
  endsAt: string;
  status: 'scheduled' | 'active' | 'ended' | 'paused';
  uses: number;
  maxUses?: number;
}

const mockPromotions: Promotion[] = [
  { id: '1', name: 'New Year Sale', type: 'percentage', value: 20, startsAt: '2025-01-01', endsAt: '2025-01-07', status: 'scheduled', uses: 0, maxUses: 500 },
  { id: '2', name: 'Free Shipping Week', type: 'free_shipping', startsAt: '2024-12-26', endsAt: '2024-12-31', status: 'active', uses: 45 },
  { id: '3', name: 'Black Friday', type: 'percentage', value: 30, startsAt: '2024-11-29', endsAt: '2024-11-29', status: 'ended', uses: 892, maxUses: 1000 },
];

export function ScheduledSales() {
  const [promotions] = useState(mockPromotions);
  const [showCreate, setShowCreate] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      ended: 'bg-gray-100 text-gray-600',
      paused: 'bg-amber-100 text-amber-700',
    };
    return colors[status] || colors.ended;
  };

  const getTypeLabel = (type: string, value?: number) => {
    switch (type) {
      case 'percentage': return `${value}% Off`;
      case 'fixed': return `R${value} Off`;
      case 'bogo': return 'Buy One Get One';
      case 'free_shipping': return 'Free Shipping';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Scheduled Sales</h2>
          <p className="text-gray-500">Automate your promotions and flash sales</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          <Plus className="h-5 w-5" /> Schedule Sale
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-700 mb-1">
            <Play className="h-5 w-5" />
            <span className="font-medium">Active Now</span>
          </div>
          <p className="text-2xl font-bold text-green-800">{promotions.filter(p => p.status === 'active').length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Scheduled</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">{promotions.filter(p => p.status === 'scheduled').length}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-700 mb-1">
            <Calendar className="h-5 w-5" />
            <span className="font-medium">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">{promotions.filter(p => p.status === 'ended').length}</p>
        </div>
      </div>

      {/* Promotions List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Promotion</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Type</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Schedule</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Uses</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {promotions.map((promo) => (
              <tr key={promo.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <span className="font-medium">{promo.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm">
                    {getTypeLabel(promo.type, promo.value)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {promo.startsAt} → {promo.endsAt}
                </td>
                <td className="px-6 py-4 text-center">
                  {promo.uses}{promo.maxUses ? ` / ${promo.maxUses}` : ''}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(promo.status)}`}>
                    {promo.status.charAt(0).toUpperCase() + promo.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {promo.status === 'active' && (
                      <button className="p-2 hover:bg-amber-100 rounded-lg text-amber-600" title="Pause">
                        <Pause className="h-4 w-4" />
                      </button>
                    )}
                    {promo.status === 'paused' && (
                      <button className="p-2 hover:bg-green-100 rounded-lg text-green-600" title="Resume">
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Edit">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-lg text-red-600" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
