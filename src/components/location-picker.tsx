'use client';

import { useState, useCallback, useEffect } from 'react';
import { MapPin, Crosshair, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  initialLocation?: { lat: number; lng: number };
}

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [useManualEntry, setUseManualEntry] = useState(false);

  // Check if Google Maps API is available
  const hasGoogleMaps = typeof window !== 'undefined' && 
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && 
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.length > 10;

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      
      setMarker(location);
      onLocationSelect(location);
      setUseManualEntry(false);
    } catch (err: any) {
      if (err.code === 1) {
        setError('Location access denied. Please enter your address manually.');
      } else {
        setError('Could not get your location. Please enter your address manually.');
      }
      setUseManualEntry(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = () => {
    if (!address.trim()) {
      setError('Please enter your delivery address');
      return;
    }
    
    // For now, use Johannesburg coordinates as default
    // In production, you'd use a geocoding service
    const defaultLocation = {
      lat: -26.2041,
      lng: 28.0473,
    };
    
    setMarker(defaultLocation);
    onLocationSelect({ ...defaultLocation, address: address.trim() });
    setError(null);
  };

  // Auto-detect location on mount
  useEffect(() => {
    if (!initialLocation && navigator.geolocation) {
      handleGetCurrentLocation();
    } else if (!navigator.geolocation) {
      setUseManualEntry(true);
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Location Button */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Delivery Location
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetCurrentLocation}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Crosshair className="h-4 w-4 mr-2" />
          )}
          Use My Location
        </Button>
      </div>

      {/* Simple Map Placeholder or Address Input */}
      <div className="rounded-lg overflow-hidden border bg-gray-100">
        {marker && !useManualEntry ? (
          <div className="h-[200px] flex flex-col items-center justify-center bg-green-50">
            <MapPin className="h-12 w-12 text-[#ff6b35] mb-2" />
            <p className="text-sm text-green-700 font-medium">Location Detected!</p>
            <p className="text-xs text-gray-500 mt-1">
              {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4 text-gray-600">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Enter your delivery address</span>
            </div>
            <div className="space-y-3">
              <Input
                placeholder="e.g., 123 Main Road, Sandton, Johannesburg"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full"
              />
              <Button 
                type="button" 
                onClick={handleAddressSubmit}
                className="w-full bg-[#ff6b35] hover:bg-orange-600"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Set Delivery Location
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-amber-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {marker && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <MapPin className="h-4 w-4" />
          <span>Delivery location set</span>
          <button 
            type="button"
            onClick={() => setUseManualEntry(true)}
            className="text-[#ff6b35] hover:underline ml-2"
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}



