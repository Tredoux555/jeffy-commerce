'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Tag, Loader2, X, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface DiscountCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_cents: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<DiscountCode | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 10,
    min_order_cents: 0,
    max_uses: '',
    expires_at: '',
  });

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });
    setDiscounts(data || []);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_order_cents: form.min_order_cents * 100,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at || null,
      is_active: true,
    };

    if (editingDiscount) {
      await supabase.from('discount_codes').update(payload).eq('id', editingDiscount.id);
    } else {
      await supabase.from('discount_codes').insert(payload);
    }

    setShowModal(false);
    setEditingDiscount(null);
    resetForm();
    fetchDiscounts();
    setSaving(false);
  };

  const handleEdit = (discount: DiscountCode) => {
    setEditingDiscount(discount);
    setForm({
      code: discount.code,
      description: discount.description || '',
      discount_type: discount.discount_type,
      discount_value: discount.discount_value,
      min_order_cents: discount.min_order_cents / 100,
      max_uses: discount.max_uses?.toString() || '',
      expires_at: discount.expires_at?.split('T')[0] || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this discount code?')) return;
    const supabase = createClient();
    await supabase.from('discount_codes').delete().eq('id', id);
    fetchDiscounts();
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    const supabase = createClient();
    await supabase.from('discount_codes').update({ is_active: !isActive }).eq('id', id);
    fetchDiscounts();
  };

  const resetForm = () => {
    setForm({ code: '', description: '', discount_type: 'percentage', discount_value: 10, min_order_cents: 0, max_uses: '', expires_at: '' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Discount Codes</h1>
        <button onClick={() => { resetForm(); setEditingDiscount(null); setShowModal(true); }} className="flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          <Plus className="h-5 w-5" /> New Code
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
      ) : discounts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No discount codes yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Code</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Discount</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Min Order</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Usage</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-mono font-bold text-[#ff6b35]">{d.code}</div>
                    <div className="text-sm text-gray-500">{d.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    {d.discount_type === 'percentage' ? `${d.discount_value}%` : `R${(d.discount_value / 100).toFixed(0)}`}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {d.min_order_cents > 0 ? `R${(d.min_order_cents / 100).toFixed(0)}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {d.used_count}{d.max_uses ? ` / ${d.max_uses}` : ''}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleToggle(d.id, d.is_active)} className={`px-2 py-1 rounded-full text-xs font-medium ${d.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {d.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEdit(d)} className="text-gray-400 hover:text-blue-500 mr-3"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(d.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingDiscount ? 'Edit' : 'New'} Discount Code</h2>
              <button onClick={() => setShowModal(false)}><X className="h-6 w-6" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code *</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full border rounded-lg px-3 py-2" placeholder="SUMMER20" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Summer sale discount" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as any })} className="w-full border rounded-lg px-3 py-2">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (Rands)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value</label>
                  <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: parseInt(e.target.value) })} className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Order (R)</label>
                  <input type="number" value={form.min_order_cents} onChange={(e) => setForm({ ...form, min_order_cents: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg px-3 py-2" placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Uses</label>
                  <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="Unlimited" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Expires</label>
                <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>

            <button onClick={handleSave} disabled={saving || !form.code} className="w-full mt-6 bg-[#ff6b35] text-white py-3 rounded-lg font-bold hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</> : <><CheckCircle className="h-5 w-5" /> Save Code</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
