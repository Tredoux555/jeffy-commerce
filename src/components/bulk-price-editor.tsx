'use client';

import { useState } from 'react';
import { DollarSign, Percent, Save, Undo, Search, Check, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  sku?: string;
  selling_price_cents: number;
  compare_at_price_cents?: number;
  cost_price_cents?: number;
}

interface BulkPriceEditorProps {
  products: Product[];
  onSave: (updates: Array<{ id: string; selling_price_cents: number; compare_at_price_cents?: number }>) => Promise<void>;
}

export function BulkPriceEditor({ products: initialProducts, onSave }: BulkPriceEditorProps) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'fixed' | 'percent' | 'markup'>('percent');
  const [bulkValue, setBulkValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Map<string, { old: number; new: number }>>(new Map());

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

  const applyBulkChange = () => {
    if (!bulkValue || selected.size === 0) return;

    const value = parseFloat(bulkValue);
    const newProducts = [...products];
    const newChanges = new Map(changes);

    selected.forEach(id => {
      const idx = newProducts.findIndex(p => p.id === id);
      if (idx === -1) return;

      const product = newProducts[idx];
      const oldPrice = product.selling_price_cents;
      let newPrice = oldPrice;

      switch (bulkAction) {
        case 'fixed':
          newPrice = Math.round(value * 100);
          break;
        case 'percent':
          newPrice = Math.round(oldPrice * (1 + value / 100));
          break;
        case 'markup':
          if (product.cost_price_cents) {
            newPrice = Math.round(product.cost_price_cents * (1 + value / 100));
          }
          break;
      }

      if (newPrice !== oldPrice) {
        newProducts[idx] = { ...product, selling_price_cents: newPrice };
        newChanges.set(id, { old: oldPrice, new: newPrice });
      }
    });

    setProducts(newProducts);
    setChanges(newChanges);
  };

  const updateSinglePrice = (id: string, newPriceCents: number) => {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return;

    const oldPrice = products[idx].selling_price_cents;
    const newProducts = [...products];
    newProducts[idx] = { ...products[idx], selling_price_cents: newPriceCents };
    setProducts(newProducts);

    const newChanges = new Map(changes);
    newChanges.set(id, { old: oldPrice, new: newPriceCents });
    setChanges(newChanges);
  };

  const revertChange = (id: string) => {
    const change = changes.get(id);
    if (!change) return;

    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return;

    const newProducts = [...products];
    newProducts[idx] = { ...products[idx], selling_price_cents: change.old };
    setProducts(newProducts);

    const newChanges = new Map(changes);
    newChanges.delete(id);
    setChanges(newChanges);
  };

  const handleSave = async () => {
    if (changes.size === 0) return;

    setSaving(true);
    try {
      const updates = Array.from(changes.entries()).map(([id, { new: newPrice }]) => ({
        id,
        selling_price_cents: newPrice,
      }));
      await onSave(updates);
      setChanges(new Map());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-4">Bulk Price Editor</h2>

        {/* Bulk Actions */}
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Action</label>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value as any)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="percent">Adjust by %</option>
              <option value="fixed">Set fixed price</option>
              <option value="markup">Markup from cost</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              {bulkAction === 'fixed' ? 'Price (R)' : 'Percentage (%)'}
            </label>
            <div className="relative">
              {bulkAction === 'fixed' ? (
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              ) : (
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              <input
                type="number"
                value={bulkValue}
                onChange={(e) => setBulkValue(e.target.value)}
                placeholder={bulkAction === 'percent' ? '10 or -10' : '299.00'}
                className="pl-9 pr-4 py-2 border rounded-lg w-32"
              />
            </div>
          </div>
          <button
            onClick={applyBulkChange}
            disabled={!bulkValue || selected.size === 0}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Apply to {selected.size} selected
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={selectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">SKU</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Cost</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Current Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">New Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Margin</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(product => {
              const change = changes.get(product.id);
              const margin = product.cost_price_cents 
                ? Math.round((product.selling_price_cents - product.cost_price_cents) / product.selling_price_cents * 100)
                : null;

              return (
                <tr key={product.id} className={change ? 'bg-amber-50' : ''}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{product.name}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{product.sku || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {product.cost_price_cents ? formatCurrency(product.cost_price_cents) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {change ? (
                      <span className="text-gray-400 line-through">{formatCurrency(change.old)}</span>
                    ) : (
                      formatCurrency(product.selling_price_cents)
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={(product.selling_price_cents / 100).toFixed(2)}
                      onChange={(e) => updateSinglePrice(product.id, Math.round(parseFloat(e.target.value) * 100))}
                      className={`w-24 px-2 py-1 border rounded ${change ? 'border-amber-400 bg-amber-50' : ''}`}
                      step="0.01"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {margin !== null && (
                      <span className={margin < 20 ? 'text-red-500' : margin > 50 ? 'text-green-500' : ''}>
                        {margin}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {change && (
                      <button onClick={() => revertChange(product.id)} className="text-gray-400 hover:text-gray-600">
                        <Undo className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {changes.size > 0 && (
        <div className="p-4 border-t bg-amber-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertCircle className="h-5 w-5" />
            <span>{changes.size} unsaved changes</span>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#ff6b35] text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      )}
    </div>
  );
}
