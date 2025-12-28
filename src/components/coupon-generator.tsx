'use client';

import { useState } from 'react';
import { Ticket, Copy, Check, Plus, Trash2, Download, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

// Generate random coupon code
function generateCouponCode(prefix: string = '', length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = prefix;
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Admin coupon generator
export function CouponGenerator() {
  const [coupons, setCoupons] = useState<Coupon[]>([
    { id: '1', code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 0, maxUses: null, usedCount: 156, expiresAt: null, isActive: true },
    { id: '2', code: 'SAVE50', type: 'fixed', value: 5000, minOrder: 20000, maxUses: 100, usedCount: 43, expiresAt: '2025-01-31', isActive: true },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: generateCouponCode('JEFFY'),
    type: 'percentage' as 'percentage' | 'fixed',
    value: 10,
    minOrder: 0,
    maxUses: '',
    expiresAt: '',
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const regenerateCode = () => {
    setNewCoupon(prev => ({ ...prev, code: generateCouponCode('JEFFY') }));
  };

  const createCoupon = () => {
    const coupon: Coupon = {
      id: Date.now().toString(),
      code: newCoupon.code,
      type: newCoupon.type,
      value: newCoupon.type === 'fixed' ? newCoupon.value * 100 : newCoupon.value,
      minOrder: newCoupon.minOrder * 100,
      maxUses: newCoupon.maxUses ? parseInt(newCoupon.maxUses) : null,
      usedCount: 0,
      expiresAt: newCoupon.expiresAt || null,
      isActive: true,
    };
    setCoupons(prev => [coupon, ...prev]);
    setShowCreate(false);
    setNewCoupon({
      code: generateCouponCode('JEFFY'),
      type: 'percentage',
      value: 10,
      minOrder: 0,
      maxUses: '',
      expiresAt: '',
    });
  };

  const toggleCoupon = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const deleteCoupon = (id: string) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupon Codes</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-lg hover:bg-orange-600"
        >
          <Plus className="h-5 w-5" /> Create Coupon
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Coupon</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="flex-1 border rounded-lg px-3 py-2 font-mono"
                  />
                  <button onClick={regenerateCode} className="p-2 border rounded-lg hover:bg-gray-50">
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="percentage">Percentage Off</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {newCoupon.type === 'percentage' ? 'Percent' : 'Amount (R)'}
                  </label>
                  <input
                    type="number"
                    value={newCoupon.value}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Order (R)</label>
                  <input
                    type="number"
                    value={newCoupon.minOrder}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, minOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Uses</label>
                  <input
                    type="number"
                    value={newCoupon.maxUses}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, maxUses: e.target.value }))}
                    placeholder="Unlimited"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Expires (optional)</label>
                <input
                  type="date"
                  value={newCoupon.expiresAt}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={createCoupon} className="flex-1 bg-[#ff6b35] text-white py-2 rounded-lg font-bold hover:bg-orange-600">
                Create Coupon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Code</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Discount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Min Order</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Usage</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className={`hover:bg-gray-50 ${!coupon.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-[#ff6b35]" />
                    <code className="font-mono font-bold">{coupon.code}</code>
                    <button onClick={() => copyCode(coupon.code, coupon.id)} className="text-gray-400 hover:text-gray-600">
                      {copiedId === coupon.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {coupon.type === 'percentage' ? `${coupon.value}%` : formatCurrency(coupon.value)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {coupon.minOrder > 0 ? formatCurrency(coupon.minOrder) : 'None'}
                </td>
                <td className="px-4 py-3 text-center">
                  {coupon.usedCount} / {coupon.maxUses || '∞'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleCoupon(coupon.id)}
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => deleteCoupon(coupon.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Bulk coupon generator
export function BulkCouponGenerator({ onGenerate }: { onGenerate: (codes: string[]) => void }) {
  const [prefix, setPrefix] = useState('JEFFY');
  const [count, setCount] = useState(10);
  const [generated, setGenerated] = useState<string[]>([]);

  const generate = () => {
    const codes = Array.from({ length: count }, () => generateCouponCode(prefix, 6));
    setGenerated(codes);
    onGenerate(codes);
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="font-bold mb-4">Bulk Generate Coupons</h2>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prefix</label>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value.toUpperCase())}
            className="border rounded-lg px-3 py-2 w-32"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="border rounded-lg px-3 py-2 w-24"
            min={1}
            max={100}
          />
        </div>
        <div className="flex items-end">
          <button onClick={generate} className="bg-[#ff6b35] text-white px-6 py-2 rounded-lg hover:bg-orange-600">
            Generate
          </button>
        </div>
      </div>
      {generated.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Generated {generated.length} codes:</span>
            <button className="flex items-center gap-1 text-sm text-[#ff6b35]">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {generated.map((code, i) => (
              <code key={i} className="px-2 py-1 bg-white border rounded text-sm">{code}</code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
