'use client';

import { useState, useEffect } from 'react';
import { 
  Factory, 
  Plus, 
  Search, 
  Star, 
  ExternalLink, 
  Trash2, 
  Edit2,
  X,
  Save,
  Package,
  Globe,
  Copy,
  Check,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface FactoryRecord {
  id: string;
  name: string;
  url: string;
  category: string;
  products: string[];
  notes: string | null;
  quality_rating: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  'Beauty & Personal Care',
  'Electronics',
  'Home & Kitchen',
  'Fashion & Accessories',
  'Tools & Hardware',
  'Health & Wellness',
  'Sports & Outdoors',
  'Toys & Games',
  'Office & Stationery',
  'Food & Beverage',
  'Bags & Luggage',
  'Jewelry & Watches',
  'Baby & Kids',
  'Pet Supplies',
  'Auto & Motorcycle',
  'Other'
];

const CATEGORY_COLORS: Record<string, string> = {
  'Beauty & Personal Care': 'bg-pink-100 text-pink-700 border-pink-200',
  'Electronics': 'bg-blue-100 text-blue-700 border-blue-200',
  'Home & Kitchen': 'bg-amber-100 text-amber-700 border-amber-200',
  'Fashion & Accessories': 'bg-purple-100 text-purple-700 border-purple-200',
  'Tools & Hardware': 'bg-gray-100 text-gray-700 border-gray-200',
  'Health & Wellness': 'bg-green-100 text-green-700 border-green-200',
  'Sports & Outdoors': 'bg-orange-100 text-orange-700 border-orange-200',
  'Toys & Games': 'bg-red-100 text-red-700 border-red-200',
  'Office & Stationery': 'bg-slate-100 text-slate-700 border-slate-200',
  'Food & Beverage': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Bags & Luggage': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Jewelry & Watches': 'bg-rose-100 text-rose-700 border-rose-200',
  'Baby & Kids': 'bg-sky-100 text-sky-700 border-sky-200',
  'Pet Supplies': 'bg-teal-100 text-teal-700 border-teal-200',
  'Auto & Motorcycle': 'bg-zinc-100 text-zinc-700 border-zinc-200',
  'Other': 'bg-gray-100 text-gray-600 border-gray-200',
};

export default function AdminFactoriesPage() {
  const [factories, setFactories] = useState<FactoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [tableExists, setTableExists] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: 'Beauty & Personal Care',
    products: '',
    notes: '',
    quality_rating: 3
  });

  const fetchFactories = async () => {
    try {
      const res = await fetch('/api/admin/factories');
      const data = await res.json();
      
      if (data.error) {
        if (data.error.includes('does not exist')) {
          setTableExists(false);
          setError(null);
        } else {
          throw new Error(data.error);
        }
        return;
      }
      setTableExists(true);
      setFactories(data.factories || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactories();
  }, []);

  const extractFactoryName = (url: string): string => {
    const match = url.match(/1688\.com\/(?:factory|winport)\/([^\/\.]+)/);
    return match ? match[1] : '';
  };

  const handleUrlChange = (url: string) => {
    setFormData(prev => ({
      ...prev,
      url,
      name: prev.name || extractFactoryName(url)
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      category: 'Beauty & Personal Care',
      products: '',
      notes: '',
      quality_rating: 3
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.url || !formData.name) {
      setError('Factory URL and name are required');
      return;
    }

    try {
      const productsArray = formData.products
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const payload = {
        name: formData.name,
        url: formData.url,
        category: formData.category,
        products: productsArray,
        notes: formData.notes || null,
        quality_rating: formData.quality_rating,
        updated_at: new Date().toISOString()
      };

      if (editingId) {
        const res = await fetch('/api/admin/factories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...payload })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setSuccess('Factory updated successfully!');
      } else {
        const res = await fetch('/api/admin/factories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setSuccess('Factory saved successfully!');
      }

      resetForm();
      fetchFactories();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (factory: FactoryRecord) => {
    setFormData({
      name: factory.name,
      url: factory.url,
      category: factory.category,
      products: factory.products.join(', '),
      notes: factory.notes || '',
      quality_rating: factory.quality_rating
    });
    setEditingId(factory.id);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this factory? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/factories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuccess('Factory deleted');
      fetchFactories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredFactories = factories.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.products.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.notes && f.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const usedCategories = [...new Set(factories.map(f => f.category))];
  const topRated = factories.filter(f => f.quality_rating === 5).length;
  const totalProducts = factories.reduce((sum, f) => sum + f.products.length, 0);

  const renderStars = (rating: number, interactive = false, onChange?: (r: number) => void) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
            className={interactive ? 'cursor-pointer hover:scale-110 transition' : 'cursor-default'}
            disabled={!interactive}
          >
            <Star 
              className={`h-4 w-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
            />
          </button>
        ))}
      </div>
    );
  };

  // Table doesn't exist - show setup instructions
  if (!tableExists) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Factory className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold">1688 Factory Tracker</h1>
            <p className="text-gray-500">Save and organize your favorite Chinese suppliers</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">Database Setup Required</h3>
              <p className="text-amber-700 mt-1">
                The factories table needs to be created in your Supabase database.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-semibold mb-4">Run this SQL in Supabase:</h3>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">{`-- Create factories table
CREATE TABLE IF NOT EXISTS factories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  products TEXT[] DEFAULT '{}',
  notes TEXT,
  quality_rating INTEGER DEFAULT 3 
    CHECK (quality_rating >= 1 AND quality_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_factories_category 
  ON factories(category);
CREATE INDEX IF NOT EXISTS idx_factories_name 
  ON factories(name);

-- Enable RLS
ALTER TABLE factories ENABLE ROW LEVEL SECURITY;

-- Allow all operations
CREATE POLICY "Allow all" ON factories
  FOR ALL USING (true) WITH CHECK (true);`}</pre>
          </div>
          <div className="mt-4 flex gap-3">
            <a 
              href="https://supabase.com/dashboard" 
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <ExternalLink className="h-4 w-4" />
              Open Supabase Dashboard
            </a>
            <button 
              onClick={fetchFactories}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Factory className="h-7 w-7 text-orange-500" />
            1688 Factory Tracker
          </h1>
          <p className="text-gray-500 mt-1">Save and organize your favorite Chinese suppliers</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium"
        >
          <Plus className="h-5 w-5" />
          Add Factory
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 flex items-center gap-2">
          <Check className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white border rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit Factory' : 'Add New Factory'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1688 Factory URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://shop1234567890.1688.com or https://www.1688.com/factory/..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Factory Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Goldshine Beauty Tools"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quality Rating
                </label>
                <div className="flex items-center gap-3 h-[42px]">
                  {renderStars(formData.quality_rating, true, (r) => setFormData(prev => ({ ...prev, quality_rating: r })))}
                  <span className="text-sm text-gray-500">({formData.quality_rating}/5)</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Products (comma-separated)
              </label>
              <input
                type="text"
                value={formData.products}
                onChange={(e) => setFormData(prev => ({ ...prev, products: e.target.value }))}
                placeholder="e.g., nail scissors, tweezers, cuticle pushers"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="MOQ, communication quality, shipping notes..."
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition font-medium"
              >
                <Save className="h-4 w-4" />
                {editingId ? 'Update' : 'Save'} Factory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search factories or products..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
        >
          <option value="all">All Categories</option>
          {usedCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Factory className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{factories.length}</p>
              <p className="text-sm text-gray-500">Total Factories</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Globe className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{usedCategories.length}</p>
              <p className="text-sm text-gray-500">Categories</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{topRated}</p>
              <p className="text-sm text-gray-500">5-Star Rated</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalProducts}</p>
              <p className="text-sm text-gray-500">Products Tracked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Factory Grid */}
      {filteredFactories.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Factory className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No factories saved yet</h3>
          <p className="text-gray-500 mb-6">Start by adding your first 1688 factory supplier</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition"
          >
            <Plus className="h-4 w-4" />
            Add Your First Factory
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFactories.map((factory) => (
            <div key={factory.id} className="bg-white rounded-xl border hover:shadow-md transition group">
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{factory.name}</h3>
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full mt-1 border ${CATEGORY_COLORS[factory.category] || CATEGORY_COLORS['Other']}`}>
                      {factory.category}
                    </span>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {renderStars(factory.quality_rating)}
                  </div>
                </div>

                {/* Products */}
                {factory.products.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {factory.products.slice(0, 4).map((product, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {product}
                        </span>
                      ))}
                      {factory.products.length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">
                          +{factory.products.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {factory.notes && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{factory.notes}</p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex gap-1">
                    <a
                      href={factory.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                      title="Open in 1688"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => copyUrl(factory.url, factory.id)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                      title="Copy URL"
                    >
                      {copiedId === factory.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEdit(factory)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(factory.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
