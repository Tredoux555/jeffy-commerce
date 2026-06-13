'use client';

import { useState } from 'react';
import { XCircle, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface OrderCancellationProps {
  orderId: string;
  orderNumber: string;
  status: string;
  /**
   * Email used on the order — sent to /api/orders/cancel as the ownership proof.
   * The server verifies it against the order before cancelling. If you render this
   * component on a page where you already know the customer's email (e.g. an order
   * confirmation/tracking page), pass it here.
   */
  email?: string;
  onCancel?: () => void;
}

const cancellableStatuses = ['pending', 'paid', 'processing'];

const cancellationReasons = [
  'Changed my mind',
  'Found a better price elsewhere',
  'Ordered by mistake',
  'Delivery time too long',
  'Payment issues',
  'Other'
];

export function OrderCancellation({ orderId, orderNumber, status, email: emailProp, onCancel }: OrderCancellationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [email, setEmail] = useState(emailProp ?? '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const canCancel = cancellableStatuses.includes(status);

  const handleCancel = async () => {
    if (!reason) {
      setError('Please select a reason');
      return;
    }
    if (reason === 'Other' && !otherReason.trim()) {
      setError('Please specify your reason');
      return;
    }
    if (!email.trim()) {
      setError('Please enter the email used on your order');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Cancellation now goes through the server route, which verifies ownership
      // (order number + email), enforces the cancellable-state check, and restores
      // stock — instead of the browser writing to Supabase directly.
      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          email: email.trim(),
          reason: reason === 'Other' ? otherReason.trim() : reason,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to cancel order');
      }

      setSuccess(true);
      onCancel?.();
    } catch (err: any) {
      setError(err?.message || 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  if (!canCancel) {
    return (
      <div className="text-sm text-gray-500">
        This order cannot be cancelled because it's already {status}.
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <Check className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-medium text-green-800">Order Cancelled</p>
          <p className="text-sm text-green-600">Your refund will be processed within 3-5 business days.</p>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
      >
        <XCircle className="h-4 w-4" />
        Cancel Order
      </button>
    );
  }

  return (
    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
      <div className="flex items-start gap-3 mb-4">
        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-800">Cancel Order {orderNumber}?</h3>
          <p className="text-sm text-red-600">This action cannot be undone.</p>
        </div>
      </div>

      <div className="space-y-4">
        {!emailProp && (
          <div>
            <label className="text-sm font-medium block mb-1">Email used on your order:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              We use this to confirm the order is yours before cancelling.
            </p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium block mb-2">Reason for cancellation:</label>
          <div className="space-y-2">
            {cancellationReasons.map((r) => (
              <label key={r} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={(e) => setReason(e.target.value)}
                  className="text-red-600 focus:ring-red-500"
                />
                <span className="text-sm">{r}</span>
              </label>
            ))}
          </div>
        </div>

        {reason === 'Other' && (
          <div>
            <label className="text-sm font-medium block mb-1">Please specify:</label>
            <textarea
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
              rows={2}
              required
            />
          </div>
        )}

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex gap-2">
          <Button
            onClick={handleCancel}
            disabled={loading}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
            Confirm Cancellation
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Keep Order
          </Button>
        </div>
      </div>
    </div>
  );
}

// Order modification request
export function OrderModificationRequest({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      await supabase.from('order_modification_requests').insert({
        order_id: orderId,
        message,
        status: 'pending'
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
        <Check className="h-5 w-5 text-blue-600" />
        <p className="text-blue-800">Your request has been submitted. We'll contact you soon.</p>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        Request modification
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3">
      <h4 className="font-medium">Request Order Modification</h4>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Describe the changes you'd like to make..."
        className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
        rows={3}
        required
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Submit Request
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
