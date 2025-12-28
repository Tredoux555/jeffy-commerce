'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, Eye, Truck, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface Partner {
  id: string;
  user_id: string;
  full_legal_name: string;
  mobile: string;
  email: string;
  id_number: string;
  physical_address: string;
  bank_name: string;
  bank_account_number: string;
  bank_branch_code: string;
  application_status: string;
  total_deliveries: number;
  total_earnings_cents: number;
  application_submitted_at: string;
  application_reviewed_at: string | null;
  zone_id?: string | null;
}

interface Zone {
  id: string;
  name: string;
  is_active: boolean;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');

  useEffect(() => {
    fetchPartners();
    fetchZones();
  }, []);

  const fetchPartners = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('zone_partners')
      .select('*')
      .order('application_submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching partners:', error);
    }
    if (data) {
      setPartners(data);
    }
    setLoading(false);
  };

  const fetchZones = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('zones')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setZones(data);
    }
  };

  const updatePartnerStatus = async (partnerId: string, status: string) => {
    const supabase = createClient();
    
    const updateData: any = { application_status: status };
    if (status === 'approved') {
      updateData.application_reviewed_at = new Date().toISOString();
      updateData.is_active = true;
    }

    const { error } = await supabase
      .from('zone_partners')
      .update(updateData)
      .eq('id', partnerId);

    if (!error) {
      fetchPartners();
      setSelectedPartner(null);
    }
  };

  const assignZone = async (partnerId: string, zoneId: string) => {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('zone_partners')
      .update({ zone_id: zoneId || null })
      .eq('id', partnerId);

    if (!error) {
      fetchPartners();
      // Update selected partner if open
      if (selectedPartner && selectedPartner.id === partnerId) {
        setSelectedPartner({ ...selectedPartner, zone_id: zoneId || null });
      }
    }
  };

  const filteredPartners = partners.filter(p => {
    if (filter === 'all') return true;
    return p.application_status === filter;
  });

  const stats = {
    total: partners.length,
    pending: partners.filter(p => p.application_status === 'pending').length,
    approved: partners.filter(p => p.application_status === 'approved').length,
    rejected: partners.filter(p => p.application_status === 'rejected').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Rejected</span>;
      case 'suspended':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Suspended</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>;
    }
  };

  const getZoneName = (zoneId: string | null | undefined) => {
    if (!zoneId) return 'Unassigned';
    const zone = zones.find(z => z.id === zoneId);
    return zone ? zone.name : 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Zone Partners</h1>
            <p className="text-gray-600">Manage partner applications and zone assignments</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Partners List */}
        <div className="bg-white rounded-xl border overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : filteredPartners.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No partners found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Partner</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Contact</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Zone</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{partner.full_legal_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{partner.mobile}</p>
                      <p className="text-sm text-gray-500">{partner.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className={`text-sm ${partner.zone_id ? 'text-gray-900' : 'text-gray-400'}`}>
                          {getZoneName(partner.zone_id)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(partner.application_status)}
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPartner(partner);
                          setSelectedZoneId(partner.zone_id || '');
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Partner Detail Modal */}
        {selectedPartner && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Truck className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{selectedPartner.full_legal_name}</h2>
                      <div className="mt-1">{getStatusBadge(selectedPartner.application_status)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPartner(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Mobile</p>
                    <p className="font-medium">{selectedPartner.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedPartner.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID Number</p>
                    <p className="font-medium">{selectedPartner.id_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Applied</p>
                    <p className="font-medium">{selectedPartner.application_submitted_at ? new Date(selectedPartner.application_submitted_at).toLocaleDateString() : '-'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedPartner.physical_address}</p>
                </div>

                {/* Zone Assignment */}
                {selectedPartner.application_status === 'approved' && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-orange-600" />
                      Zone Assignment
                    </h3>
                    <div className="flex gap-3">
                      <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="flex-1 p-2 border rounded-lg"
                      >
                        <option value="">-- Select Zone --</option>
                        {zones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={() => assignZone(selectedPartner.id, selectedZoneId)}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        Assign Zone
                      </Button>
                    </div>
                    {selectedPartner.zone_id && (
                      <p className="text-sm text-orange-700 mt-2">
                        Currently assigned to: <strong>{getZoneName(selectedPartner.zone_id)}</strong>
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Bank Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Bank</p>
                      <p className="font-medium">{selectedPartner.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account</p>
                      <p className="font-medium">{selectedPartner.bank_account_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Branch</p>
                      <p className="font-medium">{selectedPartner.bank_branch_code}</p>
                    </div>
                  </div>
                </div>

                {selectedPartner.application_status === 'approved' && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold mb-3 text-green-800">Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-green-600">Total Deliveries</p>
                        <p className="text-2xl font-bold text-green-800">{selectedPartner.total_deliveries || 0}</p>
                      </div>
                      <div>
                        <p className="text-sm text-green-600">Total Earnings</p>
                        <p className="text-2xl font-bold text-green-800">
                          R{((selectedPartner.total_earnings_cents || 0) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t bg-gray-50 flex gap-3 justify-end">
                {selectedPartner.application_status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => updatePartnerStatus(selectedPartner.id, 'rejected')}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => updatePartnerStatus(selectedPartner.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                )}
                {selectedPartner.application_status === 'approved' && (
                  <Button
                    variant="outline"
                    onClick={() => updatePartnerStatus(selectedPartner.id, 'suspended')}
                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                  >
                    Suspend Partner
                  </Button>
                )}
                {(selectedPartner.application_status === 'suspended' || selectedPartner.application_status === 'rejected') && (
                  <Button
                    onClick={() => updatePartnerStatus(selectedPartner.id, 'approved')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Reactivate Partner
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
