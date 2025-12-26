'use client';

import { useState } from 'react';
import { RefreshCw, Package, ArrowLeft, Check, X, Camera, Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface ReturnItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  maxReturnQty: number;
}

interface ReturnReason {
  id: string;
  label: string;
  requiresPhoto?: boolean;
  requiresDescription?: boolean;
}

const returnReasons: ReturnReason[] = [
  { id: 'wrong_size', label: 'Wrong size/fit' },
  { id: 'defective', label: 'Defective/damaged', requiresPhoto: true, requiresDescription: true },
  { id: 'not_as_described', label: 'Not as described', requiresPhoto: true },
  { id: 'wrong_item', label: 'Received wrong item', requiresPhoto: true },
  { id: 'changed_mind', label: 'Changed my mind' },
  { id: 'better_price', label: 'Found better price elsewhere' },
  { id: 'other', label: 'Other', requiresDescription: true }
];

interface ReturnRequestFormProps {
  orderId: string;
  orderDate: string;
  items: ReturnItem[];
  onSubmit: (data: ReturnRequestData) => Promise<void>;
}

interface ReturnRequestData {
  orderId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    reason: string;
    description?: string;
    photos?: string[];
  }>;
  refundMethod: 'original' | 'store_credit';
}

export function ReturnRequestForm({ orderId, orderDate, items, onSubmit }: ReturnRequestFormProps) {
  const [step, setStep] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Map<string, { qty: number; reason: string; description: string; photos: string[] }>>(new Map());
  const [refundMethod, setRefundMethod] = useState<'original' | 'store_credit'>('original');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleItem = (itemId: string) => {
    const newSelected = new Map(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      const item = items.find(i => i.id === itemId);
      newSelected.set(itemId, { qty: 1, reason: '', description: '', photos: [] });
    }
    setSelectedItems(newSelected);
  };

  const updateItem = (itemId: string, field: string, value: any) => {
    const newSelected = new Map(selectedItems);
    const item = newSelected.get(itemId);
    if (item) {
      newSelected.set(itemId, { ...item, [field]: value });
    }
    setSelectedItems(newSelected);
  };

  const calculateRefund = () => {
    let total = 0;
    selectedItems.forEach((data, itemId) => {
      const item = items.find(i => i.id === itemId);
      if (item) {
        total += item.price * data.qty;
      }
    });
    return total;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data: ReturnRequestData = {
        orderId,
        items: Array.from(selectedItems.entries()).map(([itemId, data]) => ({
          itemId,
          quantity: data.qty,
          reason: data.reason,
          description: data.description || undefined,
          photos: data.photos.length > 0 ? data.photos : undefined
        })),
        refundMethod
      };
      await onSubmit(data);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedItems.size > 0;
    if (step === 2) {
      return Array.from(selectedItems.values()).every(item => {
        if (!item.reason) return false;
        const reason = returnReasons.find(r => r.id === item.reason);
        if (reason?.requiresDescription && !item.description) return false;
        if (reason?.requiresPhoto && item.photos.length === 0) return false;
        return true;
      });
    }
    return true;
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Return Request Submitted</h2>
        <p className="text-gray-600 mb-4">
          We'll review your request and email you within 24-48 hours.
        </p>
        <p className="text-sm text-gray-500">
          Estimated refund: {formatCurrency(calculateRefund())}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              s <= step ? 'bg-[#ff6b35] text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-[#ff6b35]' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Items */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Select Items to Return</h2>
          <p className="text-sm text-gray-600 mb-6">Order #{orderId} • Ordered {orderDate}</p>

          <div className="space-y-3">
            {items.map((item) => {
              const isSelected = selectedItems.has(item.id);
              const selectedData = selectedItems.get(item.id);
              
              return (
                <div key={item.id} className={`border rounded-xl p-4 ${isSelected ? 'border-[#ff6b35] bg-orange-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'border-[#ff6b35] bg-[#ff6b35]' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4 text-white" />}
                    </button>
                    
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(item.price)} × {item.quantity}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pl-10">
                      <label className="text-sm font-medium">Quantity to return:</label>
                      <select
                        value={selectedData?.qty || 1}
                        onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value))}
                        className="ml-2 px-2 py-1 border rounded"
                      >
                        {Array.from({ length: item.maxReturnQty }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Reasons */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold mb-6">Why are you returning?</h2>

          {Array.from(selectedItems.entries()).map(([itemId, data]) => {
            const item = items.find(i => i.id === itemId)!;
            const selectedReason = returnReasons.find(r => r.id === data.reason);
            
            return (
              <div key={itemId} className="border rounded-xl p-4 mb-4">
                <p className="font-medium mb-3">{item.name}</p>
                
                <div className="space-y-2 mb-4">
                  {returnReasons.map((reason) => (
                    <button
                      key={reason.id}
                      onClick={() => updateItem(itemId, 'reason', reason.id)}
                      className={`w-full text-left px-4 py-2 rounded-lg border ${
                        data.reason === reason.id ? 'border-[#ff6b35] bg-orange-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {reason.label}
                    </button>
                  ))}
                </div>

                {selectedReason?.requiresDescription && (
                  <div className="mb-4">
                    <label className="text-sm font-medium block mb-1">Please describe the issue:</label>
                    <textarea
                      value={data.description}
                      onChange={(e) => updateItem(itemId, 'description', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg resize-none"
                      rows={3}
                      placeholder="Provide details..."
                    />
                  </div>
                )}

                {selectedReason?.requiresPhoto && (
                  <div>
                    <label className="text-sm font-medium block mb-1">Upload photos (required):</label>
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                      <Camera className="h-4 w-4" />
                      Add Photos
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold mb-6">Confirm Your Return</h2>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium mb-3">Items to Return:</h3>
            {Array.from(selectedItems.entries()).map(([itemId, data]) => {
              const item = items.find(i => i.id === itemId)!;
              const reason = returnReasons.find(r => r.id === data.reason);
              return (
                <div key={itemId} className="flex justify-between py-2 border-b last:border-0">
                  <div>
                    <p>{item.name} × {data.qty}</p>
                    <p className="text-sm text-gray-500">{reason?.label}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.price * data.qty)}</p>
                </div>
              );
            })}
            <div className="flex justify-between pt-3 font-bold">
              <span>Total Refund:</span>
              <span className="text-[#ff6b35]">{formatCurrency(calculateRefund())}</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-3">Refund Method:</h3>
            <div className="space-y-2">
              <button
                onClick={() => setRefundMethod('original')}
                className={`w-full text-left px-4 py-3 rounded-lg border ${
                  refundMethod === 'original' ? 'border-[#ff6b35] bg-orange-50' : ''
                }`}
              >
                <p className="font-medium">Original Payment Method</p>
                <p className="text-sm text-gray-500">5-7 business days</p>
              </button>
              <button
                onClick={() => setRefundMethod('store_credit')}
                className={`w-full text-left px-4 py-3 rounded-lg border ${
                  refundMethod === 'store_credit' ? 'border-[#ff6b35] bg-orange-50' : ''
                }`}
              >
                <p className="font-medium">Store Credit</p>
                <p className="text-sm text-gray-500">Instant + 10% bonus!</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(s => s - 1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <Button
          onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()}
          disabled={!canProceed() || loading}
          className="flex-1"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {step < 3 ? 'Continue' : 'Submit Return Request'}
        </Button>
      </div>
    </div>
  );
}
