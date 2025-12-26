'use client';

import { useState } from 'react';
import { RotateCcw, Package, Upload, Check, Clock, Truck, AlertCircle, X, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface ReturnItem {
  productId: string;
  name: string;
  quantity: number;
  maxQuantity: number;
  price: number;
  image?: string;
}

interface ReturnRequest {
  id: string;
  rmaNumber: string;
  orderNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'shipped' | 'received' | 'refunded';
  items: ReturnItem[];
  reason: string;
  refundAmount: number;
  createdAt: string;
}

const RETURN_REASONS = [
  { value: 'damaged', label: 'Item arrived damaged' },
  { value: 'wrong_item', label: 'Received wrong item' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'defective', label: 'Defective/not working' },
  { value: 'changed_mind', label: 'Changed my mind' },
  { value: 'other', label: 'Other reason' },
];

const STATUS_CONFIG: Record<string, { icon: typeof Clock; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100', label: 'Pending Review' },
  approved: { icon: Check, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Approved' },
  rejected: { icon: X, color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' },
  shipped: { icon: Truck, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Return Shipped' },
  received: { icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Received' },
  refunded: { icon: Check, color: 'text-green-600', bg: 'bg-green-100', label: 'Refunded' },
};

// Return request form
export function ReturnRequestForm({ 
  orderNumber,
  items,
  onSubmit,
  onCancel 
}: { 
  orderNumber: string;
  items: ReturnItem[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [step, setStep] = useState(1);

  const totalRefund = Object.entries(selectedItems).reduce((sum, [id, qty]) => {
    const item = items.find(i => i.productId === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleItemToggle = (productId: string, quantity: number) => {
    setSelectedItems(prev => {
      if (quantity === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: quantity };
    });
  };

  const handleSubmit = () => {
    onSubmit({
      orderNumber,
      items: Object.entries(selectedItems).map(([id, qty]) => ({
        productId: id,
        quantity: qty,
      })),
      reason,
      details,
      images,
    });
  };

  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <RotateCcw className="h-6 w-6 text-[#ff6b35]" />
        Request Return - Order #{orderNumber}
      </h2>

      {/* Step 1: Select Items */}
      {step === 1 && (
        <div>
          <h3 className="font-medium mb-4">Select items to return:</h3>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 p-4 border rounded-xl">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" /> : '📦'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(item.price)} × {item.maxQuantity}</p>
                </div>
                <select
                  value={selectedItems[item.productId] || 0}
                  onChange={(e) => handleItemToggle(item.productId, parseInt(e.target.value))}
                  className="border rounded-lg px-3 py-2"
                >
                  <option value={0}>Don't return</option>
                  {Array.from({ length: item.maxQuantity }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>Return {n}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">Cancel</button>
            <button
              onClick={() => setStep(2)}
              disabled={Object.keys(selectedItems).length === 0}
              className="flex items-center gap-2 bg-[#ff6b35] text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Reason */}
      {step === 2 && (
        <div>
          <h3 className="font-medium mb-4">Why are you returning?</h3>
          <div className="space-y-2 mb-4">
            {RETURN_REASONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setReason(r.value)}
                className={`w-full p-3 border rounded-xl text-left transition ${
                  reason === r.value ? 'border-[#ff6b35] bg-orange-50' : 'hover:border-gray-300'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Additional details (optional)"
            className="w-full border rounded-xl px-4 py-3 resize-none"
            rows={3}
          />
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-700">← Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!reason}
              className="flex items-center gap-2 bg-[#ff6b35] text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <div>
          <h3 className="font-medium mb-4">Review your return request:</h3>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Items to return:</p>
            {Object.entries(selectedItems).map(([id, qty]) => {
              const item = items.find(i => i.productId === id);
              return item ? (
                <p key={id} className="font-medium">{item.name} × {qty}</p>
              ) : null;
            })}
            <p className="text-sm text-gray-600 mt-4">Reason: {RETURN_REASONS.find(r => r.value === reason)?.label}</p>
            <p className="font-bold mt-4">Estimated Refund: {formatCurrency(totalRefund)}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 mb-4">
            <p>📋 Once approved, you'll receive shipping instructions via email.</p>
          </div>
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <button onClick={() => setStep(2)} className="text-gray-500 hover:text-gray-700">← Back</button>
            <button onClick={handleSubmit} className="bg-[#ff6b35] text-white px-6 py-2 rounded-lg font-medium">
              Submit Return Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Return status badge
export function ReturnStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
      <Icon className="h-4 w-4" />
      {config.label}
    </span>
  );
}

// Return request card
export function ReturnRequestCard({ request }: { request: ReturnRequest }) {
  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-bold">{request.rmaNumber}</p>
          <p className="text-sm text-gray-500">Order #{request.orderNumber}</p>
        </div>
        <ReturnStatusBadge status={request.status} />
      </div>
      <div className="text-sm text-gray-600 mb-3">
        {request.items.length} item(s) • {formatCurrency(request.refundAmount)}
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{new Date(request.createdAt).toLocaleDateString()}</span>
        <button className="text-[#ff6b35] font-medium hover:underline">View Details →</button>
      </div>
    </div>
  );
}
