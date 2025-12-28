'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Camera, MapPin, AlertTriangle, CheckCircle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export default function PhotoProofPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Get location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => {
          setLocationError('Location access denied. Please enable GPS.');
        },
        { enableHighAccuracy: true }
      );
    } else {
      setLocationError('Geolocation not supported');
    }
  }, []);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const submitProof = async () => {
    if (!photo || !location) return;
    
    setSubmitting(true);

    try {
      const supabase = createClient();
      const now = new Date().toISOString();

      // Upload photo to storage
      const photoData = photo.split(',')[1]; // Remove data:image/... prefix
      const fileName = `proof_${orderId}_${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('delivery-proofs')
        .upload(fileName, Buffer.from(photoData, 'base64'), {
          contentType: 'image/jpeg',
        });

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('delivery-proofs')
        .getPublicUrl(fileName);

      // Update order with proof
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'delivered',
          delivered_at: now,
          delivery_proof_url: urlData?.publicUrl || null,
          delivery_proof_latitude: location.latitude,
          delivery_proof_longitude: location.longitude,
          delivery_proof_type: 'photo',
          delivery_notes: 'Left at location - photo proof provided',
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Redirect to dashboard
      router.push('/partner/dashboard?delivered=1');
    } catch (err: any) {
      alert('Failed to submit proof: ' + err.message);
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/partner/delivery/${orderId}`}>
            <Button variant="ghost" size="sm" className="text-gray-400">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-xl">Photo Proof</h1>
            <p className="text-sm text-gray-400">Last resort delivery option</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Warning */}
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-400">Important Notice</h3>
              <p className="text-sm text-yellow-200 mt-1">
                Photo proof delivery should only be used when the customer is unavailable 
                and has agreed to have the package left. The customer accepts all risk for 
                packages left unattended.
              </p>
            </div>
          </div>
        </div>

        {/* Location Status */}
        <div className="bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <MapPin className={`h-5 w-5 ${location ? 'text-green-500' : 'text-red-500'}`} />
            <div>
              <p className="font-medium">
                {location ? 'Location captured' : locationError || 'Getting location...'}
              </p>
              {location && (
                <p className="text-xs text-gray-400">
                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)} 
                  (±{Math.round(location.accuracy)}m)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Photo Capture */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="font-semibold mb-4">Delivery Photo</h2>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoCapture}
            className="hidden"
          />

          {!photo ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video bg-gray-700 rounded-lg flex flex-col items-center justify-center gap-3 hover:bg-gray-600 transition"
            >
              <Camera className="h-12 w-12 text-gray-400" />
              <p className="text-gray-400">Tap to take photo</p>
            </button>
          ) : (
            <div className="relative">
              <img src={photo} alt="Delivery proof" className="w-full rounded-lg" />
              <button
                onClick={() => setPhoto(null)}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Acknowledgment */}
        <div className="bg-gray-800 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-gray-600"
            />
            <span className="text-sm text-gray-300">
              I confirm that the customer has agreed to have their package left at this location, 
              and I have taken a clear photo showing the package placement. The customer understands 
              they accept all risk for unattended packages.
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          onClick={submitProof}
          disabled={!photo || !location || !acknowledged || submitting}
          className="w-full h-14 text-lg bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600"
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Submit Photo Proof
            </>
          )}
        </Button>

        {/* Disabled reasons */}
        {(!photo || !location || !acknowledged) && (
          <div className="text-sm text-gray-500 text-center">
            {!location && <p>⚠️ Waiting for GPS location</p>}
            {!photo && <p>⚠️ Photo required</p>}
            {!acknowledged && <p>⚠️ Please acknowledge the terms</p>}
          </div>
        )}
      </div>
    </div>
  );
}
