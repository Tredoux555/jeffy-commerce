'use client';

import { useState } from 'react';
import { Calendar, Tag, Clock, Play, Pause, Edit, Trash2, Plus, Loader2, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface ScheduledSale {
  id: string;
  name: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  applicableTo: 'all' | 'category' | 'products';
  categoryIds?: string[];
  productIds?: string[];
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'active' | 'ended' | 'paused';
  priority: number;
}

interface SalesSchedulerProps {
  sales: ScheduledSale[];
  categories: Array<{ id: string; name: string }>;
  onSave: (sale: Partial<ScheduledSale>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleStatus: (id: string, status: 'active' | 'paused') => Promise<void>;
}

export function SalesScheduler({ sales, categories, onSave, onDelete, onToggleStatus }: SalesSchedulerProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<ScheduledSale | null>(null);
  const [loading, setLoading] = useState(false);

  const activeSales = sales.filter(s => s.status === 'active');
  const scheduledSales = sales.filter(s => s.status === 'scheduled');
  const endedSales = sales.filter(s => s.status === 'ended');

  const handleSave = async (data: Partial<ScheduledSale>) => {
    setLoading(true);
    await onSave(data);
    setShowForm(false);
    setEditingSale(null);
    setLoading(false);
  };

  const formatDiscount = (sale: ScheduledSale) => {
    if (sale.discountType === 'percentage') return `${sale.discountValue}% off`;
    return `${formatCurrency(sale.discountValue)} off`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Sales Scheduler</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Sale
        </Button>
      </div>

      {/* Active Sales */}
      {activeSales.length > 0 && (
        <div>
          <h3 className="font-medium text-green-600 flex items-center gap-2 mb-3">
            <Play className="h-4 w-4" /> Active Sales ({activeSales.length})
          </h3>
          <div className="space-y-3">
            {activeSales.map((sale) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                onEdit={() => { setEditingSale(sale); setShowForm(true); }}
                onDelete={() => onDelete(sale.id)}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Sales */}
      {scheduledSales.length > 0 && (
        <div>
          <h3 className="font-medium text-blue-600 flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4" /> Scheduled ({scheduledSales.length})
          </h3>
          <div className="space-y-3">
            {scheduledSales.map((sale) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                onEdit={() => { setEditingSale(sale); setShowForm(true); }}
                onDelete={() => onDelete(sale.id)}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Ended Sales */}
      {endedSales.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-600 flex items-center gap-2 mb-3">
            Ended ({endedSales.length})
          </h3>
          <div className="space-y-3 opacity-60">
            {endedSales.slice(0, 5).map((sale) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                onEdit={() => { setEditingSale(sale); setShowForm(true); }}
                onDelete={() => onDelete(sale.id)}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sales.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No sales scheduled</p>
          <p className="text-sm">Create your first sale to get started</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <SaleForm
          sale={editingSale}
          categories={categories}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingSale(null); }}
          loading={loading}
        />
      )}
    </div>
  );
}

function SaleCard({ 
  sale, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: { 
  sale: ScheduledSale;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: (id: string, status: 'active' | 'paused') => void;
}) {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    ended: 'bg-gray-100 text-gray-700',
    paused: 'bg-yellow-100 text-yellow-700'
  };

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium">{sale.name}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[sale.status]}`}>
              {sale.status}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Percent className="h-3 w-3" />
              {sale.discountType === 'percentage' ? `${sale.discountValue}%` : formatCurrency(sale.discountValue)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(sale.startDate).toLocaleDateString()} - {new Date(sale.endDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {sale.applicableTo === 'all' ? 'All Products' : 
               sale.applicableTo === 'category' ? `${sale.categoryIds?.length || 0} categories` :
               `${sale.productIds?.length || 0} products`}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {(sale.status === 'active' || sale.status === 'paused') && (
            <button
              onClick={() => onToggleStatus(sale.id, sale.status === 'active' ? 'paused' : 'active')}
              className="p-2 hover:bg-gray-100 rounded"
            >
              {sale.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          )}
          <button onClick={onEdit} className="p-2 hover:bg-gray-100 rounded">
            <Edit className="h-4 w-4" />
          </button>
          <button onClick={onDelete} className="p-2 hover:bg-gray-100 rounded text-red-500">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SaleForm({ 
  sale, 
  categories, 
  onSave, 
  onCancel, 
  loading 
}: { 
  sale: ScheduledSale | null;
  categories: Array<{ id: string; name: string }>;
  onSave: (data: Partial<ScheduledSale>) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: sale?.name || '',
    discountType: sale?.discountType || 'percentage' as const,
    discountValue: sale?.discountValue || 10,
    applicableTo: sale?.applicableTo || 'all' as const,
    categoryIds: sale?.categoryIds || [],
    startDate: sale?.startDate?.split('T')[0] || '',
    endDate: sale?.endDate?.split('T')[0] || '',
    priority: sale?.priority || 1
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">{sale ? 'Edit' : 'Create'} Sale</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sale Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Summer Sale"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {formData.discountType === 'percentage' ? 'Percentage' : 'Amount (cents)'}
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Applies To</label>
            <select
              value={formData.applicableTo}
              onChange={(e) => setFormData({ ...formData, applicableTo: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Products</option>
              <option value="category">Specific Categories</option>
              <option value="products">Specific Products</option>
            </select>
          </div>

          {formData.applicableTo === 'category' && (
            <div>
              <label className="block text-sm font-medium mb-1">Select Categories</label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.categoryIds.includes(cat.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, categoryIds: [...formData.categoryIds, cat.id] });
                        } else {
                          setFormData({ ...formData, categoryIds: formData.categoryIds.filter(id => id !== cat.id) });
                        }
                      }}
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority (higher = more important)</label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border rounded-lg"
              min={1}
              max={10}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={() => onSave({ id: sale?.id, ...formData })} disabled={loading} className="flex-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {sale ? 'Update' : 'Create'} Sale
          </Button>
        </div>
      </div>
    </div>
  );
}
