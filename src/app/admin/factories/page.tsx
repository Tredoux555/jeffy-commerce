'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
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
  Filter,
  Package
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
  'Other'
];

export default function AdminFactoriesPage() {
  const [factories, setFactories] = useState<FactoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: 'Beauty & Personal Care',
    products: '',
    notes: '',
    quality_rating: 3
  });

  const supabase = createClient();

  const fetchFactories = async () => {
    try {
      const { data, error } = await supabase
        .from('factories')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFactories(data || []);
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
    // Extract factory name from 1688 URL like https://www.1688.com/factory/goldhdshiny.html
    const match = url.match(/1688\.com\/factory\/([^\/\.]+)/);
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
        const { error } = await supabase
          .from('factories')
          .update(payload)
          .eq('id', editingId);
        
        if (error) throw error;
        setSuccess('Factory updated!');
      } else {
        const { error } = await supabase
          .from('factories')
          .insert([payload]);
        
        if (error) throw error;
        setSuccess('Factory saved!');
      }

      resetForm();
      fetchFactories();
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
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this factory?')) return;

    try {
      const { error } = await supabase
        .from('factories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setSuccess('Factory deleted');
      fetchFactories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter factories
  const filteredFactories = factories.filter(f => {
    const matchesSearch = 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.products.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.notes && f.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from saved factories
  const usedCategories = [...new Set(factories.map(f => f.category))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Factory className="h-7 w-7 text-orange-500" />
            1688 Factory Tracker
          </h1>
          <p className="text-slate-400 mt-1">Save and organize your favorite 1688 suppliers</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Factory
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
          {success}
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {editingId ? 'Edit Factory' : 'Add New Factory'}
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  1688 Factory URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.1688.com/factory/..."
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Factory Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Factory name"
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Quality Rating
                </label>
                <div className="flex items-center gap-1 py-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, quality_rating: rating }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          rating <= formData.quality_rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Products (comma-separated)
              </label>
              <input
                type="text"
                value={formData.products}
                onChange={(e) => setFormData(prev => ({ ...prev, products: e.target.value }))}
                placeholder="nail scissors, tweezers, cuticle pushers"
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Quality observations, pricing notes, communication experience..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                {editingId ? 'Update' : 'Save'} Factory
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search factories or products..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Categories</option>
            {usedCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Total Factories</p>
          <p className="text-2xl font-bold text-white">{factories.length}</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Categories</p>
          <p className="text-2xl font-bold text-white">{usedCategories.length}</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Top Rated (5★)</p>
          <p className="text-2xl font-bold text-white">{factories.filter(f => f.quality_rating === 5).length}</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
          <p className="text-slate-400 text-sm">Total Products</p>
          <p className="text-2xl font-bold text-white">{factories.reduce((sum, f) => sum + f.products.length, 0)}</p>
        </div>
      </div>

      {/* Factory List */}
      {filteredFactories.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <Factory className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {factories.length === 0 ? 'No factories saved yet' : 'No factories match your search'}
          </h3>
          <p className="text-slate-400">
            {factories.length === 0 
              ? 'Start by adding your first 1688 factory'
              : 'Try adjusting your search or filter'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFactories.map(factory => (
            <div
              key={factory.id}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white truncate">{factory.name}</h3>
                    <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded-full whitespace-nowrap">
                      {factory.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <Star
                        key={rating}
                        className={`h-4 w-4 ${
                          rating <= factory.quality_rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>

                  {factory.products.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {factory.products.map((product, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded"
                        >
                          <Package className="h-3 w-3" />
                          {product}
                        </span>
                      ))}
                    </div>
                  )}

                  {factory.notes && (
                    <p className="text-slate-400 text-sm mb-3">{factory.notes}</p>
                  )}

                  <a
                    href={factory.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on 1688
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(factory)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(factory.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
