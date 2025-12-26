'use client';

import { useState } from 'react';
import { MapPin, Clock, Phone, Navigation, Search, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone?: string;
  hours: string;
  lat: number;
  lng: number;
  type: 'pudo' | 'postnet' | 'paxi' | 'store';
  distance?: number;
}

const defaultPickupPoints: PickupPoint[] = [
  {
    id: '1',
    name: 'PUDO Locker - Sandton City',
    address: 'Sandton City Mall, Level 2',
    city: 'Sandton',
    province: 'Gauteng',
    postalCode: '2196',
    hours: '24/7 Access',
    lat: -26.1076,
    lng: 28.0567,
    type: 'pudo'
  },
  {
    id: '2',
    name: 'PostNet - Rosebank',
    address: 'The Zone @ Rosebank, Shop 45',
    city: 'Rosebank',
    province: 'Gauteng',
    postalCode: '2196',
    phone: '011 447 1234',
    hours: 'Mon-Fri: 8am-6pm, Sat: 9am-2pm',
    lat: -26.1452,
    lng: 28.0427,
    type: 'postnet'
  },
  {
    id: '3',
    name: 'Paxi Point - Checkers Fourways',
    address: 'Fourways Mall, Checkers Store',
    city: 'Fourways',
    province: 'Gauteng',
    postalCode: '2191',
    hours: 'Mon-Sun: 8am-8pm',
    lat: -26.0187,
    lng: 28.0125,
    type: 'paxi'
  }
];

interface PickupSelectorProps {
  pickupPoints?: PickupPoint[];
  onSelect: (point: PickupPoint) => void;
  selectedId?: string;
}

export function PickupPointSelector({ pickupPoints = defaultPickupPoints, onSelect, selectedId }: PickupSelectorProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filteredPoints = pickupPoints.filter(point => {
    const matchesSearch = 
      point.name.toLowerCase().includes(search.toLowerCase()) ||
      point.address.toLowerCase().includes(search.toLowerCase()) ||
      point.city.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === 'all' || point.type === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pudo': return '📦';
      case 'postnet': return '📮';
      case 'paxi': return '🛒';
      case 'store': return '🏪';
      default: return '📍';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by location or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
        />
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pudo', 'postnet', 'paxi'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1 rounded-full text-sm transition ${
              filter === type 
                ? 'bg-[#ff6b35] text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredPoints.map((point) => (
          <button
            key={point.id}
            onClick={() => onSelect(point)}
            className={`w-full text-left p-4 border rounded-lg transition ${
              selectedId === point.id 
                ? 'border-[#ff6b35] bg-orange-50' 
                : 'hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{getTypeIcon(point.type)}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{point.name}</h4>
                  {selectedId === point.id && (
                    <Check className="h-5 w-5 text-[#ff6b35]" />
                  )}
                </div>
                <p className="text-sm text-gray-600">{point.address}</p>
                <p className="text-sm text-gray-500">{point.city}, {point.province}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {point.hours}
                  </span>
                  {point.distance && (
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {point.distance} km
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}

        {filteredPoints.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No pickup points found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Delivery method selector
interface DeliveryMethodProps {
  onSelect: (method: 'delivery' | 'pickup') => void;
  selected: 'delivery' | 'pickup';
}

export function DeliveryMethodSelector({ onSelect, selected }: DeliveryMethodProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => onSelect('delivery')}
        className={`p-4 border-2 rounded-xl text-center transition ${
          selected === 'delivery' 
            ? 'border-[#ff6b35] bg-orange-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className="text-3xl mb-2 block">🚚</span>
        <p className="font-medium">Home Delivery</p>
        <p className="text-sm text-gray-500">3-5 business days</p>
      </button>
      
      <button
        onClick={() => onSelect('pickup')}
        className={`p-4 border-2 rounded-xl text-center transition ${
          selected === 'pickup' 
            ? 'border-[#ff6b35] bg-orange-50' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <span className="text-3xl mb-2 block">📦</span>
        <p className="font-medium">Pickup Point</p>
        <p className="text-sm text-gray-500">FREE - Ready in 2-3 days</p>
      </button>
    </div>
  );
}
