'use client';

import { useState } from 'react';
import { Package, RotateCcw, Upload, Check, Clock, AlertCircle, Truck, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

// Return request form
interface ReturnItem {
  product_id: string;
  name: string;
  quantity: number;
  max_quantity: number;
  price_cents: number;
  image_url?: string;
}

interface ReturnRequestFormProps {
  orderNumber: string;
  items: ReturnItem[];
  onSubmit: (data: any) => Promise<void>;
}

const returnReasons = [
  { value: 'defective', label: 'Product is defective' },
  { value: 'wrong_item', label: 'Received wrong item' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'damaged_shipping', label: 'Damaged during shipping' },
  { value: 'too_small', label: 'Too small' },
  { value: 'too_large', label: 'Too large' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other' },
];

export function ReturnRequestForm({ orderNumber, items, onSubmit }: ReturnRequestFormProps) {
  const [selectedItems, setSelectedItems] = useState<Map<string, number>>(new Map());
  const [reason, setReason] = useState('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [returnType, setReturnType] = useState<'refund' | 'exchange' | 'store_credit'>('refund');
  const [images, setImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const toggleItem = (productId: string, qty: number) => {
    const newSelected = new Map(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.set(productId, qty);
    }
    setSelectedItems(newSelected);
  };

  const updateQuantity = (productId: string, qty: number) => {
    const newSelected = new Map(selectedItems);
    newSelected.set(productId, qty);
    setSelectedItems(newSelected);
  };

  const totalRefund = Array.from(selectedItems.entries()).reduce((sum, [id, qty]) => {
    const item = items.find(i => i.product_id === id);
    return sum + (item ? item.price_cents * qty : 0);
  }, 0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({
        orderNumber,
        items: Array.from(selectedItems.entries()).map(([id, qty]) => ({
          product_id: id,
          quantity: qty,
          ...items.find(i => i.product_id === id),
        })),
        reason,
        reasonDetails,
        returnType,
        images,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['Select Items', 'Reason', 'Confirm'].map((label, i) => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-[#ff6b35] text-white' : 'bg-gray-200'
            }`}>
              {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`ml-2 text-sm ${step === i + 1 ? 'font-medium' : 'text-gray-500'}`}>{label}</span>
            {i < 2 && <div className="w-12 h-[2px] bg-gray-200 mx-4" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Items */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Select items to return</h2>
          <div className="space-y-3">
            {items.map(item => {
              const isSelected = selectedItems.has(item.product_id);
              const selectedQty = selectedItems.get(item.product_id) || 1;

              return (
                <div key={item.product_id} className={`border rounded-xl p-4 transition ${isSelected ? 'border-[#ff6b35] bg-orange-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItem(item.product_id, 1)}
                      className="w-5 h-5 rounded text-[#ff6b35]"
                    />
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : '📦'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(item.price_cents)} each</p>
                    </div>
                    {isSelected && item.max_quantity > 1 && (
                      <select
                        value={selectedQty}
                        onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value))}
                        className="border rounded-lg px-3 py-2"
                      >
                        {Array.from({ length: item.max_quantity }, (_, i) => i + 1).map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <p className="text-lg">Refund amount: <strong>{formatCurrency(totalRefund)}</strong></p>
            <button
              onClick={() => setStep(2)}
              disabled={selectedItems.size === 0}
              className="bg-[#ff6b35] text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Reason */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Why are you returning?</h2>
          
          <div className="space-y-3 mb-6">
            {returnReasons.map(r => (
              <label key={r.value} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${reason === r.value ? 'border-[#ff6b35] bg-orange-50' : ''}`}>
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={(e) => setReason(e.target.value)}
                  className="text-[#ff6b35]"
                />
                {r.label}
              </label>
            ))}
          </div>

          {reason === 'other' && (
            <textarea
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              placeholder="Please describe the issue..."
              className="w-full border rounded-lg p-3 mb-4"
              rows={3}
            />
          )}

          <div className="mb-6">
            <label className="block font-medium mb-2">What would you like?</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'refund', label: 'Refund', icon: '💵' },
                { value: 'exchange', label: 'Exchange', icon: '🔄' },
                { value: 'store_credit', label: 'Store Credit', icon: '🎁' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setReturnType(opt.value as any)}
                  className={`p-4 border rounded-xl text-center transition ${returnType === opt.value ? 'border-[#ff6b35] bg-orange-50' : ''}`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <p className="mt-1 font-medium">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="px-6 py-2 border rounded-lg">Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!reason}
              className="flex-1 bg-[#ff6b35] text-white py-2 rounded-lg font-medium disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Confirm your return</h2>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium mb-2">Items to return:</h3>
            {Array.from(selectedItems.entries()).map(([id, qty]) => {
              const item = items.find(i => i.product_id === id);
              return item && (
                <div key={id} className="flex justify-between py-2 border-b last:border-0">
                  <span>{item.name} × {qty}</span>
                  <span>{formatCurrency(item.price_cents * qty)}</span>
                </div>
              );
            })}
            <div className="flex justify-between pt-3 font-bold">
              <span>Total {returnType === 'refund' ? 'Refund' : returnType === 'store_credit' ? 'Credit' : 'Value'}</span>
              <span>{formatCurrency(totalRefund)}</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <h3 className="font-medium text-blue-800 mb-2">What happens next?</h3>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. We'll review your request within 24 hours</li>
              <li>2. You'll receive a shipping label via email</li>
              <li>3. Ship the item back within 7 days</li>
              <li>4. Refund processed within 5 business days of receipt</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="px-6 py-2 border rounded-lg">Back</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-[#ff6b35] text-white py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Return Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Return status tracker
interface ReturnStatusProps {
  rmaNumber: string;
  status: string;
  createdAt: string;
  totalRefund: number;
}

export function ReturnStatusTracker({ rmaNumber, status, createdAt, totalRefund }: ReturnStatusProps) {
  const steps = [
    { key: 'pending', label: 'Submitted', icon: Clock },
    { key: 'approved', label: 'Approved', icon: Check },
    { key: 'received', label: 'Received', icon: Package },
    { key: 'refunded', label: 'Refunded', icon: RotateCcw },
  ];

  const currentIdx = steps.findIndex(s => s.key === status);

  return (
    <div className="bg-white rounded-xl border p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm text-gray-500">Return Request</p>
          <p className="text-xl font-bold">{rmaNumber}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Refund Amount</p>
          <p className="text-xl font-bold text-[#ff6b35]">{formatCurrency(totalRefund)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isComplete = i <= currentIdx;
          const isCurrent = i === currentIdx;

          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex flex-col items-center ${i > 0 ? 'ml-4' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`text-xs mt-2 ${isCurrent ? 'font-medium' : 'text-gray-500'}`}>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${i < currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
