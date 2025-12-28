'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { ZoneMap } from '@/components/zone-map';

interface Zone {
  id: string;
  name: string;
  description: string | null;
  polygon: { lat: number; lng: number }[] | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', polygon: [] as { lat: number; lng: number }[] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .order('name');

    if (!error && data) {
      setZones(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();
    const zoneData = {
      name: formData.name,
      description: formData.description || null,
      polygon: formData.polygon.length > 0 ? formData.polygon : null,
    };

    if (editingZone) {
      const { error } = await supabase
        .from('zones')
        .update(zoneData)
        .eq('id', editingZone.id);

      if (!error) {
        fetchZones();
        resetForm();
      }
    } else {
      const { error } = await supabase
        .from('zones')
        .insert(zoneData);

      if (!error) {
        fetchZones();
        resetForm();
      }
    }

    setSaving(false);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingZone(null);
    setFormData({ name: '', description: '', polygon: [] });
  };

  const toggleZoneActive = async (zone: Zone) => {
    const supabase = createClient();
    await supabase
      .from('zones')
      .update({ is_active: !zone.is_active })
      .eq('id', zone.id);
    fetchZones();
  };

  const deleteZone = async (zoneId: string) => {
    if (!confirm('Are you sure you want to delete this zone?')) return;
    
    const supabase = createClient();
    await supabase.from('zones').delete().eq('id', zoneId);
    fetchZones();
  };

  const startEdit = (zone: Zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description || '',
      polygon: zone.polygon || [],
    });
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Delivery Zones</h1>
            <p className="text-gray-600">Manage delivery areas for zone partners</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="bg-orange-500 hover:bg-orange-600 w-fit">
              <Plus className="h-4 w-4 mr-2" />
              Add Zone
            </Button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingZone ? 'Edit Zone' : 'New Zone'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zone Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Sandton, Cape Town CBD"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the area covered by this zone..."
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zone Boundary (draw on map)</label>
                <ZoneMap
                  initialPolygon={formData.polygon}
                  onPolygonComplete={(polygon) => setFormData({ ...formData, polygon })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : editingZone ? 'Update Zone' : 'Create Zone'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Zones List */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : zones.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No zones created yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first delivery zone to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                + Add Zone
              </button>
            </div>
          ) : (
            <div className="divide-y">
              {zones.map((zone) => (
                <div key={zone.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <MapPin className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{zone.name}</h3>
                        <p className="text-sm text-gray-500">
                          {zone.description || 'No description'}
                          {zone.polygon && zone.polygon.length > 0 && (
                            <span className="ml-2 text-green-600">• Map boundary set</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleZoneActive(zone)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          zone.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {zone.is_active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => startEdit(zone)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteZone(zone.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
