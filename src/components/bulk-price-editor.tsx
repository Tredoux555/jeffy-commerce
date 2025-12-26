'use client';

import { useState } from 'react';
import { DollarSign, Percent, Save, X, Search, Check, AlertCircle, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  sku?: string;
  selling_price_cents: number;
  compare_at_price_cents?: number;
  cost_price_cents?: number;
}

export function BulkPriceEditor({ products: initialProducts }: { products: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'fixed' | 'percent'>('percent');
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [adjustmentMode, setAdjustmentMode] = useState<'increase' | 'decrease' | 'set'>('increase');
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Map<string, number>>(new Map());

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

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
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(p => p.id)));
    }
  };

  const calculateNewPrice = (currentPrice: number): number => {
    const value = parseFloat(adjustmentValue) || 0;
    
    if (adjustmentMode === 'set') {
      return adjustmentType === 'fixed' ? value * 100 : currentPrice;
    }
    
    let adjustment = 0;
    if (adjustmentType === 'percent') {
      adjustment = (currentPrice * value) / 100;
    } else {
      adjustment = value * 100;
    }
    
    if (adjustmentMode === 'decrease') {
      return Math.max(0, currentPrice - adjustment);
    }
    return currentPrice + adjustment;
  };

  const previewChanges = () => {
    const newChanges = new Map<string, number>();
    selected.forEach(id => {
      const product = products.find(p => p.id === id);
      if (product) {
        newChanges.set(id, calculateNewPrice(product.selling_price_cents));
      }
    });
    setChanges(newChanges);
  };

  const applyChanges = async () => {
    if (changes.size === 0) return;
    
    setSaving(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProducts(prev => prev.map(p => {
        const newPrice = changes.get(p.id);
        if (newPrice !== undefined) {
          return { ...p, selling_price_cents: Math.round(newPrice) };
        }
        return p;
      }));
      
      setChanges(new Map());
      setSelected(new Set());
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bulk Price Editor</h1>
        {changes.size > 0 && (
          <div className="flex gap-2">
            <button onClick={() => setChanges(new Map())} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button 
              onClick={applyChanges} 
              disabled={saving}
              className="flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              Save {changes.size} Changes
            </button>
          </div>
        )}
      </div>

      {/* Adjustment Controls */}
      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-bold mb-4">Price Adjustment</h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Action</label>
            <select 
              value={adjustmentMode} 
              onChange={(e) => setAdjustmentMode(e.target.value as any)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="increase">Increase by</option>
              <option value="decrease">Decrease by</option>
              <option value="set">Set to</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setAdjustmentType('percent')}
                className={`flex-1 py-2 flex items-center justify-center gap-1 ${adjustmentType === 'percent' ? 'bg-[#ff6b35] text-white' : 'bg-gray-50'}`}
              >
                <Percent className="h-4 w-4" /> %
              </button>
              <button
                onClick={() => setAdjustmentType('fixed')}
                className={`flex-1 py-2 flex items-center justify-center gap-1 ${adjustmentType === 'fixed' ? 'bg-[#ff6b35] text-white' : 'bg-gray-50'}`}
              >
                <DollarSign className="h-4 w-4" /> R
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Value</label>
            <input
              type="number"
              value={adjustmentValue}
              onChange={(e) => setAdjustmentValue(e.target.value)}
              placeholder={adjustmentType === 'percent' ? '10' : '50'}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={previewChanges}
              disabled={selected.size === 0 || !adjustmentValue}
              className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              Preview ({selected.size})
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border rounded-xl"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={selectAll}
                  className="rounded"
                />
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Product</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Current Price</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">New Price</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((product) => {
              const newPrice = changes.get(product.id);
              const hasChange = newPrice !== undefined;
              const diff = hasChange ? newPrice - product.selling_price_cents : 0;
              
              return (
                <tr key={product.id} className={`hover:bg-gray-50 ${hasChange ? 'bg-amber-50' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{product.name}</p>
                    {product.sku && <p className="text-sm text-gray-500">SKU: {product.sku}</p>}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(product.selling_price_cents)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {hasChange ? (
                      <span className="font-bold text-[#ff6b35]">{formatCurrency(newPrice)}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {hasChange && (
                      <span className={`font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : ''}`}>
                        {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {changes.size > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <p className="text-amber-800">
            <strong>{changes.size} products</strong> will be updated. Review changes above and click Save to apply.
          </p>
        </div>
      )}
    </div>
  );
}
