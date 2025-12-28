'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Navigation, Package, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

interface DeliveryStop {
  id: string;
  order_number: string;
  customer_name: string;
  delivery_address: string;
  customer_phone: string;
  total_cents: number;
  items_count: number;
}

export default function PartnerRoutePage() {
  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  useEffect(() => {
    const storedPartnerId = localStorage.getItem('zonePartnerId');
    if (storedPartnerId) {
      setPartnerId(storedPartnerId);
      fetchTodaysDeliveries(storedPartnerId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTodaysDeliveries = async (pid: string) => {
    setLoading(true);
    const supabase = createClient();

    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id, order_number, customer_name, delivery_address, customer_phone, total_cents,
        order_items (id)
      `)
      .eq('zone_partner_id', pid)
      .eq('status', 'out_for_delivery')
      .order('created_at', { ascending: true });

    const deliveries: DeliveryStop[] = (orders || []).map(o => ({
      id: o.id,
      order_number: o.order_number,
      customer_name: o.customer_name || 'Customer',
      delivery_address: o.delivery_address,
      customer_phone: o.customer_phone || '',
      total_cents: o.total_cents,
      items_count: o.order_items?.length || 0
    }));

    setStops(deliveries);
    setLoading(false);
  };

  const openGoogleMapsRoute = () => {
    if (stops.length === 0) return;
    
    // Build Google Maps directions URL with multiple stops
    const addresses = stops.map(s => encodeURIComponent(s.delivery_address));
    const origin = addresses[0];
    const destination = addresses[addresses.length - 1];
    const waypoints = addresses.slice(1, -1).join('|');
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }
    url += '&travelmode=driving';
    
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!partnerId) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
        <p className="text-gray-400 mb-6">Please log in to view your route</p>
        <Link href="/partner/apply"><Button>Apply as Partner</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/partner/dashboard">
              <Button variant="ghost" size="sm" className="text-gray-400">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-xl">Today's Route</h1>
              <p className="text-sm text-gray-400">{stops.length} deliveries</p>
            </div>
          </div>
          <Button onClick={() => fetchTodaysDeliveries(partnerId!)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Start Route Button */}
        {stops.length > 0 && (
          <Button 
            onClick={openGoogleMapsRoute} 
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg"
          >
            <Navigation className="h-5 w-5 mr-2" />
            Start Route in Google Maps
          </Button>
        )}

        {/* Delivery Stops */}
        {stops.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No deliveries for today</p>
            <p className="text-sm text-gray-500">Scan orders to add them to your route</p>
            <Link href="/partner/scan" className="mt-4 inline-block">
              <Button variant="outline">Go to Scan</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {stops.map((stop, index) => (
              <div key={stop.id} className="bg-gray-800 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  {/* Stop Number */}
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                    {index + 1}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{stop.customer_name}</p>
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {stop.delivery_address}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{stop.order_number}</span>
                      <span>{stop.items_count} item{stop.items_count > 1 ? 's' : ''}</span>
                      <span className="text-green-500 font-medium">{formatCurrency(stop.total_cents)}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-col gap-2">
                    <Link href={`/partner/delivery/${stop.id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {stops.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-4 mt-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Deliveries</span>
              <span className="font-bold">{stops.length}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-400">Total Value</span>
              <span className="font-bold text-green-500">
                {formatCurrency(stops.reduce((sum, s) => sum + s.total_cents, 0))}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
