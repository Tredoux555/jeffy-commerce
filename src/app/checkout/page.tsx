'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CreditCard, Building2, Loader2, Tag, X, CheckCircle, Truck } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';

type PaymentMethod = 'payfast' | 'ozow' | 'eft';

interface AppliedDiscount {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number;
  discountAmountCents: number;
}

interface ZoneInfo {
  zoneId: string;
  zoneName: string;
  partnerId: string;
  partnerName: string;
  deliveryType: 'partner' | 'standard';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('eft');
  const [zoneInfo, setZoneInfo] = useState<ZoneInfo | null>(null);
  const [zones, setZones] = useState<any[]>([]);
  
  // Discount code state
  const [discountCode, setDiscountCode] = useState('');
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: 'GP',
    postalCode: '',
  });

  const subtotal = getSubtotal();
  const discountAmount = appliedDiscount?.discountAmountCents || 0;
  const deliveryFee = zoneInfo?.deliveryType === 'partner' ? 0 : 0; // Can add fee for standard later
  const total = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Load zones on mount - completely optional, won't break checkout if fails
  useEffect(() => {
    const loadZones = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('zones')
          .select('id, name');
        if (data && !error) setZones(data);
      } catch (e) {
        // Zones table may not exist - that's fine, checkout still works
        console.log('Zones not loaded - continuing without zone detection');
      }
    };
    loadZones();
  }, []);

  // Set default zone on mount so checkout always works
  useEffect(() => {
    setZoneInfo({
      zoneId: '',
      zoneName: 'Standard Delivery',
      partnerId: '',
      partnerName: 'Jeffy Direct',
      deliveryType: 'standard',
    });
  }, []);

  // Auto-detect zone when city/province changes
  useEffect(() => {
    if (form.city && form.province && zones.length > 0) {
      const matchedZone = zones.find(z => 
        z.name?.toLowerCase().includes(form.city.toLowerCase())
      );
      
      if (matchedZone) {
        setZoneInfo({
          zoneId: matchedZone.id,
          zoneName: matchedZone.name,
          partnerId: '',
          partnerName: 'Zone Partner',
          deliveryType: 'partner',
        });
      } else {
        setZoneInfo({
          zoneId: '',
          zoneName: 'Standard Delivery',
          partnerId: '',
          partnerName: 'Jeffy Direct',
          deliveryType: 'standard',
        });
      }
    }
  }, [form.city, form.province, zones]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    
    setDiscountLoading(true);
    setDiscountError('');
    
    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, orderTotalCents: subtotal }),
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        setDiscountError(data.error || 'Invalid discount code');
        return;
      }
      
      setAppliedDiscount(data.discount);
      setDiscountCode('');
    } catch (err) {
      setDiscountError('Failed to apply discount code');
    } finally {
      setDiscountLoading(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            variantId: item.variantId,
          })),
          customer: form,
          paymentMethod,
          discountCodeId: appliedDiscount?.id,
          delivery: {
            latitude: 0,
            longitude: 0,
            zoneId: zoneInfo?.zoneId || null,
            partnerId: zoneInfo?.partnerId || null,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      clearCart();
      
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        router.push(`/checkout/success?order=${data.orderNumber}&method=eft`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link href="/products"><Button className="bg-orange-500 hover:bg-orange-600">Continue Shopping</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8">
        <Link href="/cart" className="inline-flex items-center text-gray-400 hover:text-white mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cart
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="font-semibold mb-4">Contact Information</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">First Name *</label>
                    <Input 
                      required 
                      value={form.firstName} 
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })} 
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Last Name *</label>
                    <Input 
                      required 
                      value={form.lastName} 
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1 text-gray-300">Email *</label>
                  <Input 
                    type="email" 
                    required 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1 text-gray-300">Phone *</label>
                  <Input 
                    type="tel" 
                    required 
                    placeholder="082 123 4567" 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="font-semibold mb-4 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-orange-500" />
                  Delivery Address
                </h2>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Street Address *</label>
                  <Input 
                    required 
                    placeholder="House number and street" 
                    value={form.address} 
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">City *</label>
                    <Input 
                      required 
                      value={form.city} 
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Province *</label>
                    <select 
                      required 
                      className="w-full h-10 bg-gray-800 border border-gray-700 rounded-lg px-3 text-white" 
                      value={form.province} 
                      onChange={(e) => setForm({ ...form, province: e.target.value })}
                    >
                      <option value="GP">Gauteng</option>
                      <option value="WC">Western Cape</option>
                      <option value="KZN">KwaZulu-Natal</option>
                      <option value="EC">Eastern Cape</option>
                      <option value="FS">Free State</option>
                      <option value="LP">Limpopo</option>
                      <option value="MP">Mpumalanga</option>
                      <option value="NC">Northern Cape</option>
                      <option value="NW">North West</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Postal Code *</label>
                    <Input 
                      required 
                      value={form.postalCode} 
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                {/* Zone Status */}
                {zoneInfo && (
                  <div className={`mt-4 p-3 rounded-lg ${zoneInfo.deliveryType === 'partner' ? 'bg-green-900/30 border border-green-700' : 'bg-blue-900/30 border border-blue-700'}`}>
                    <p className={`text-sm font-medium ${zoneInfo.deliveryType === 'partner' ? 'text-green-400' : 'text-blue-400'}`}>
                      {zoneInfo.deliveryType === 'partner' ? '✓ Zone Partner Delivery' : '📦 Standard Delivery'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {zoneInfo.deliveryType === 'partner' 
                        ? 'A local Jeffy partner will deliver to you' 
                        : 'We\'ll ship directly to your address'}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h2 className="font-semibold mb-4">Payment Method</h2>
                
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'payfast' ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'payfast'} onChange={() => setPaymentMethod('payfast')} className="sr-only" />
                    <CreditCard className="h-6 w-6 text-gray-400" />
                    <div>
                      <p className="font-medium">Card Payment</p>
                      <p className="text-sm text-gray-500">Visa, Mastercard, AMEX</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'ozow' ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'ozow'} onChange={() => setPaymentMethod('ozow')} className="sr-only" />
                    <Building2 className="h-6 w-6 text-gray-400" />
                    <div>
                      <p className="font-medium">Instant EFT</p>
                      <p className="text-sm text-gray-500">Pay from your bank</p>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${paymentMethod === 'eft' ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 hover:border-gray-600'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'eft'} onChange={() => setPaymentMethod('eft')} className="sr-only" />
                    <Building2 className="h-6 w-6 text-gray-400" />
                    <div>
                      <p className="font-medium">Manual EFT</p>
                      <p className="text-sm text-gray-500">Bank transfer (24-48h)</p>
                    </div>
                  </label>
                </div>
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-400 p-4 rounded-lg">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg h-14" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${formatCurrency(total)}`
                )}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 sticky top-20">
              <h2 className="font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-xs">No img</div>
                      )}
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {item.variantName && <p className="text-xs text-gray-500">{item.variantName}</p>}
                    </div>
                    <p className="font-medium text-sm">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Discount Code Input */}
              <div className="border-t border-gray-800 pt-4 mb-4">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-300">
                  <Tag className="h-4 w-4 text-orange-500" />
                  Discount Code
                </label>
                
                {appliedDiscount ? (
                  <div className="flex items-center justify-between bg-green-900/30 border border-green-700 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium text-green-400">{appliedDiscount.code}</p>
                        <p className="text-xs text-green-500">{appliedDiscount.description}</p>
                      </div>
                    </div>
                    <button onClick={handleRemoveDiscount} className="text-gray-400 hover:text-red-400">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter code" 
                      value={discountCode} 
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-gray-800 border-gray-700 text-white"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleApplyDiscount} 
                      disabled={discountLoading || !discountCode.trim()}
                      className="border-gray-700 text-white hover:bg-gray-800"
                    >
                      {discountLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                )}
                
                {discountError && <p className="text-red-400 text-sm mt-2">{discountError}</p>}
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                
                {appliedDiscount && (
                  <div className="flex justify-between text-sm text-green-400">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Delivery</span>
                  <span className="text-green-400">Free</span>
                </div>
                
                <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-800">
                  <span>Total</span>
                  <span className="text-orange-500">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
