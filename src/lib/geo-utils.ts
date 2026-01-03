// Check if a point is inside a polygon using ray casting algorithm
export function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: { lat: number; lng: number }[]
): boolean {
  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  const x = point.lng;
  const y = point.lat;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    if (
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }

  return inside;
}

// Find which zone contains a given point
export async function findZoneForLocation(
  supabase: any,
  lat: number,
  lng: number
): Promise<{ zoneId: string; zoneName: string } | null> {
  const { data: zones } = await supabase
    .from('zones')
    .select('id, name, polygon')
    .eq('is_active', true);

  if (!zones) return null;

  for (const zone of zones) {
    if (zone.polygon && isPointInPolygon({ lat, lng }, zone.polygon)) {
      return { zoneId: zone.id, zoneName: zone.name };
    }
  }

  return null;
}

// Find the partner assigned to a zone
export async function findPartnerForZone(
  supabase: any,
  zoneId: string
): Promise<{ partnerId: string; partnerName: string } | null> {
  const { data: partner } = await supabase
    .from('zone_partners')
    .select('id, full_legal_name')
    .eq('zone_id', zoneId)
    .eq('application_status', 'approved')
    .eq('is_active', true)
    .single();

  if (!partner) return null;

  return { partnerId: partner.id, partnerName: partner.full_legal_name };
}

// Get user's current location
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}








