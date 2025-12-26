'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Percent, Save, Loader2, Search, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  sku: string;
  selling_price_cents: number;
  compare_at_price_cents: number | null;
}

export function BulkPriceEditor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adjustType, setAdjustType] = useState<'percent' | 'fixed'>('percent');
  const [adjustValue, setAdjustValue] = useState('');
  const [adjustDirection, setAdjustDirection] = useState<'increase' | 'decrease'>('increase');
  const [changes, setChanges] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products?limit=100');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const selectAll = () => {
    if (selected.size === filteredProducts.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const applyAdjustment = () => {
    if (!adjustValue || selected.size === 0) return;
    
    const value = parseFloat(adjustValue);
    const newChanges = new Map(changes);
    
    selected.forEach(id => {
      const product = products.find(p => p.id === id);
      if (!product) return;
      
      let newPrice = product.selling_price_cents;
      
      if (adjustType === 'percent') {
        const adjustment = (product.selling_price_cents * value) / 100;
        newPrice = adjustDirection === 'increase' 
          ? product.selling_price_cents + adjustment 
          : product.selling_price_cents - adjustment;
      } else {
        const adjustment = value * 100; // Convert to cents
        newPrice = adjustDirection === 'increase' 
          ? product.selling_price_cents + adjustment 
          : product.selling_price_cents - adjustment;
      }
      
      newChanges.set(id, Math.max(0, Math.round(newPrice)));
    });
    
    setChanges(newChanges);
  };

  const saveChanges = async () => {
    if (changes.size === 0) return;
    
    setSaving(true);
    try {
      const updates = Array.from(changes.entries()).map(([id, price]) => ({ id, selling_price_cents: price }));
      await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });
      
      // Update local state
      setProducts(products.map(p => changes.has(p.id) ? { ...p, selling_price_cents: changes.get(p.id)! } : p));
      setChanges(new Map());
      setSelected(new Set());
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">Bulk Price Editor</h2>
        
        {/* Adjustment Controls */}
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-sm text-gray-500">Type</label>
            <select value={adjustType} onChange={(e) => setAdjustType(e.target.value as any)} className="block border rounded-lg px-3 py-2">
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500">Direction</label>
            <select value={adjustDirection} onChange={(e) => setAdjustDirection(e.target.value as any)} className="block border rounded-lg px-3 py-2">
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-500">Value</label>
            <div className="relative">
              <input type="number" value={adjustValue} onChange={(e) => setAdjustValue(e.target.value)} className="border rounded-lg px-3 py-2 w-24" placeholder="10" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {adjustType === 'percent' ? '%' : 'R'}
              </span>
            </div>
          </div>
          <button onClick={applyAdjustment} disabled={!adjustValue || selected.size === 0} className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50">
            Apply to {selected.size} selected
          </button>
          {changes.size > 0 && (
            <button onClick={saveChanges} disabled={saving} className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save {changes.size} Changes
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
      </div>

      {/* Product List */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">
                <input type="checkbox" checked={selected.size === filteredProducts.length && filteredProducts.length > 0} onChange={selectAll} className="rounded" />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">SKU</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Current Price</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">New Price</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map((product) => {
              const newPrice = changes.get(product.id);
              const hasChange = newPrice !== undefined;
              
              return (
                <tr key={product.id} className={`hover:bg-gray-50 ${hasChange ? 'bg-green-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(product.id)} onChange={() => toggleSelect(product.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-sm">{product.sku}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(product.selling_price_cents)}</td>
                  <td className="px-4 py-3 text-right">
                    {hasChange ? (
                      <span className="text-green-600 font-bold">{formatCurrency(newPrice)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
