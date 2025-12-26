'use client';

import { useState, useEffect } from 'react';
import { Truck, Package, MapPin, Clock, Phone, AlertCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface ShippingZone {
  id: string;
  name: string;
  regions: string[];
  baseRate: number;
  freeShippingThreshold?: number;
  estimatedDays: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  carrier?: string;
}

const defaultZones: ShippingZone[] = [
  { id: 'gauteng', name: 'Gauteng', regions: ['JHB', 'PTA', 'Centurion'], baseRate: 5000, freeShippingThreshold: 50000, estimatedDays: '1-2 days' },
  { id: 'cape', name: 'Western Cape', regions: ['CPT', 'Stellenbosch'], baseRate: 7500, freeShippingThreshold: 75000, estimatedDays: '2-3 days' },
  { id: 'kzn', name: 'KwaZulu-Natal', regions: ['DBN', 'PMB'], baseRate: 7500, estimatedDays: '2-3 days' },
  { id: 'other', name: 'Other Provinces', regions: ['EC', 'FS', 'LP', 'MP', 'NC', 'NW'], baseRate: 9500, estimatedDays: '3-5 days' }
];

interface ShippingCalculatorProps {
  cartTotal: number;
  weight?: number;
  onSelect: (method: ShippingMethod) => void;
  selected?: string;
}

export function ShippingCalculator({ cartTotal, weight = 1, onSelect, selected }: ShippingCalculatorProps) {
  const [postalCode, setPostalCode] = useState('');
  const [zone, setZone] = useState<ShippingZone | null>(null);
  const [methods, setMethods] = useState<ShippingMethod[]>([]);

  const calculateShipping = () => {
    // Simplified zone detection based on postal code prefix
    const prefix = postalCode.substring(0, 1);
    let detectedZone: ShippingZone;
    
    if (['0', '1'].includes(prefix)) {
      detectedZone = defaultZones[0]; // Gauteng
    } else if (['7', '8'].includes(prefix)) {
      detectedZone = defaultZones[1]; // Western Cape
    } else if (['3', '4'].includes(prefix)) {
      detectedZone = defaultZones[2]; // KZN
    } else {
      detectedZone = defaultZones[3]; // Other
    }
    
    setZone(detectedZone);
    
    // Calculate shipping methods
    const isFreeShipping = detectedZone.freeShippingThreshold && cartTotal >= detectedZone.freeShippingThreshold;
    
    const shippingMethods: ShippingMethod[] = [
      {
        id: 'standard',
        name: 'Standard Delivery',
        description: `Delivered in ${detectedZone.estimatedDays}`,
        price: isFreeShipping ? 0 : detectedZone.baseRate,
        estimatedDays: detectedZone.estimatedDays,
        carrier: 'Courier Guy'
      },
      {
        id: 'express',
        name: 'Express Delivery',
        description: 'Next business day',
        price: detectedZone.baseRate * 2,
        estimatedDays: '1 day',
        carrier: 'RAM'
      },
      {
        id: 'economy',
        name: 'Economy',
        description: 'Budget-friendly option',
        price: Math.round(detectedZone.baseRate * 0.7),
        estimatedDays: '5-7 days',
        carrier: 'PostNet'
      }
    ];
    
    setMethods(shippingMethods);
  };

  return (
    <div className="space-y-4">
      {/* Postal Code Input */}
      <div>
        <label className="block text-sm font-medium mb-1">Enter postal code</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="e.g., 2000"
            className="flex-1 px-3 py-2 border rounded-lg"
            maxLength={4}
          />
          <Button onClick={calculateShipping} disabled={postalCode.length !== 4}>
            Calculate
          </Button>
        </div>
      </div>

      {/* Zone Info */}
      {zone && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">Delivering to {zone.name}</span>
          </div>
          {zone.freeShippingThreshold && cartTotal < zone.freeShippingThreshold && (
            <p className="text-sm text-blue-600 mt-1">
              Add {formatCurrency(zone.freeShippingThreshold - cartTotal)} more for free shipping!
            </p>
          )}
        </div>
      )}

      {/* Shipping Methods */}
      {methods.length > 0 && (
        <div className="space-y-2">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => onSelect(method)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition ${
                selected === method.id
                  ? 'border-[#ff6b35] bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selected === method.id ? 'bg-[#ff6b35] text-white' : 'bg-gray-100'
              }`}>
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{method.name}</span>
                  {method.carrier && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{method.carrier}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              <div className="text-right">
                <span className={`font-bold ${method.price === 0 ? 'text-green-600' : ''}`}>
                  {method.price === 0 ? 'FREE' : formatCurrency(method.price)}
                </span>
              </div>
              {selected === method.id && <Check className="h-5 w-5 text-[#ff6b35]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Admin Shipping Zone Manager
export function ShippingZoneManager({ 
  zones = defaultZones,
  onSave 
}: { 
  zones?: ShippingZone[];
  onSave: (zones: ShippingZone[]) => Promise<void>;
}) {
  const [editingZones, setEditingZones] = useState(zones);
  const [saving, setSaving] = useState(false);

  const updateZone = (id: string, field: keyof ShippingZone, value: any) => {
    setEditingZones(prev => prev.map(z => 
      z.id === id ? { ...z, [field]: value } : z
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(editingZones);
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">Shipping Zones</h2>
      
      <div className="space-y-4">
        {editingZones.map((zone) => (
          <div key={zone.id} className="border rounded-xl p-4">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Zone Name</label>
                <input
                  type="text"
                  value={zone.name}
                  onChange={(e) => updateZone(zone.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Rate (cents)</label>
                <input
                  type="number"
                  value={zone.baseRate}
                  onChange={(e) => updateZone(zone.id, 'baseRate', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Free Shipping Threshold</label>
                <input
                  type="number"
                  value={zone.freeShippingThreshold || ''}
                  onChange={(e) => updateZone(zone.id, 'freeShippingThreshold', parseInt(e.target.value) || undefined)}
                  placeholder="Optional"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Days</label>
                <input
                  type="text"
                  value={zone.estimatedDays}
                  onChange={(e) => updateZone(zone.id, 'estimatedDays', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
