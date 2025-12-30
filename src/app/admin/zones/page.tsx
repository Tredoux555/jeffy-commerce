'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  description: string | null;
  postal_codes: string[] | null;
  created_at: string;
}

export default function AdminZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    postal_codes: '',
  });

  const supabase = createClient();

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setZones(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const parsePostalCodes = (input: string): string[] => {
    return input
      .split(',')
      .map(p => p.trim())
      .filter(p => /^\d{4}$/.test(p));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const postalCodesArray = parsePostalCodes(formData.postal_codes);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('zones')
          .update({
            name: formData.name,
            description: formData.description || null,
            postal_codes: postalCodesArray,
          })
          .eq('id', editingId);

        if (error) throw error;
        setSuccess('Zone updated successfully!');
      } else {
        const { error } = await supabase
          .from('zones')
          .insert({
            name: formData.name,
            description: formData.description || null,
            postal_codes: postalCodesArray,
          });

        if (error) throw error;
        setSuccess('Zone created successfully!');
      }

      setFormData({ name: '', description: '', postal_codes: '' });
      setShowForm(false);
      setEditingId(null);
      fetchZones();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (zone: Zone) => {
    setEditingId(zone.id);
    setFormData({
      name: zone.name,
      description: zone.description || '',
      postal_codes: zone.postal_codes?.join(', ') || '',
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this zone?')) return;

    try {
      const { error } = await supabase
        .from('zones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSuccess('Zone deleted successfully!');
      fetchZones();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '', postal_codes: '' });
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jeffy-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Zones</h1>
          <p className="text-navy-600 mt-1">
            Manage delivery zones and assign postal codes to Zone Partners
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-jeffy-500 text-white rounded-lg hover:bg-jeffy-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Zone
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-navy-100 p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">
            {editingId ? 'Edit Zone' : 'Create New Zone'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Zone Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Cape Town Central"
                required
                className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-jeffy-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description of this zone"
                className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-jeffy-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Postal Codes
              </label>
              <input
                type="text"
                value={formData.postal_codes}
                onChange={(e) => setFormData({ ...formData, postal_codes: e.target.value })}
                placeholder="2196, 2191, 2090"
                className="w-full px-4 py-2 border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-jeffy-500 focus:border-transparent"
              />
              <p className="text-sm text-navy-500 mt-1">
                Enter SA postal codes (4 digits) separated by commas. These determine which Zone Partner gets orders.
              </p>
              {formData.postal_codes && (
                <p className="text-sm text-jeffy-600 mt-1">
                  ✓ {parsePostalCodes(formData.postal_codes).length} valid postal codes detected
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-jeffy-500 text-white rounded-lg hover:bg-jeffy-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update Zone' : 'Create Zone'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-navy-100 text-navy-700 rounded-lg hover:bg-navy-200 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {zones.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <MapPin className="w-12 h-12 text-navy-300 mx-auto mb-4" />
          <p className="text-navy-600 mb-4">No zones created yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-jeffy-600 hover:text-jeffy-700 font-medium"
          >
            Create your first zone
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-navy-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-navy-50 border-b border-navy-100">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Zone Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Description</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Postal Codes</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-navy-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-navy-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-jeffy-500" />
                      <span className="font-medium text-navy-900">{zone.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-navy-600">
                    {zone.description || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-jeffy-100 text-jeffy-700">
                      {zone.postal_codes?.length || 0} postal codes
                    </span>
                    {zone.postal_codes && zone.postal_codes.length > 0 && (
                      <p className="text-xs text-navy-500 mt-1 truncate max-w-[200px]">
                        {zone.postal_codes.slice(0, 5).join(', ')}
                        {zone.postal_codes.length > 5 && ` +${zone.postal_codes.length - 5} more`}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(zone)}
                        className="p-1.5 rounded hover:bg-navy-100 text-navy-600"
                        title="Edit zone"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(zone.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-600"
                        title="Delete zone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
