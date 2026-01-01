'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addDays } from 'date-fns';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  Eye,
  MoreVertical
} from 'lucide-react';

interface ZonePartner {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  business_name: string | null;
  zone_id: string | null;
  zone_name: string | null;
  status: string;
  disclosure_sent_at: string | null;
  can_sign_after: string | null;
  agreement_signed_at: string | null;
  cooling_off_ends_at: string | null;
  deposit_paid_at: string | null;
  training_completed_at: string | null;
  stock_received_at: string | null;
  is_active: boolean;
  created_at: string;
  zones?: { name: string } | null;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<ZonePartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const supabase = createClient();

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('zone_partners')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPartners(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Update partner status with CPA compliance logic
  const updatePartnerStatus = async (partnerId: string, newStatus: string) => {
    setError(null);
    setSuccess(null);

    try {
      const updateData: Record<string, any> = { status: newStatus };

      // When status === 'approved', start the 14-day clock
      if (newStatus === 'approved') {
        const now = new Date();
        const canSignAfter = addDays(now, 14);
        
        updateData.disclosure_sent_at = now.toISOString();
        updateData.can_sign_after = canSignAfter.toISOString().split('T')[0]; // DATE only
        
        // TODO: Send WhatsApp notification that disclosure was sent
        // await fetch('/api/notify/whatsapp', {
        //   method: 'POST',
        //   body: JSON.stringify({ 
        //     partnerId, 
        //     template: 'disclosure_sent',
        //     canSignAfter: canSignAfter.toISOString().split('T')[0]
        //   })
        // });
      }

      const { error } = await supabase
        .from('zone_partners')
        .update(updateData)
        .eq('id', partnerId);

      if (error) throw error;

      if (newStatus === 'approved') {
        setSuccess('Partner approved! Disclosure sent, 14-day waiting period started.');
      } else {
        setSuccess(`Partner status updated to ${newStatus}`);
      }
      
      fetchPartners();
      setActionMenuOpen(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Activate partner (after all compliance steps complete)
  const activatePartner = async (partnerId: string) => {
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('zone_partners')
        .update({ is_active: true })
        .eq('id', partnerId);

      if (error) throw error;
      setSuccess('Partner activated! They can now receive orders.');
      fetchPartners();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusBadge = (partner: ZonePartner) => {
    if (partner.is_active) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Active</span>;
    }
    
    switch (partner.status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Pending Review</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{partner.status}</span>;
    }
  };

  const getComplianceProgress = (partner: ZonePartner) => {
    const steps = [
      !!partner.disclosure_sent_at,
      partner.can_sign_after ? new Date() >= new Date(partner.can_sign_after) : false,
      !!partner.agreement_signed_at,
      !!partner.deposit_paid_at,
      !!partner.training_completed_at,
      !!partner.stock_received_at,
    ];
    return steps.filter(Boolean).length;
  };

  const canActivate = (partner: ZonePartner) => {
    return (
      partner.disclosure_sent_at &&
      partner.can_sign_after && new Date() >= new Date(partner.can_sign_after) &&
      partner.agreement_signed_at &&
      partner.deposit_paid_at &&
      partner.training_completed_at &&
      partner.stock_received_at &&
      !partner.is_active
    );
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-navy-900">Zone Partners</h1>
        <p className="text-navy-600 mt-1">
          Manage partner applications and compliance
        </p>
      </div>

      {/* Alerts */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-navy-100 p-4">
          <p className="text-sm text-navy-600">Total Partners</p>
          <p className="text-2xl font-bold text-navy-900">{partners.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-navy-100 p-4">
          <p className="text-sm text-navy-600">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600">
            {partners.filter(p => p.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-navy-100 p-4">
          <p className="text-sm text-navy-600">In Onboarding</p>
          <p className="text-2xl font-bold text-blue-600">
            {partners.filter(p => p.status === 'approved' && !p.is_active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-navy-100 p-4">
          <p className="text-sm text-navy-600">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {partners.filter(p => p.is_active).length}
          </p>
        </div>
      </div>

      {/* Partners List */}
      {partners.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <Users className="w-12 h-12 text-navy-300 mx-auto mb-4" />
          <p className="text-navy-600">No partner applications yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-navy-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-navy-50 border-b border-navy-100">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Partner</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Zone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Compliance</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Can Sign After</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-navy-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-navy-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-navy-900">{partner.full_name}</p>
                      <p className="text-sm text-navy-500">{partner.email}</p>
                      {partner.business_name && (
                        <p className="text-sm text-navy-500">{partner.business_name}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-navy-600">
                    {partner.zone_name || partner.zone_id || 'Not assigned'}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(partner)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-navy-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-jeffy-500 rounded-full transition-all"
                          style={{ width: `${(getComplianceProgress(partner) / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-navy-600">{getComplianceProgress(partner)}/6</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-navy-600">
                    {partner.can_sign_after ? (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(partner.can_sign_after).toLocaleDateString()}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2 relative">
                      {/* Quick actions based on status */}
                      {partner.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updatePartnerStatus(partner.id, 'approved')}
                            className="p-1.5 rounded hover:bg-green-50 text-green-600"
                            title="Approve (starts 14-day wait)"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updatePartnerStatus(partner.id, 'rejected')}
                            className="p-1.5 rounded hover:bg-red-50 text-red-600"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {canActivate(partner) && (
                        <button
                          onClick={() => activatePartner(partner.id)}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Activate
                        </button>
                      )}

                      <button
                        onClick={() => setActionMenuOpen(actionMenuOpen === partner.id ? null : partner.id)}
                        className="p-1.5 rounded hover:bg-navy-100 text-navy-600"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown menu */}
                      {actionMenuOpen === partner.id && (
                        <div className="absolute right-0 top-8 bg-white border border-navy-200 rounded-lg shadow-lg py-1 z-10 min-w-[160px]">
                          <button
                            onClick={() => {/* TODO: View details */}}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-navy-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          {partner.is_active && (
                            <button
                              onClick={() => updatePartnerStatus(partner.id, 'suspended')}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-navy-50 text-red-600"
                            >
                              Suspend Partner
                            </button>
                          )}
                        </div>
                      )}
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
