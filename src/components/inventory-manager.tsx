'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingDown, Bell, Download, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  costPrice: number;
  supplier?: string;
  lastRestocked?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface InventoryManagerProps {
  items: InventoryItem[];
  onUpdateQuantity: (id: string, quantity: number) => Promise<void>;
  onReorder: (items: string[]) => Promise<void>;
  onExport: () => void;
}

export function InventoryManager({ items, onUpdateQuantity, onReorder, onExport }: InventoryManagerProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'low' && item.status === 'low_stock') ||
                         (filter === 'out' && item.status === 'out_of_stock');
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: items.length,
    lowStock: items.filter(i => i.status === 'low_stock').length,
    outOfStock: items.filter(i => i.status === 'out_of_stock').length,
    totalValue: items.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0)
  };

  const handleSaveQuantity = async (id: string) => {
    await onUpdateQuantity(id, parseInt(editValue) || 0);
    setEditingId(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAllLowStock = () => {
    const lowStockIds = items.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').map(i => i.id);
    setSelectedItems(lowStockIds);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <Package className="h-5 w-5 text-[#ff6b35] mb-2" />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Products</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <TrendingDown className="h-5 w-5 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
          <p className="text-sm text-gray-600">Low Stock</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <AlertTriangle className="h-5 w-5 text-red-500 mb-2" />
          <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          <p className="text-sm text-gray-600">Out of Stock</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <Package className="h-5 w-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
          <p className="text-sm text-gray-600">Inventory Value</p>
        </div>
      </div>

      {/* Alerts */}
      {stats.outOfStock > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="text-red-800 font-medium">{stats.outOfStock} products are out of stock!</span>
          <Button size="sm" variant="outline" onClick={selectAllLowStock} className="ml-auto">
            Select All Low Stock
          </Button>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'low', 'out'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded text-sm font-medium ${
                filter === f ? 'bg-white shadow' : ''
              }`}
            >
              {f === 'all' ? 'All' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>

        <Button variant="outline" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>

        {selectedItems.length > 0 && (
          <Button onClick={() => onReorder(selectedItems)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reorder ({selectedItems.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  onChange={(e) => setSelectedItems(e.target.checked ? filteredItems.map(i => i.id) : [])}
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                />
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium">Product</th>
              <th className="text-left px-4 py-3 text-sm font-medium">SKU</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Quantity</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Reorder Point</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                  />
                </td>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600 font-mono">{item.sku}</td>
                <td className="px-4 py-3">
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 px-2 py-1 border rounded"
                        autoFocus
                      />
                      <button onClick={() => handleSaveQuantity(item.id)} className="text-green-600">✓</button>
                      <button onClick={() => setEditingId(null)} className="text-red-600">✕</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingId(item.id); setEditValue(item.quantity.toString()); }}
                      className="hover:text-[#ff6b35]"
                    >
                      {item.quantity}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{item.reorderPoint}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'in_stock' ? 'bg-green-100 text-green-700' :
                    item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{formatCurrency(item.quantity * item.costPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Low stock notification badge
export function LowStockBadge({ count }: { count: number }) {
  if (count === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  );
}
