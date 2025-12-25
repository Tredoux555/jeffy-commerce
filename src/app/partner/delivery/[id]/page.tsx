'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, MapPin, Phone, User, Camera, CheckCircle, Truck, Loader2, AlertCircle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

type DeliveryStatus = 'pending' | 'loaded' | 'in_transit' | 'arrived' | 'delivered' | 'failed';

interface DeliveryData {
  id: string;
  order_id: string;
  qr_code: string;
  status: DeliveryStatus;
  scheduled_date: string;
  recipient_name: string;
  recipient_phone: string;
  delivered_at: string | null;
  photo_url: string | null;
  signature_url: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  driver_notes: string | null;
  orders: {
    order_number: string;
    delivery_address: string;
    delivery_latitude: number;
    delivery_longitude: number;
    total_cents: number;
    franchise_share_cents: number;
  };
}

const STATUS_FLOW: DeliveryStatus[] = ['pending', 'loaded', 'in_transit', 'arrived', 'delivered'];

const STATUS_LABELS: Record<DeliveryStatus, string> = {
  pending: 'Pending Pickup',
  loaded: 'Loaded',
  in_transit: 'In Transit',
  arrived: 'Arrived',
  delivered: 'Delivered',
  failed: 'Failed',
};

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [delivery, setDelivery] = useState<DeliveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDelivery();
    getCurrentLocation();
  }, [params.id]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => console.log('Location error:', err)
      );
    }
  };

  const fetchDelivery = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('deliveries')
      .select(`
        *,
        orders (
          order_number,
          delivery_address,
          delivery_latitude,
          delivery_longitude,
          total_cents,
          franchise_share_cents
        )
      `)
      .eq('id', params.id)
      .single();

    if (fetchError || !data) {
      setError('Delivery not found');
      setLoading(false);
      return;
    }

    setDelivery(data);
    setLoading(false);
  };

  const updateStatus = async (newStatus: DeliveryStatus) => {
    if (!delivery) return;
    setUpdating(true);

    const supabase = createClient();
    const updateData: any = { status: newStatus };

    if (newStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString();
      if (currentLocation) {
        updateData.delivery_latitude = currentLocation.lat;
        updateData.delivery_longitude = currentLocation.lng;
      }
    }

    const { error: updateError } = await supabase
      .from('deliveries')
      .update(updateData)
      .eq('id', delivery.id);

    if (updateError) {
      setError('Failed to update status');
      setUpdating(false);
      return;
    }

    setDelivery({ ...delivery, ...updateData });
    setUpdating(false);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProofPhoto = async () => {
    if (!delivery || !capturedPhoto) return;
    setUpdating(true);

    const supabase = createClient();
    
    // Convert base64 to blob
    const response = await fetch(capturedPhoto);
    const blob = await response.blob();
    const fileName = `delivery-${delivery.id}-${Date.now()}.jpg`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('delivery-photos')
      .upload(fileName, blob);

    if (uploadError) {
      setError('Failed to upload photo');
      setUpdating(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('delivery-photos')
      .getPublicUrl(fileName);

    await supabase
      .from('deliveries')
      .update({ photo_url: publicUrl })
      .eq('id', delivery.id);

    setDelivery({ ...delivery, photo_url: publicUrl });
    setCapturedPhoto(null);
    setUpdating(false);
  };

  const openNavigation = () => {
    if (!delivery?.orders) return;
    const { delivery_latitude, delivery_longitude } = delivery.orders;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${delivery_latitude},${delivery_longitude}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Delivery not found'}</p>
          <Link href="/partner/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(delivery.status);
  const nextStatus = STATUS_FLOW[currentStatusIndex + 1];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/partner/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold">{delivery.orders?.order_number}</h1>
              <p className="text-sm text-gray-500">Delivery Details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Status Progress */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <h2 className="font-semibold mb-4">Delivery Status</h2>
          <div className="flex justify-between mb-2">
            {STATUS_FLOW.map((status, index) => (
              <div key={status} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  index <= currentStatusIndex
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index <= currentStatusIndex ? '✓' : index + 1}
                </div>
                <span className="text-xs mt-1 text-center">{STATUS_LABELS[status].split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <p className="text-center mt-4 font-medium text-orange-600">
            Current: {STATUS_LABELS[delivery.status]}
          </p>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-xl p-6 mb-4">
          <h2 className="font-semibold mb-4">Customer Details</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <span>{delivery.recipient_name || 'Customer'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <a href={`tel:${delivery.recipient_phone}`} className="text-blue-600">
                {delivery.recipient_phone || 'No phone'}
              </a>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <span>{delivery.orders?.delivery_address || 'No address'}</span>
            </div>
          </div>
          <Button onClick={openNavigation} className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
            <Navigation className="h-4 w-4 mr-2" />
            Navigate to Customer
          </Button>
        </div>

        {/* Earnings */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 mb-4 text-white">
          <h2 className="font-semibold mb-2">Your Earnings</h2>
          <p className="text-3xl font-bold">
            R{((delivery.orders?.franchise_share_cents || 0) / 100).toFixed(2)}
          </p>
          <p className="text-sm opacity-80">50% of order profit</p>
        </div>

        {/* Photo Capture */}
        {delivery.status !== 'delivered' && (
          <div className="bg-white rounded-xl p-6 mb-4">
            <h2 className="font-semibold mb-4">Proof of Delivery</h2>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handlePhotoCapture}
              className="hidden"
            />
            {capturedPhoto ? (
              <div>
                <img src={capturedPhoto} alt="Captured" className="w-full rounded-lg mb-4" />
                <div className="flex gap-2">
                  <Button onClick={() => setCapturedPhoto(null)} variant="outline" className="flex-1">
                    Retake
                  </Button>
                  <Button onClick={uploadProofPhoto} disabled={updating} className="flex-1 bg-green-600">
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload Photo'}
                  </Button>
                </div>
              </div>
            ) : delivery.photo_url ? (
              <div>
                <img src={delivery.photo_url} alt="Proof" className="w-full rounded-lg" />
                <p className="text-sm text-green-600 mt-2 text-center">✓ Photo uploaded</p>
              </div>
            ) : (
              <Button onClick={() => fileInputRef.current?.click()} className="w-full" variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
            )}
          </div>
        )}

        {/* Delivered Confirmation */}
        {delivery.status === 'delivered' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <h2 className="font-bold text-green-800">Delivery Complete!</h2>
            <p className="text-sm text-green-600">
              Delivered at {new Date(delivery.delivered_at!).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      {nextStatus && delivery.status !== 'delivered' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="container mx-auto max-w-lg">
            <Button
              onClick={() => updateStatus(nextStatus)}
              disabled={updating}
              className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-yellow-500"
            >
              {updating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Truck className="h-5 w-5 mr-2" />
                  Mark as {STATUS_LABELS[nextStatus]}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}



