'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Eye, EyeOff, Search, Loader2, Pencil, Check, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  primary_image_url: string | null;
  selling_price_cents: number;
  quantity: number;
  status: string;
}

export function ProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const draftCount = products.filter(p => p.status === 'draft').length;
  const liveCount = products.filter(p => p.status === 'active').length;

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    setLoadingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      if (res.ok) setProducts(products.filter(p => p.id !== product.id));
    } catch {}
    setLoadingId(null);
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'draft' : 'active';
    setLoadingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, is_active: newStatus === 'active' })
      });
      if (res.ok) setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    } catch {}
    setLoadingId(null);
  };

  const handlePublishAllDrafts = async () => {
    if (!confirm(`Publish all ${draftCount} draft products?`)) return;
    setBulkLoading(true);
    for (const p of products.filter(p => p.status === 'draft')) {
      await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active', is_active: true })
      });
    }
    setProducts(products.map(p => p.status === 'draft' ? { ...p, status: 'active' } : p));
    setBulkLoading(false);
  };

  const startEditPrice = (product: Product) => {
    setEditingPrice(product.id);
    setPriceValue((product.selling_price_cents / 100).toFixed(2));
  };

  const savePrice = async (productId: string) => {
    const newPriceCents = Math.round(parseFloat(priceValue) * 100);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selling_price_cents: newPriceCents })
      });
      if (res.ok) {
        setProducts(products.map(p => p.id === productId ? { ...p, selling_price_cents: newPriceCents } : p));
      }
    } catch {}
    setEditingPrice(null);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === 'draft' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Draft ({draftCount})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === 'active' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Live ({liveCount})
          </button>
        </div>
        {draftCount > 0 && (
          <button
            onClick={handlePublishAllDrafts}
            disabled={bulkLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium"
          >
            {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            Publish All Drafts
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.primary_image_url ? (
                        <img src={product.primary_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">?</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/products/${product.id}`} className="font-medium text-gray-900 hover:text-orange-500 truncate block">
                        {product.name}
                      </Link>
                      <p className="text-xs text-gray-500 truncate">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {editingPrice === product.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">R</span>
                      <input
                        type="number"
                        value={priceValue}
                        onChange={(e) => setPriceValue(e.target.value)}
                        className="w-20 px-2 py-1 bg-white border border-gray-300 rounded text-sm"
                        autoFocus
                      />
                      <button onClick={() => savePrice(product.id)} className="p-1 text-green-600 hover:bg-gray-100 rounded">
                        <Check className="h-4 w-4" />
                      </button>
                      <button onClick={() => setEditingPrice(null)} className="p-1 text-red-600 hover:bg-gray-100 rounded">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => startEditPrice(product)} className="flex items-center gap-1 text-gray-900 hover:text-orange-500">
                      {formatCurrency(product.selling_price_cents)}
                      <Pencil className="h-3 w-3 opacity-50" />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-900">{product.quantity}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleStatus(product)}
                      disabled={loadingId === product.id}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title={product.status === 'active' ? 'Unpublish' : 'Publish'}
                    >
                      {loadingId === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      ) : product.status === 'active' ? (
                        <EyeOff className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-green-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      disabled={loadingId === product.id}
                      className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No products found
          </div>
        )}
      </div>
    </div>
  );
}
