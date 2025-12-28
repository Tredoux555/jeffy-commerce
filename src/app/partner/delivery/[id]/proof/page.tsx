'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, MapPin, AlertTriangle, CheckCircle, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function PhotoProofPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [proofType, setProofType] = useState<'left_at_door' | 'given_to_person'>('left_at_door');
  const [recipientName, setRecipientName] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    fetchOrder();
    getLocation();
  }, [orderId]);

  const fetchOrder = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, customer_name, delivery_address')
      .eq('id', orderId)
      .single();
    
    if (data) setOrder(data);
    setLoading(false);
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        setLocationError('Could not get location. Please enable GPS.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhoto(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitProof = async () => {
    if (!photo || !location || !acknowledged) return;

    setSubmitting(true);
    const supabase = createClient();

    // Upload photo to Supabase storage
    let photoUrl = '';
    if (photoFile) {
      const fileName = `proof_${orderId}_${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('delivery-proofs')
        .upload(fileName, photoFile);

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('delivery-proofs')
          .getPublicUrl(fileName);
        photoUrl = urlData?.publicUrl || '';
      }
    }

    // Update order with proof
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'delivered',
        delivered_at: new Date().toISOString(),
        delivery_proof: {
          type: proofType,
          photo_url: photoUrl,
          recipient_name: proofType === 'given_to_person' ? recipientName : null,
          location: location,
          timestamp: new Date().toISOString(),
          risk_acknowledged: true,
        },
      })
      .eq('id', orderId);

    if (error) {
      alert('Failed to submit proof');
      setSubmitting(false);
      return;
    }

    router.push('/partner/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-32">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/partner/delivery/${orderId}`}>
            <Button variant="ghost" size="sm" className="text-gray-400">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold">Photo Proof</h1>
            <p className="text-sm text-gray-400">{order?.order_number}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Warning */}
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-400">Alternative Delivery</p>
              <p className="text-sm text-yellow-200/80 mt-1">
                Use this only when the customer cannot confirm in person.
                If the package goes missing, the customer accepts the risk.
              </p>
            </div>
          </div>
        </div>

        {/* Proof Type */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Delivery Type</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="proofType"
                checked={proofType === 'left_at_door'}
                onChange={() => setProofType('left_at_door')}
                className="w-4 h-4 accent-orange-500"
              />
              <div>
                <p className="font-medium">Left at door/gate</p>
                <p className="text-sm text-gray-400">Package left at secure location</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg cursor-pointer">
              <input
                type="radio"
                name="proofType"
                checked={proofType === 'given_to_person'}
                onChange={() => setProofType('given_to_person')}
                className="w-4 h-4 accent-orange-500"
              />
              <div>
                <p className="font-medium">Given to another person</p>
                <p className="text-sm text-gray-400">Handed to friend/family/neighbor</p>
              </div>
            </label>
          </div>

          {proofType === 'given_to_person' && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter name of person receiving"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Photo Capture */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Photo Evidence</h2>
          
          {photo ? (
            <div className="space-y-4">
              <img src={photo} alt="Proof" className="w-full rounded-lg" />
              <Button
                variant="outline"
                onClick={() => { setPhoto(null); setPhotoFile(null); }}
                className="w-full"
              >
                Retake Photo
              </Button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-orange-500 transition"
            >
              <Camera className="h-10 w-10 text-gray-400" />
              <span className="text-gray-400">Take Photo</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />
        </div>

        {/* Location */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </h2>
          {location ? (
            <div className="text-green-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              GPS Location captured
              <span className="text-xs text-gray-500">
                ({location.lat.toFixed(6)}, {location.lng.toFixed(6)})
              </span>
            </div>
          ) : locationError ? (
            <div className="text-red-400">{locationError}</div>
          ) : (
            <div className="text-gray-400">Getting location...</div>
          )}
        </div>

        {/* Acknowledgment */}
        <label className="flex items-start gap-3 p-4 bg-gray-800 rounded-xl cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-orange-500"
          />
          <span className="text-sm text-gray-300">
            I confirm the package was delivered to the address shown. The customer has accepted responsibility 
            if the package goes missing after this alternative delivery method.
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-800 border-t border-gray-700">
        <Button
          onClick={submitProof}
          disabled={!photo || !location || !acknowledged || submitting || (proofType === 'given_to_person' && !recipientName)}
          className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Submit Proof & Complete Delivery
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
