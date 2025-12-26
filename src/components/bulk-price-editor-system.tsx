'use client';

import { useState } from 'react';
import { DollarSign, Percent, Save, Undo, Search, Check, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  sku: string;
  currentPrice: number;
  comparePrice: number | null;
  costPrice: number | null;
  newPrice?: number;
}

type AdjustmentType = 'fixed' | 'percentage' | 'markup';

export function BulkPriceEditor() {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Wireless Earbuds', sku: 'WE001', currentPrice: 29900, comparePrice: 39900, costPrice: 15000 },
    { id: '2', name: 'Phone Case', sku: 'PC001', currentPrice: 9900, comparePrice: 14900, costPrice: 5000 },
    { id: '3', name: 'USB Cable', sku: 'UC001', currentPrice: 4900, comparePrice: null, costPrice: 2000 },
    { id: '4', name: 'Bluetooth Speaker', sku: 'BS001', currentPrice: 59900, comparePrice: 79900, costPrice: 30000 },
  ]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>('percentage');
  const [adjustmentValue, setAdjustmentValue] = useState<string>('');
  const [direction, setDirection] = useState<'increase' | 'decrease'>('increase');
  const [search, setSearch] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

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
    if (!adjustmentValue || selected.size === 0) return;

    const value = parseFloat(adjustmentValue);
    if (isNaN(value)) return;

    setProducts(prev => prev.map(product => {
      if (!selected.has(product.id)) return product;

      let newPrice = product.currentPrice;

      switch (adjustmentType) {
        case 'fixed':
          newPrice = direction === 'increase' 
            ? product.currentPrice + (value * 100) 
            : product.currentPrice - (value * 100);
          break;
        case 'percentage':
          const percentChange = product.currentPrice * (value / 100);
          newPrice = direction === 'increase'
            ? product.currentPrice + percentChange
            : product.currentPrice - percentChange;
          break;
        case 'markup':
          if (product.costPrice) {
            newPrice = product.costPrice * (1 + value / 100);
          }
          break;
      }

      return { ...product, newPrice: Math.round(Math.max(0, newPrice)) };
    }));

    setHasChanges(true);
  };

  const resetChanges = () => {
    setProducts(prev => prev.map(p => ({ ...p, newPrice: undefined })));
    setHasChanges(false);
  };

  const saveChanges = async () => {
    // Would call API to save
    setProducts(prev => prev.map(p => ({
      ...p,
      currentPrice: p.newPrice ?? p.currentPrice,
      newPrice: undefined,
    })));
    setHasChanges(false);
    setSelected(new Set());
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bulk Price Editor</h1>
        {hasChanges && (
          <div className="flex gap-2">
            <button onClick={resetChanges} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Undo className="h-4 w-4" /> Reset
            </button>
            <button onClick={saveChanges} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Adjustment Controls */}
      <div className="bg-white rounded-xl border p-4">
        <h2 className="font-medium mb-4">Adjust Prices ({selected.size} selected)</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Type</label>
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as AdjustmentType)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount (R)</option>
              <option value="markup">Markup from Cost</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as 'increase' | 'decrease')}
              className="border rounded-lg px-3 py-2"
              disabled={adjustmentType === 'markup'}
            >
              <option value="increase">Increase ↑</option>
              <option value="decrease">Decrease ↓</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              {adjustmentType === 'percentage' ? 'Percent' : adjustmentType === 'markup' ? 'Markup %' : 'Amount (R)'}
            </label>
            <div className="relative">
              {adjustmentType === 'fixed' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">R</span>}
              {adjustmentType !== 'fixed' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>}
              <input
                type="number"
                value={adjustmentValue}
                onChange={(e) => setAdjustmentValue(e.target.value)}
                className={`border rounded-lg py-2 w-32 ${adjustmentType === 'fixed' ? 'pl-8 pr-3' : 'pl-3 pr-8'}`}
                placeholder="0"
              />
            </div>
          </div>

          <button
            onClick={applyAdjustment}
            disabled={selected.size === 0 || !adjustmentValue}
            className="px-6 py-2 bg-[#ff6b35] text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b">
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

        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === filteredProducts.length && filteredProducts.length > 0}
                  onChange={selectAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Cost</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Current Price</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">New Price</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map((product) => {
              const priceChange = product.newPrice ? product.newPrice - product.currentPrice : 0;
              const percentChange = product.newPrice ? ((product.newPrice - product.currentPrice) / product.currentPrice) * 100 : 0;
              
              return (
                <tr key={product.id} className={`hover:bg-gray-50 ${product.newPrice ? 'bg-amber-50' : ''}`}>
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
                    <p className="text-sm text-gray-500">{product.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {product.costPrice ? formatCurrency(product.costPrice) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(product.currentPrice)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {product.newPrice ? (
                      <span className="font-bold text-[#ff6b35]">{formatCurrency(product.newPrice)}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {product.newPrice ? (
                      <span className={priceChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {priceChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
                      </span>
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
