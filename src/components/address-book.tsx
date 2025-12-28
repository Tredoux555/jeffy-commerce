'use client';

import { useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Check, Star, Home, Building, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  suburb?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

interface AddressBookProps {
  addresses: Address[];
  onAdd: (address: Omit<Address, 'id'>) => Promise<void>;
  onEdit: (id: string, address: Partial<Address>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
  onSelect?: (address: Address) => void;
  selectedId?: string;
  selectable?: boolean;
}

export function AddressBook({ 
  addresses, 
  onAdd, 
  onEdit, 
  onDelete, 
  onSetDefault,
  onSelect,
  selectedId,
  selectable = false
}: AddressBookProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async (data: Omit<Address, 'id'>) => {
    setLoading(true);
    try {
      if (editingId) {
        await onEdit(editingId, data);
      } else {
        await onAdd(data);
      }
      setShowForm(false);
      setEditingId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    setLoading(true);
    try {
      await onDelete(id);
    } finally {
      setLoading(false);
    }
  };

  const editingAddress = editingId ? addresses.find(a => a.id === editingId) : null;

  return (
    <div className="space-y-4">
      {/* Address List */}
      {!showForm && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                onClick={() => selectable && onSelect?.(address)}
                className={`relative border rounded-xl p-4 ${
                  selectable ? 'cursor-pointer hover:border-gray-300' : ''
                } ${selectedId === address.id ? 'border-[#ff6b35] bg-orange-50' : ''}`}
              >
                {/* Default badge */}
                {address.isDefault && (
                  <span className="absolute top-2 right-2 text-xs bg-[#ff6b35] text-white px-2 py-0.5 rounded-full">
                    Default
                  </span>
                )}

                {/* Selected checkmark */}
                {selectedId === address.id && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-[#ff6b35] text-white rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {address.type === 'home' ? (
                      <Home className="h-5 w-5 text-gray-600" />
                    ) : address.type === 'work' ? (
                      <Building className="h-5 w-5 text-gray-600" />
                    ) : (
                      <MapPin className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{address.label}</span>
                    </div>
                    <p className="text-sm text-gray-600">{address.fullName}</p>
                    <p className="text-sm text-gray-500">{address.phone}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {address.street}
                      {address.suburb && `, ${address.suburb}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {address.city}, {address.province} {address.postalCode}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {!selectable && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => { setEditingId(address.id); setShowForm(true); }}
                      className="text-sm text-gray-600 hover:text-[#ff6b35] flex items-center gap-1"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-sm text-gray-600 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                    {!address.isDefault && (
                      <button
                        onClick={() => onSetDefault(address.id)}
                        className="text-sm text-gray-600 hover:text-[#ff6b35] flex items-center gap-1 ml-auto"
                      >
                        <Star className="h-3 w-3" />
                        Set as Default
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New Button */}
          <Button
            onClick={() => { setShowForm(true); setEditingId(null); }}
            variant="outline"
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </>
      )}

      {/* Address Form */}
      {showForm && (
        <AddressForm
          initialData={editingAddress}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingId(null); }}
          loading={loading}
        />
      )}
    </div>
  );
}

// Address Form Component
interface AddressFormProps {
  initialData?: Address | null;
  onSave: (data: Omit<Address, 'id'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

function AddressForm({ initialData, onSave, onCancel, loading }: AddressFormProps) {
  const [formData, setFormData] = useState({
    label: initialData?.label || '',
    fullName: initialData?.fullName || '',
    phone: initialData?.phone || '',
    street: initialData?.street || '',
    suburb: initialData?.suburb || '',
    city: initialData?.city || '',
    province: initialData?.province || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || 'South Africa',
    isDefault: initialData?.isDefault || false,
    type: initialData?.type || 'home' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 
    'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
  ];

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-6 space-y-4">
      <h3 className="font-bold text-lg">
        {initialData ? 'Edit Address' : 'Add New Address'}
      </h3>

      {/* Address Type */}
      <div className="flex gap-2">
        {(['home', 'work', 'other'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFormData({ ...formData, type })}
            className={`px-4 py-2 rounded-lg border text-sm capitalize ${
              formData.type === type 
                ? 'border-[#ff6b35] bg-orange-50 text-[#ff6b35]' 
                : 'border-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Label */}
      <div>
        <label className="block text-sm font-medium mb-1">Address Label</label>
        <input
          type="text"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="e.g., Home, Office, Mom's House"
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      {/* Name & Phone */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-sm font-medium mb-1">Street Address</label>
        <input
          type="text"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          placeholder="123 Main Street, Unit 4"
          className="w-full px-3 py-2 border rounded-lg"
          required
        />
      </div>

      {/* Suburb */}
      <div>
        <label className="block text-sm font-medium mb-1">Suburb (optional)</label>
        <input
          type="text"
          value={formData.suburb}
          onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      {/* City, Province, Postal */}
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Province</label>
          <select
            value={formData.province}
            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">Select...</option>
            {provinces.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Postal Code</label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
      </div>

      {/* Default Checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.isDefault}
          onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
          className="w-4 h-4 text-[#ff6b35] rounded"
        />
        <span className="text-sm">Set as default address</span>
      </label>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {initialData ? 'Update Address' : 'Save Address'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
