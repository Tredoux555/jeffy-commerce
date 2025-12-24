'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CreditCard, Building2, Loader2, MapPin, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LocationPicker } from '@/components/location-picker';
import { createClient } from '@/lib/supabase/client';
import { findZoneForLocation, findPartnerForZone } from '@/lib/geo-utils';

type PaymentMethod = 'payfast' | 'ozow' | 'eft';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payfast');
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [zoneInfo, setZoneInfo] = useState<{ zoneId: string; zoneName: string; partnerId: string; partnerName: string } | null>(null);
  const [zoneError, setZoneError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    firstName: 'Test',
    lastName: 'User',
    email: 'test@jeffy.co.za',
    phone: '0821234567',
    address: '123 Test Street',
    city: 'Johannesburg',
    province: 'GP',
    postalCode: '2000',
  });

  const subtotal = getSubtotal();

  const handleLocationSelect = async (location: { lat: number; lng: number }) => {
    setDeliveryLocation(location);
    setZoneError(null);
    setZoneInfo(null);

    const supabase = createClient();
    
    // Find which zone this location is in
    const zone = await findZoneForLocation(supabase, location.lat, location.lng);
    
    if (!zone) {
      setZoneError('Sorry, we don\'t deliver to this area yet. Please select a different location.');
      return;
    }

    // Find the partner for this zone
    const partner = await findPartnerForZone(supabase, zone.zoneId);
    
    if (!partner) {
      setZoneError('No delivery partner available in this area. Please try again later.');
      return;
    }

    setZoneInfo({
      zoneId: zone.zoneId,
      zoneName: zone.zoneName,
      partnerId: partner.partnerId,
      partnerName: partner.partnerName,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deliveryLocation) {
      setError('Please select a delivery location on the map');
      return;
    }

    if (!zoneInfo) {
      setError('Please select a valid delivery location within our service area');
      return;
    }

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
          delivery: {
            latitude: deliveryLocation.lat,
            longitude: deliveryLocation.lng,
            zoneId: zoneInfo.zoneId,
            partnerId: zoneInfo.partnerId,
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
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/cart" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Cart
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Location Map */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                Delivery Location
              </h2>
              
              <LocationPicker
                onLocationSelect={handleLocationSelect}
                initialLocation={deliveryLocation || undefined}
              />

              {zoneInfo && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Delivery Zone:</strong> {zoneInfo.zoneName}
                  </p>
                  <p className="text-sm text-green-600">
                    Your order will be delivered by a local Jeffy Partner
                  </p>
                </div>
              )}

              {zoneError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{zoneError}</p>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold mb-4">Contact Information</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <Input
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <Input
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Email *</label>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <Input
                  type="tel"
                  required
                  placeholder="082 123 4567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <Input
                  required
                  placeholder="House number and street name"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City *</label>
                  <Input
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Province *</label>
                  <select
                    required
                    className="w-full h-10 border border-gray-300 rounded-lg px-3"
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                  >
                    <option value="">Select</option>
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
                  <label className="block text-sm font-medium mb-1">Postal Code *</label>
                  <Input
                    required
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'payfast' ? 'border-orange-500 bg-orange-50' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'payfast'}
                    onChange={() => setPaymentMethod('payfast')}
                    className="sr-only"
                  />
                  <CreditCard className="h-6 w-6 text-gray-600" />
                  <div>
                    <p className="font-medium">Card Payment</p>
                    <p className="text-sm text-gray-500">Visa, Mastercard, AMEX</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'ozow' ? 'border-orange-500 bg-orange-50' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'ozow'}
                    onChange={() => setPaymentMethod('ozow')}
                    className="sr-only"
                  />
                  <Building2 className="h-6 w-6 text-gray-600" />
                  <div>
                    <p className="font-medium">Instant EFT</p>
                    <p className="text-sm text-gray-500">Pay from your bank account</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer ${paymentMethod === 'eft' ? 'border-orange-500 bg-orange-50' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'eft'}
                    onChange={() => setPaymentMethod('eft')}
                    className="sr-only"
                  />
                  <Building2 className="h-6 w-6 text-gray-600" />
                  <div>
                    <p className="font-medium">Manual EFT</p>
                    <p className="text-sm text-gray-500">Bank transfer (24-48h processing)</p>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600" 
              disabled={loading || !zoneInfo}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatCurrency(subtotal)}`
              )}
            </Button>

            {!zoneInfo && deliveryLocation && !zoneError && (
              <p className="text-sm text-gray-500 text-center">
                Checking delivery availability...
              </p>
            )}
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-xl border p-6 sticky top-20">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-xs">No img</div>
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

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
            </div>

            {zoneInfo && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  <strong>Delivering to:</strong> {zoneInfo.zoneName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
