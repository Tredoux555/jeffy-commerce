'use client';

import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, DrawingManager } from '@react-google-maps/api';

const libraries: ("drawing" | "places")[] = ['drawing', 'places'];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

// Default center: Johannesburg, South Africa
const defaultCenter = {
  lat: -26.2041,
  lng: 28.0473,
};

interface ZoneMapProps {
  initialPolygon?: { lat: number; lng: number }[];
  onPolygonComplete?: (polygon: { lat: number; lng: number }[]) => void;
  readOnly?: boolean;
}

export function ZoneMap({ initialPolygon, onPolygonComplete, readOnly = false }: ZoneMapProps) {
  const [polygon, setPolygon] = useState<{ lat: number; lng: number }[] | null>(initialPolygon || null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onPolygonCompleteHandler = useCallback((poly: google.maps.Polygon) => {
    const path = poly.getPath();
    const coordinates: { lat: number; lng: number }[] = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push({ lat: point.lat(), lng: point.lng() });
    }
    
    setPolygon(coordinates);
    onPolygonComplete?.(coordinates);
    
    // Remove the drawn polygon (we'll render our own)
    poly.setMap(null);
  }, [onPolygonComplete]);

  const clearPolygon = () => {
    setPolygon(null);
    onPolygonComplete?.([]);
  };

  if (loadError) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-red-500">Error loading maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={polygon && polygon.length > 0 ? polygon[0] : defaultCenter}
        zoom={12}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {!readOnly && !polygon && (
          <DrawingManager
            onPolygonComplete={onPolygonCompleteHandler}
            options={{
              drawingMode: google.maps.drawing.OverlayType.POLYGON,
              drawingControl: true,
              drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.POLYGON],
              },
              polygonOptions: {
                fillColor: '#f97316',
                fillOpacity: 0.3,
                strokeColor: '#f97316',
                strokeWeight: 2,
                editable: true,
              },
            }}
          />
        )}
        
        {polygon && polygon.length > 0 && (
          <Polygon
            paths={polygon}
            options={{
              fillColor: '#f97316',
              fillOpacity: 0.3,
              strokeColor: '#f97316',
              strokeWeight: 2,
              editable: !readOnly,
            }}
            onMouseUp={() => {
              if (polygonRef.current && !readOnly) {
                const path = polygonRef.current.getPath();
                const coordinates: { lat: number; lng: number }[] = [];
                for (let i = 0; i < path.getLength(); i++) {
                  const point = path.getAt(i);
                  coordinates.push({ lat: point.lat(), lng: point.lng() });
                }
                onPolygonComplete?.(coordinates);
              }
            }}
            onLoad={(poly) => {
              polygonRef.current = poly;
            }}
          />
        )}
      </GoogleMap>
      
      {!readOnly && polygon && (
        <button
          type="button"
          onClick={clearPolygon}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Clear zone and redraw
        </button>
      )}
      
      {!readOnly && !polygon && (
        <p className="text-sm text-gray-500">
          Click on the map to draw your zone boundary. Click to add points, then close the shape.
        </p>
      )}
    </div>
  );
}


