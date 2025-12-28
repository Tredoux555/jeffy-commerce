'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Minus, X, Edit, Save, Trash2, GripVertical, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  productCount: number;
  order: number;
  isActive: boolean;
}

interface CategoryManagerProps {
  categories: Category[];
  onSave: (category: Partial<Category>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (ids: string[]) => Promise<void>;
}

export function CategoryManager({ categories, onSave, onDelete, onReorder }: CategoryManagerProps) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const parentCategories = categories.filter(c => !c.parentId);
  const getChildren = (parentId: string) => categories.filter(c => c.parentId === parentId);

  const handleSave = async (data: Partial<Category>) => {
    setLoading(true);
    await onSave(data);
    setShowForm(false);
    setEditingId(null);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Products will be moved to uncategorized.')) return;
    setLoading(true);
    await onDelete(id);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Categories</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      {/* Category Tree */}
      <div className="bg-white rounded-xl border">
        {parentCategories.map((category) => (
          <div key={category.id}>
            <CategoryRow
              category={category}
              onEdit={() => setEditingId(category.id)}
              onDelete={() => handleDelete(category.id)}
              isEditing={editingId === category.id}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
            {/* Children */}
            {getChildren(category.id).map((child) => (
              <div key={child.id} className="pl-8">
                <CategoryRow
                  category={child}
                  onEdit={() => setEditingId(child.id)}
                  onDelete={() => handleDelete(child.id)}
                  isEditing={editingId === child.id}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                  isChild
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Add Form Modal */}
      {showForm && (
        <CategoryForm
          parentCategories={parentCategories}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      )}
    </div>
  );
}

function CategoryRow({ 
  category, 
  onEdit, 
  onDelete, 
  isEditing, 
  onSave, 
  onCancel,
  isChild = false 
}: { 
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
  onSave: (data: Partial<Category>) => void;
  onCancel: () => void;
  isChild?: boolean;
}) {
  const [editData, setEditData] = useState({
    name: category.name,
    slug: category.slug,
    isActive: category.isActive
  });

  if (isEditing) {
    return (
      <div className="flex items-center gap-4 p-4 border-b bg-orange-50">
        <input
          type="text"
          value={editData.name}
          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          className="flex-1 px-3 py-2 border rounded-lg"
          autoFocus
        />
        <input
          type="text"
          value={editData.slug}
          onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
          className="w-32 px-3 py-2 border rounded-lg font-mono text-sm"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={editData.isActive}
            onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })}
          />
          Active
        </label>
        <button onClick={() => onSave({ id: category.id, ...editData })} className="text-green-600">
          <Save className="h-4 w-4" />
        </button>
        <button onClick={onCancel} className="text-gray-400">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4 border-b hover:bg-gray-50">
      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
      
      {category.image && (
        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
          <Image src={category.image} alt="" width={40} height={40} className="object-cover" />
        </div>
      )}
      
      <div className="flex-1">
        <p className="font-medium">{category.name}</p>
        <p className="text-xs text-gray-500 font-mono">/{category.slug}</p>
      </div>
      
      <span className="text-sm text-gray-500">{category.productCount} products</span>
      
      <span className={`px-2 py-0.5 rounded-full text-xs ${
        category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {category.isActive ? 'Active' : 'Inactive'}
      </span>
      
      <div className="flex items-center gap-2">
        <button onClick={onEdit} className="text-gray-400 hover:text-[#ff6b35]">
          <Edit className="h-4 w-4" />
        </button>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function CategoryForm({ 
  parentCategories, 
  onSave, 
  onCancel, 
  loading,
  initialData
}: { 
  parentCategories: Category[];
  onSave: (data: Partial<Category>) => void;
  onCancel: () => void;
  loading: boolean;
  initialData?: Category;
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    parentId: initialData?.parentId || '',
    isActive: initialData?.isActive ?? true
  });

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold mb-4">{initialData ? 'Edit' : 'Add'} Category</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ 
                ...formData, 
                name: e.target.value,
                slug: formData.slug || generateSlug(e.target.value)
              })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Category name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg font-mono"
              placeholder="category-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Parent Category</label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">None (Top Level)</option>
              {parentCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg resize-none"
              rows={3}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-[#ff6b35] rounded"
            />
            <span>Active</span>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={() => onSave(formData)} disabled={loading} className="flex-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
