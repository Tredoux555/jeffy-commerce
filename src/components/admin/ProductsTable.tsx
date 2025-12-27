'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  primary_image_url: string | null;
  selling_price_cents: number;
  quantity: number;
  status: string;
  categories: { name: string } | null;
}

export function ProductsTable({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    setDeletingId(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p.id !== product.id));
      } else {
        alert('Failed to delete');
      }
    } catch {
      alert('Failed to delete');
    }
    setDeletingId(null);
  };

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Product</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Category</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Price</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Stock</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.length > 0 ? (
            products.map((product) => (
              <tr key={product.id} className={`hover:bg-gray-50 ${deletingId === product.id ? 'opacity-50' : ''}`}>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      {product.primary_image_url ? (
                        <img src={product.primary_image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs">No img</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600">{product.categories?.name || '-'}</td>
                <td className="py-3 px-4 font-medium">{formatCurrency(product.selling_price_cents)}</td>
                <td className="py-3 px-4">
                  <span className={product.quantity > 10 ? 'text-green-600' : product.quantity > 0 ? 'text-orange-600' : 'text-red-600'}>
                    {product.quantity}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {product.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Link href={`/admin/products/${product.id}`} className="text-jeffy-orange hover:text-jeffy-accent">Edit</Link>
                  <button
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50 ml-3"
                  >
                    <Trash2 className="h-4 w-4 inline" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="py-12 text-center text-gray-500">No products yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
