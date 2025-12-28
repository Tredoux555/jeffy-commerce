'use client';

import { useState } from 'react';
import { Calendar, Clock, Plus, Play, Pause, Trash2, Edit2, Tag, Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Mock data
const mockPromos = [
  { id: '1', name: 'New Year Sale', type: 'percentage', value: 20, starts_at: '2024-12-31T00:00', ends_at: '2025-01-07T23:59', is_active: true, status: 'scheduled' },
  { id: '2', name: 'Flash Friday', type: 'percentage', value: 30, starts_at: '2024-12-27T08:00', ends_at: '2024-12-27T20:00', is_active: true, status: 'active' },
  { id: '3', name: 'Free Shipping Week', type: 'free_shipping', value: 0, starts_at: '2024-12-20T00:00', ends_at: '2024-12-26T23:59', is_active: false, status: 'ended' },
];

export default function PromotionsPage() {
  const [promos, setPromos] = useState(mockPromos);
  const [showModal, setShowModal] = useState(false);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      scheduled: 'bg-blue-100 text-blue-700',
      ended: 'bg-gray-100 text-gray-600',
      paused: 'bg-amber-100 text-amber-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Scheduled Sales & Promotions</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          <Plus className="h-5 w-5" /> New Promotion
        </button>
      </div>

      {/* Active Promotions */}
      <div className="grid gap-4 mb-6">
        {promos.filter(p => p.status === 'active').map(promo => (
          <div key={promo.id} className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Tag className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{promo.name}</h3>
                  <p className="text-green-100 text-sm">
                    {promo.type === 'percentage' ? `${promo.value}% off` : promo.type === 'free_shipping' ? 'Free Shipping' : `${formatCurrency(promo.value)} off`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-100">Ends in</p>
                <p className="font-bold">3h 24m</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All Promotions Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="font-bold">All Promotions</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Promotion</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Discount</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Schedule</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {promos.map(promo => (
              <tr key={promo.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium">{promo.name}</p>
                </td>
                <td className="px-6 py-4">
                  {promo.type === 'percentage' && <span className="flex items-center gap-1"><Percent className="h-4 w-4 text-gray-400" />{promo.value}% off</span>}
                  {promo.type === 'fixed' && <span>{formatCurrency(promo.value)} off</span>}
                  {promo.type === 'free_shipping' && <span>Free Shipping</span>}
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm"><Clock className="h-3 w-3 inline mr-1" />{new Date(promo.starts_at).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">to {new Date(promo.ends_at).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(promo.status)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-blue-500 mr-3"><Edit2 className="h-4 w-4" /></button>
                  {promo.is_active ? (
                    <button className="text-gray-400 hover:text-amber-500 mr-3"><Pause className="h-4 w-4" /></button>
                  ) : (
                    <button className="text-gray-400 hover:text-green-500 mr-3"><Play className="h-4 w-4" /></button>
                  )}
                  <button className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal - simplified for now */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold mb-6">Create Promotion</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Promotion Name</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="Summer Sale" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full border rounded-lg px-3 py-2">
                    <option value="percentage">Percentage Off</option>
                    <option value="fixed">Fixed Amount Off</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input type="number" className="w-full border rounded-lg px-3 py-2" placeholder="20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date & Time</label>
                  <input type="datetime-local" className="w-full border rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date & Time</label>
                  <input type="datetime-local" className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="auto-apply" className="rounded" />
                <label htmlFor="auto-apply" className="text-sm">Auto-apply at checkout</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="show-banner" className="rounded" defaultChecked />
                <label htmlFor="show-banner" className="text-sm">Show promotional banner on site</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              <button className="flex-1 bg-[#ff6b35] text-white py-2 rounded-lg font-bold hover:bg-orange-600">Create Promotion</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
