'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  source_data: {
    categorySuggestion?: string;
    costPriceCNY?: number;
  };
}

interface Category {
  id: string;
  name: string;
}

// Products that need fixing - identified from audit
const CATEGORY_FIXES: Record<string, string> = {
  // "Other" products -> correct category based on name/content
  'Concealer': 'Beauty & Skincare',
  'Eye Shadow': 'Beauty & Skincare',
  'Nail Art': 'Beauty & Skincare',
  'Wig': 'Hair Care',
  'Hair': 'Hair Care',
  'Hairpin': 'Fashion & Accessories',
  'clip': 'Fashion & Accessories',
  'crystal': 'Fashion & Accessories',
  'Jewelry': 'Fashion & Accessories',
  'Eye Essence': 'Beauty & Skincare',
  // Uncategorized
  'Scrub': 'Beauty & Skincare',
  'Body Scrub': 'Beauty & Skincare',
  'Pants': 'Fashion & Accessories',
  'Synthetic Fiber': 'Hair Care',
};

export default function CategoryFixerPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [problemProducts, setProblemProducts] = useState<Product[]>([]);
  const [badNameProducts, setBadNameProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const supabase = createClient();

    // Load categories
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (cats) setCategories(cats);

    // Load all 1688 products
    const { data: products } = await supabase
      .from('products')
      .select('id, name, source_data')
      .eq('source', '1688');

    if (products) {
      // Filter problem products
      const problems: Product[] = [];
      const badNames: Product[] = [];

      for (const p of products) {
        const suggestion = p.source_data?.categorySuggestion;
        const name = p.name || '';

        // Check for Chinese company names
        if (name.includes('有限公司') || name.includes('厂') || /^[\u4e00-\u9fff]+$/.test(name.substring(0, 5))) {
          badNames.push(p);
          continue;
        }

        // Check for uncategorized or "Other"
        if (!suggestion || suggestion === 'Uncategorized' || suggestion === 'Other') {
          problems.push(p);
        }
      }

      setProblemProducts(problems);
      setBadNameProducts(badNames);
    }

    setLoading(false);
  };

  const suggestCategory = (productName: string): string | null => {
    const nameLower = productName.toLowerCase();
    for (const [keyword, category] of Object.entries(CATEGORY_FIXES)) {
      if (nameLower.includes(keyword.toLowerCase())) {
        return category;
      }
    }
    return null;
  };

  const updateCategory = async (productId: string, categoryName: string) => {
    setSaving(productId);
    const supabase = createClient();

    const category = categories.find(c => c.name === categoryName);
    if (!category) {
      alert(`Category "${categoryName}" not found`);
      setSaving(null);
      return;
    }

    // Get current product
    const { data: product } = await supabase
      .from('products')
      .select('source_data')
      .eq('id', productId)
      .single();

    // Update category_id AND source_data.categorySuggestion
    const { error } = await supabase
      .from('products')
      .update({
        category_id: category.id,
        source_data: {
          ...product?.source_data,
          categorySuggestion: categoryName,
          categoryFixedAt: new Date().toISOString()
        }
      })
      .eq('id', productId);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      // Remove from problem list
      setProblemProducts(prev => prev.filter(p => p.id !== productId));
    }

    setSaving(null);
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Delete this product?')) return;
    
    setSaving(productId);
    const supabase = createClient();

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setBadNameProducts(prev => prev.filter(p => p.id !== productId));
      setProblemProducts(prev => prev.filter(p => p.id !== productId));
    }

    setSaving(null);
  };

  const autoFixAll = async () => {
    if (!confirm(`Auto-fix ${problemProducts.length} products based on name matching?`)) return;

    for (const product of problemProducts) {
      const suggested = suggestCategory(product.name);
      if (suggested) {
        await updateCategory(product.id, suggested);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-jeffy-orange" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-yellow-500" />
            Category Fixer
          </h1>
          <p className="text-gray-600 mt-1">
            Fix uncategorized and miscategorized products
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {problemProducts.length > 0 && (
            <button
              onClick={autoFixAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Check className="h-4 w-4" />
              Auto-Fix All
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 font-semibold">{problemProducts.length} Need Categorization</p>
          <p className="text-sm text-yellow-600">Uncategorized or in "Other"</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-semibold">{badNameProducts.length} Bad Names</p>
          <p className="text-sm text-red-600">Chinese company names - should delete</p>
        </div>
      </div>

      {/* Bad Name Products - Delete */}
      {badNameProducts.length > 0 && (
        <div className="bg-white rounded-xl border mb-6">
          <div className="px-4 py-3 border-b bg-red-50">
            <h3 className="font-semibold text-red-800">🚫 Products to Delete (Bad Names)</h3>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {badNameProducts.map(product => (
              <div key={product.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{product.name.substring(0, 50)}...</p>
                  <p className="text-sm text-gray-500">{product.id.substring(0, 8)}</p>
                </div>
                <button
                  onClick={() => deleteProduct(product.id)}
                  disabled={saving === product.id}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                >
                  {saving === product.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problem Products - Fix Category */}
      {problemProducts.length > 0 && (
        <div className="bg-white rounded-xl border">
          <div className="px-4 py-3 border-b bg-yellow-50">
            <h3 className="font-semibold text-yellow-800">📁 Products to Categorize</h3>
          </div>
          <div className="divide-y">
            {problemProducts.map(product => {
              const suggested = suggestCategory(product.name);
              
              return (
                <div key={product.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        Current: {product.source_data?.categorySuggestion || 'None'}
                        {suggested && (
                          <span className="ml-2 text-green-600">→ Suggested: {suggested}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        defaultValue={suggested || ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            updateCategory(product.id, e.target.value);
                          }
                        }}
                        disabled={saving === product.id}
                      >
                        <option value="">Select category...</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                      {saving === product.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {problemProducts.length === 0 && badNameProducts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-green-800 font-semibold text-lg">All products categorized!</p>
          <p className="text-green-600">No issues found.</p>
        </div>
      )}
    </div>
  );
}
