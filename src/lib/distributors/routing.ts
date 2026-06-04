import { createAdminClient } from '@/lib/supabase/server';
import type { Distributor } from '@/types/distributor';

// Distance between two lat/lng points in km (Haversine).
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface NearestResult {
  distributor: Distributor;
  distanceKm: number;
}

export type RoutingItem = { productId: string; quantity: number };

export type RoutingReason =
  | 'routed'
  | 'no_location'
  | 'no_active_distributors'
  | 'none_with_stock';

export interface RoutingOutcome {
  result: NearestResult | null;
  reason: RoutingReason;
}

// Stock-aware routing: the nearest ACTIVE reseller that holds enough on-hand stock for
// every line. Falls through the distance-ranked list; if none can fulfil, returns a
// reason so checkout can flag the order for admin assignment / Jeffy-direct.
export async function routeOrder(
  lat: number,
  lng: number,
  items?: RoutingItem[]
): Promise<RoutingOutcome> {
  if (lat == null || lng == null) return { result: null, reason: 'no_location' };

  const supabase = await createAdminClient();
  const { data, error } = await supabase.from('distributors').select('*').eq('status', 'active');
  if (error || !data || data.length === 0) {
    return { result: null, reason: 'no_active_distributors' };
  }

  // Rank active, geocoded distributors by distance.
  const ranked: NearestResult[] = [];
  for (const d of data as Distributor[]) {
    if (d.latitude == null || d.longitude == null) continue;
    ranked.push({ distributor: d, distanceKm: haversineKm(lat, lng, d.latitude, d.longitude) });
  }
  ranked.sort((a, b) => a.distanceKm - b.distanceKm);
  if (ranked.length === 0) return { result: null, reason: 'no_active_distributors' };

  // No stock requirement provided → nearest active wins.
  if (!items || items.length === 0) return { result: ranked[0], reason: 'routed' };

  const wantedIds = items.map((i) => i.productId);
  for (const cand of ranked) {
    const { data: stock } = await supabase
      .from('distributor_stock')
      .select('product_id, qty_on_hand')
      .eq('distributor_id', cand.distributor.id)
      .in('product_id', wantedIds);

    const have = new Map<string, number>();
    for (const s of (stock || []) as Array<{ product_id: string; qty_on_hand: number }>) {
      have.set(s.product_id, s.qty_on_hand || 0);
    }
    const canFulfil = items.every((i) => (have.get(i.productId) || 0) >= i.quantity);
    if (canFulfil) return { result: cand, reason: 'routed' };
  }

  return { result: null, reason: 'none_with_stock' };
}

// Back-compat wrapper: nearest active distributor (optionally stock-aware).
export async function findNearestDistributor(
  lat: number,
  lng: number,
  items?: RoutingItem[]
): Promise<NearestResult | null> {
  const outcome = await routeOrder(lat, lng, items);
  return outcome.result;
}
