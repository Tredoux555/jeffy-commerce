'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Truck, MapPin, Check, ArrowLeft, ArrowRight, Loader2, Lock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';

type CheckoutStep = 'information' | 'shipping' | 'payment' | 'confirmation';

interface CheckoutData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  shippingMethod: string;
  paymentMethod: string;
  saveInfo: boolean;
}

export function MultiStepCheckout() {
  const [step, setStep] = useState<CheckoutStep>('information');
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const items = useCartStore((state) => state.items);
  const getTotal = useCartStore((state) => state.getTotal);
  const clearCart = useCartStore((state) => state.clearCart);

  const [formData, setFormData] = useState<CheckoutData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    suburb: '',
    city: '',
    province: '',
    postalCode: '',
    shippingMethod: 'standard',
    paymentMethod: 'card',
    saveInfo: false
  });

  const subtotal = getTotal();
  const shippingCost = formData.shippingMethod === 'express' ? 12000 : subtotal >= 50000 ? 0 : 6500;
  const total = subtotal + shippingCost;

  const steps: CheckoutStep[] = ['information', 'shipping', 'payment', 'confirmation'];
  const currentStepIndex = steps.indexOf(step);

  const canProceed = () => {
    switch (step) {
      case 'information':
        return formData.email && formData.firstName && formData.lastName && formData.phone &&
               formData.address && formData.city && formData.province && formData.postalCode;
      case 'shipping':
        return !!formData.shippingMethod;
      case 'payment':
        return !!formData.paymentMethod;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (step !== 'payment') {
      setStep(steps[currentStepIndex + 1]);
      return;
    }

    setLoading(true);
    try {
      // Simulate order creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setOrderId('JEF-' + Math.random().toString(36).substring(2, 8).toUpperCase());
      setOrderComplete(true);
      clearCart();
      setStep('confirmation');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete && step === 'confirmation') {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6">Thank you for your purchase</p>
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600">Order Number</p>
          <p className="text-2xl font-mono font-bold">{orderId}</p>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          We've sent a confirmation email to {formData.email}
        </p>
        <Button onClick={() => window.location.href = '/'}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {steps.slice(0, -1).map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                i < currentStepIndex 
                  ? 'bg-green-500 text-white' 
                  : i === currentStepIndex 
                  ? 'bg-[#ff6b35] text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {i < currentStepIndex ? <Check className="h-5 w-5" /> : i + 1}
              </div>
              {i < steps.length - 2 && (
                <div className={`w-24 h-1 mx-2 ${i < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between max-w-xl mx-auto mt-2 text-sm">
          <span className={currentStepIndex >= 0 ? 'text-[#ff6b35] font-medium' : 'text-gray-500'}>Information</span>
          <span className={currentStepIndex >= 1 ? 'text-[#ff6b35] font-medium' : 'text-gray-500'}>Shipping</span>
          <span className={currentStepIndex >= 2 ? 'text-[#ff6b35] font-medium' : 'text-gray-500'}>Payment</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {/* Information Step */}
          {step === 'information' && (
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-xl font-bold">Contact Information</h2>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                />
              </div>

              <h3 className="font-bold pt-4">Shipping Address</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Suburb</label>
                  <input
                    type="text"
                    value={formData.suburb}
                    onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Province</label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg"
                    required
                  >
                    <option value="">Select...</option>
                    {['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shipping Step */}
          {step === 'shipping' && (
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-xl font-bold">Shipping Method</h2>
              
              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer ${
                  formData.shippingMethod === 'standard' ? 'border-[#ff6b35] bg-orange-50' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={formData.shippingMethod === 'standard'}
                      onChange={() => setFormData({ ...formData, shippingMethod: 'standard' })}
                      className="w-4 h-4 text-[#ff6b35]"
                    />
                    <div>
                      <p className="font-medium">Standard Delivery</p>
                      <p className="text-sm text-gray-500">3-5 business days</p>
                    </div>
                  </div>
                  <span className={subtotal >= 50000 ? 'text-green-600 font-medium' : 'font-medium'}>
                    {subtotal >= 50000 ? 'FREE' : formatCurrency(6500)}
                  </span>
                </label>

                <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer ${
                  formData.shippingMethod === 'express' ? 'border-[#ff6b35] bg-orange-50' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={formData.shippingMethod === 'express'}
                      onChange={() => setFormData({ ...formData, shippingMethod: 'express' })}
                      className="w-4 h-4 text-[#ff6b35]"
                    />
                    <div>
                      <p className="font-medium">Express Delivery</p>
                      <p className="text-sm text-gray-500">1-2 business days</p>
                    </div>
                  </div>
                  <span className="font-medium">{formatCurrency(12000)}</span>
                </label>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <h2 className="text-xl font-bold">Payment Method</h2>
              
              <div className="space-y-3">
                {[
                  { id: 'card', label: 'Credit/Debit Card', icon: <CreditCard className="h-5 w-5" /> },
                  { id: 'eft', label: 'Instant EFT', icon: <Lock className="h-5 w-5" /> },
                  { id: 'cod', label: 'Cash on Delivery (+R50)', icon: <ShoppingBag className="h-5 w-5" /> }
                ].map((method) => (
                  <label key={method.id} className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                    formData.paymentMethod === method.id ? 'border-[#ff6b35] bg-orange-50' : ''
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={formData.paymentMethod === method.id}
                      onChange={() => setFormData({ ...formData, paymentMethod: method.id })}
                      className="w-4 h-4 text-[#ff6b35]"
                    />
                    <div className="flex items-center gap-2">
                      {method.icon}
                      <span className="font-medium">{method.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 pt-4">
                <Lock className="h-4 w-4" />
                <span>Your payment is secure and encrypted</span>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {currentStepIndex > 0 && (
              <Button variant="outline" onClick={() => setStep(steps[currentStepIndex - 1])}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || loading}
              className="ml-auto"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {step === 'payment' ? 'Complete Order' : 'Continue'}
              {step !== 'payment' && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-[#ff6b35]">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
