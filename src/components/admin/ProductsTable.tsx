'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Eye, EyeOff } from 'lucide-react';
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

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    setLoadingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      if (res.ok) setProducts(products.filter(p => p.id !== product.id));
      else alert('Failed to delete');
    } catch { alert('Failed to delete'); }
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
      if (res.ok) {
        setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
      } else alert('Failed to update');
    } catch { alert('Failed to update'); }
    setLoadingId(null);
  };

  return (
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
          {products.length > 0 ? products.map((product) => (
            <tr key={product.id} className={`hover:bg-gray-50 ${loadingId === product.id ? 'opacity-50' : ''}`}>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                    {product.primary_image_url ? (
                      <img src={product.primary_image_url} alt="" className="w-full h-full object-cover" />
                    ) : <div className="flex items-center justify-center h-full text-gray-400 text-xs">No img</div>}
                  </div>
                  <div className="max-w-xs">
                    <p className="font-medium truncate">{product.name}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 font-medium">{formatCurrency(product.selling_price_cents)}</td>
              <td className="py-3 px-4">{product.quantity}</td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleToggleStatus(product)}
                  disabled={loadingId === product.id}
                  className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${
                    product.status === 'active' 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  }`}
                >
                  {product.status === 'active' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {product.status === 'active' ? 'Live' : 'Draft'}
                </button>
              </td>
              <td className="py-3 px-4 text-right space-x-2">
                <Link href={`/admin/products/${product.id}`} className="text-jeffy-orange hover:underline">Edit</Link>
                <button onClick={() => handleDelete(product)} className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4 inline" />
                </button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={5} className="py-12 text-center text-gray-500">No products yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
