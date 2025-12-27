'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Eye, EyeOff, Search, CheckSquare, Square, Loader2 } from 'lucide-react';
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
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

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
    const drafts = products.filter(p => p.status === 'draft');
    for (const p of drafts) {
      await fetch(`/api/admin/products/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active', is_active: true })
      });
    }
    setProducts(products.map(p => p.status === 'draft' ? { ...p, status: 'active' } : p));
    setBulkLoading(false);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelected(newSelected);
  };

  const selectAll = () => {
    if (selected.size === filteredProducts.length) setSelected(new Set());
    else setSelected(new Set(filteredProducts.map(p => p.id)));
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2">
          <option value="all">All ({products.length})</option>
          <option value="draft">Draft ({draftCount})</option>
          <option value="active">Live ({liveCount})</option>
        </select>
        {draftCount > 0 && (
          <button
            onClick={handlePublishAllDrafts}
            disabled={bulkLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            Publish All Drafts
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Product</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Price</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Stock</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.length > 0 ? filteredProducts.map((product) => (
              <tr key={product.id} className={`hover:bg-gray-50 ${loadingId === product.id ? 'opacity-50' : ''}`}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      {product.primary_image_url ? (
                        <img src={product.primary_image_url} alt="" className="w-full h-full object-cover" />
                      ) : <div className="flex items-center justify-center h-full text-gray-400 text-xs">No img</div>}
                    </div>
                    <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                  </div>
                </td>
                <td className="py-3 px-4 font-medium">{formatCurrency(product.selling_price_cents)}</td>
                <td className="py-3 px-4">{product.quantity}</td>
                <td className="py-3 px-4">
                  <button onClick={() => handleToggleStatus(product)} disabled={loadingId === product.id}
                    className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {product.status === 'active' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {product.status === 'active' ? 'Live' : 'Draft'}
                  </button>
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  <Link href={`/admin/products/${product.id}`} className="text-jeffy-orange hover:underline">Edit</Link>
                  <button onClick={() => handleDelete(product)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4 inline" /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="py-12 text-center text-gray-500">{search ? 'No matching products' : 'No products yet.'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
