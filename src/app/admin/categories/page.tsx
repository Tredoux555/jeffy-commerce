'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, Pencil, X, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category } from '@/types/database';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });

  const fetchCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleNameChange = (name: string) => {
    setForm({ ...form, name, slug: slugify(name) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const supabase = createClient();
      if (editingId) {
        await supabase.from('categories').update({
          name: form.name, slug: form.slug, description: form.description || null
        }).eq('id', editingId);
      } else {
        await supabase.from('categories').insert({
          name: form.name, slug: form.slug, description: form.description || null
        });
      }
      setForm({ name: '', slug: '', description: '' });
      setShowForm(false);
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      alert('Failed to save category');
    }
    setSaving(false);
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    const supabase = createClient();
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  const toggleActive = async (cat: Category) => {
    const supabase = createClient();
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id);
    fetchCategories();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', slug: '', description: '' }); }}>
          <Plus className="h-4 w-4 mr-2" />Add Category
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h2 className="font-semibold mb-4">{editingId ? 'Edit' : 'New'} Category</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <Input required value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editingId ? 'Update' : 'Create')}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Slug</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{cat.name}</td>
                <td className="py-3 px-4 text-gray-600">{cat.slug}</td>
                <td className="py-3 px-4">
                  <button onClick={() => toggleActive(cat)} className={`text-xs px-2 py-1 rounded-full ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800"><Pencil className="h-4 w-4 inline" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4 inline" /></button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-gray-500">No categories yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
