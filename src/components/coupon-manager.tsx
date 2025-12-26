'use client';

import { useState } from 'react';
import { Percent, Copy, Check, Calendar, Users, Tag, Loader2, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  status: 'active' | 'expired' | 'disabled';
  applicableTo: 'all' | 'category' | 'product';
  categoryId?: string;
  productId?: string;
}

interface CouponManagerProps {
  coupons: Coupon[];
  onCreateCoupon: (data: Partial<Coupon>) => Promise<void>;
  onDeleteCoupon: (id: string) => Promise<void>;
  onToggleStatus: (id: string, status: 'active' | 'disabled') => Promise<void>;
}

export function CouponManager({ coupons, onCreateCoupon, onDeleteCoupon, onToggleStatus }: CouponManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatValue = (coupon: Coupon) => {
    if (coupon.type === 'percentage') return `${coupon.value}% off`;
    if (coupon.type === 'fixed') return `${formatCurrency(coupon.value)} off`;
    return 'Free Shipping';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Coupons & Discounts</h2>
        <Button onClick={() => setShowForm(true)}>
          <Tag className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Coupon List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Code</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Discount</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Usage</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Valid Until</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">{coupon.code}</code>
                    <button onClick={() => copyCode(coupon.code)} className="text-gray-400 hover:text-gray-600">
                      {copiedCode === coupon.code ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{formatValue(coupon)}</td>
                <td className="px-4 py-3">
                  <span className="text-sm">
                    {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''} uses
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{coupon.validTo}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    coupon.status === 'active' ? 'bg-green-100 text-green-700' :
                    coupon.status === 'expired' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {coupon.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onToggleStatus(coupon.id, coupon.status === 'active' ? 'disabled' : 'active')}
                      className="text-sm text-gray-600 hover:text-[#ff6b35]"
                    >
                      {coupon.status === 'active' ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => onDeleteCoupon(coupon.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <CouponForm
          onSubmit={async (data) => {
            setLoading(true);
            await onCreateCoupon(data);
            setShowForm(false);
            setLoading(false);
          }}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      )}
    </div>
  );
}

function CouponForm({ onSubmit, onCancel, loading }: { 
  onSubmit: (data: Partial<Coupon>) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as const,
    value: 10,
    minOrderValue: 0,
    maxUses: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: '',
    applicableTo: 'all' as const
  });

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'JEF';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    setFormData({ ...formData, code });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold mb-4">Create Coupon</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Coupon Code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="flex-1 px-3 py-2 border rounded-lg uppercase"
                placeholder="SUMMER20"
              />
              <Button variant="outline" onClick={generateCode} type="button">Generate</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {formData.type === 'percentage' ? 'Percentage' : 'Amount (cents)'}
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={formData.type === 'free_shipping'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Order (cents)</label>
              <input
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Uses (0=unlimited)</label>
              <input
                type="number"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valid From</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valid To</label>
              <input
                type="date"
                value={formData.validTo}
                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={() => onSubmit(formData)} disabled={loading} className="flex-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}

// Apply coupon component for checkout
export function ApplyCoupon({ onApply, appliedCoupon }: { 
  onApply: (code: string) => Promise<{ valid: boolean; discount?: number; message?: string }>;
  appliedCoupon?: { code: string; discount: number };
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    
    const result = await onApply(code.toUpperCase());
    
    if (!result.valid) {
      setError(result.message || 'Invalid coupon');
    }
    setCode('');
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      {appliedCoupon ? (
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-green-600" />
            <span className="font-medium">{appliedCoupon.code}</span>
            <span className="text-green-600">-{formatCurrency(appliedCoupon.discount)}</span>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter coupon code"
            className="flex-1 px-3 py-2 border rounded-lg uppercase"
          />
          <Button onClick={handleApply} disabled={loading} variant="outline">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
          </Button>
        </div>
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
