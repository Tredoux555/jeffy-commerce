'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addDays, format } from 'date-fns';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  MoreVertical
} from 'lucide-react';

interface ZonePartner {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  business_name: string | null;
  zone_id: string | null;
  zone_name: string | null;
  notes: string | null;
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
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<ZonePartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'inquiry' | 'pending' | 'approved' | 'active'>('all');

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

  const updatePartnerStatus = async (partnerId: string, newStatus: string) => {
    setError(null);
    setSuccess(null);

    try {
      const updateData: Record<string, any> = { status: newStatus };

      if (newStatus === 'approved') {
        const now = new Date();
        const canSignAfter = addDays(now, 14);
        updateData.disclosure_sent_at = now.toISOString();
        updateData.can_sign_after = canSignAfter.toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('zone_partners')
        .update(updateData)
        .eq('id', partnerId);

      if (error) throw error;

      if (newStatus === 'approved') {
        setSuccess('Partner approved! 14-day waiting period started.');
      } else if (newStatus === 'rejected') {
        setSuccess('Partner rejected.');
      } else {
        setSuccess(`Status updated to ${newStatus}`);
      }
      
      fetchPartners();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const activatePartner = async (partnerId: string) => {
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('zone_partners')
        .update({ is_active: true })
        .eq('id', partnerId);

      if (error) throw error;
      setSuccess('Partner activated!');
      fetchPartners();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return null;
    // Convert to international format for WhatsApp
    let cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '27' + cleaned.substring(1);
    }
    return cleaned;
  };

  const getStatusBadge = (partner: ZonePartner) => {
    if (partner.is_active) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>;
    }
    switch (partner.status) {
      case 'inquiry':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">Inquiry</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{partner.status}</span>;
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

  // Filter partners
  const filteredPartners = partners.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'inquiry') return p.status === 'inquiry';
    if (filter === 'pending') return p.status === 'pending';
    if (filter === 'approved') return p.status === 'approved' && !p.is_active;
    if (filter === 'active') return p.is_active;
    return true;
  });

  const stats = {
    total: partners.length,
    inquiry: partners.filter(p => p.status === 'inquiry').length,
    pending: partners.filter(p => p.status === 'pending').length,
    onboarding: partners.filter(p => p.status === 'approved' && !p.is_active).length,
    active: partners.filter(p => p.is_active).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Zone Partners</h1>
        <p className="text-gray-600 mt-1">Manage applications and onboarding</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {success}
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-500 hover:text-green-700">×</button>
        </div>
      )}

      {/* Stats Cards - Clickable Filters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`text-left p-4 rounded-xl border transition-all ${
            filter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 hover:border-gray-300'
          }`}
        >
          <p className={`text-sm ${filter === 'all' ? 'text-gray-300' : 'text-gray-600'}`}>Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </button>
        <button
          onClick={() => setFilter('inquiry')}
          className={`text-left p-4 rounded-xl border transition-all ${
            filter === 'inquiry' ? 'bg-purple-500 text-white border-purple-500' : 'bg-white border-gray-200 hover:border-purple-300'
          }`}
        >
          <p className={`text-sm ${filter === 'inquiry' ? 'text-purple-100' : 'text-gray-600'}`}>Inquiry</p>
          <p className={`text-2xl font-bold ${filter !== 'inquiry' ? 'text-purple-600' : ''}`}>{stats.inquiry}</p>
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`text-left p-4 rounded-xl border transition-all ${
            filter === 'pending' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white border-gray-200 hover:border-yellow-300'
          }`}
        >
          <p className={`text-sm ${filter === 'pending' ? 'text-yellow-100' : 'text-gray-600'}`}>Pending</p>
          <p className={`text-2xl font-bold ${filter !== 'pending' ? 'text-yellow-600' : ''}`}>{stats.pending}</p>
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`text-left p-4 rounded-xl border transition-all ${
            filter === 'approved' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'
          }`}
        >
          <p className={`text-sm ${filter === 'approved' ? 'text-blue-100' : 'text-gray-600'}`}>Onboarding</p>
          <p className={`text-2xl font-bold ${filter !== 'approved' ? 'text-blue-600' : ''}`}>{stats.onboarding}</p>
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`text-left p-4 rounded-xl border transition-all ${
            filter === 'active' ? 'bg-green-500 text-white border-green-500' : 'bg-white border-gray-200 hover:border-green-300'
          }`}
        >
          <p className={`text-sm ${filter === 'active' ? 'text-green-100' : 'text-gray-600'}`}>Active</p>
          <p className={`text-2xl font-bold ${filter !== 'active' ? 'text-green-600' : ''}`}>{stats.active}</p>
        </button>
      </div>

      {/* Partners List */}
      {filteredPartners.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">
            {filter === 'all' ? 'No applications yet' : `No ${filter} partners`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPartners.map((partner) => {
            const isExpanded = expandedId === partner.id;
            const whatsappNumber = formatPhone(partner.phone);
            
            return (
              <div key={partner.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Main Row - Clickable */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : partner.id)}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Expand Icon */}
                    <div className="text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                    
                    {/* Partner Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{partner.full_name}</p>
                      <p className="text-sm text-gray-500 truncate">{partner.email}</p>
                    </div>
                    
                    {/* Zone */}
                    <div className="hidden md:block text-sm text-gray-600 max-w-[200px] truncate">
                      {partner.zone_name || partner.zone_id || '-'}
                    </div>
                    
                    {/* Status */}
                    <div>
                      {getStatusBadge(partner)}
                    </div>
                    
                    {/* Quick Contact Buttons */}
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      {whatsappNumber && (
                        <a
                          href={`https://wa.me/${whatsappNumber}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      )}
                      <a
                        href={`mailto:${partner.email}`}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                        title="Email"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                      {partner.phone && (
                        <a
                          href={`tel:${partner.phone}`}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                          title="Call"
                        >
                          <Phone className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                    
                    {/* Quick Actions */}
                    {partner.status === 'inquiry' && (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => updatePartnerStatus(partner.id, 'pending')}
                          className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                          title="Mark as Qualified"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updatePartnerStatus(partner.id, 'rejected')}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    {partner.status === 'pending' && (
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => updatePartnerStatus(partner.id, 'approved')}
                          className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => updatePartnerStatus(partner.id, 'rejected')}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column - Contact & Zone */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Contact Details</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{partner.email}</span>
                            <a href={`mailto:${partner.email}`} className="text-blue-600 text-sm hover:underline">Send email</a>
                          </div>
                          
                          {partner.phone && (
                            <div className="flex items-center gap-3">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-900">{partner.phone}</span>
                              {whatsappNumber && (
                                <a 
                                  href={`https://wa.me/${whatsappNumber}`} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-600 text-sm hover:underline"
                                >
                                  WhatsApp
                                </a>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            <span className="text-gray-900">{partner.zone_name || partner.zone_id || 'Not specified'}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Applied {format(new Date(partner.created_at), 'MMM d, yyyy \'at\' h:mm a')}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Right Column - Application & Notes */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Application</h3>
                        
                        {partner.notes ? (
                          <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <p className="text-sm text-gray-500 mb-1">Why they want to join:</p>
                            <p className="text-gray-900">{partner.notes}</p>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">No message provided</p>
                        )}
                        
                        {/* Compliance Progress */}
                        {partner.status === 'approved' && (
                          <div className="mt-4">
                            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-3">Compliance ({getComplianceProgress(partner)}/6)</h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                {partner.disclosure_sent_at ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                                <span className={partner.disclosure_sent_at ? 'text-gray-900' : 'text-gray-500'}>Disclosure sent</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {partner.can_sign_after && new Date() >= new Date(partner.can_sign_after) ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                                <span className={partner.can_sign_after && new Date() >= new Date(partner.can_sign_after) ? 'text-gray-900' : 'text-gray-500'}>
                                  14-day wait {partner.can_sign_after && `(${format(new Date(partner.can_sign_after), 'MMM d')})`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                {partner.agreement_signed_at ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                                <span className={partner.agreement_signed_at ? 'text-gray-900' : 'text-gray-500'}>Agreement signed</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {partner.deposit_paid_at ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                                <span className={partner.deposit_paid_at ? 'text-gray-900' : 'text-gray-500'}>Deposit received</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {partner.training_completed_at ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                                <span className={partner.training_completed_at ? 'text-gray-900' : 'text-gray-500'}>Training completed</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {partner.stock_received_at ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                                <span className={partner.stock_received_at ? 'text-gray-900' : 'text-gray-500'}>Stock received</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
                      {partner.status === 'inquiry' && (
                        <>
                          <button
                            onClick={() => updatePartnerStatus(partner.id, 'pending')}
                            className="px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                          >
                            ✓ Qualified - Move to Pending
                          </button>
                          <button
                            onClick={() => updatePartnerStatus(partner.id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {partner.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updatePartnerStatus(partner.id, 'approved')}
                            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve Application
                          </button>
                          <button
                            onClick={() => updatePartnerStatus(partner.id, 'rejected')}
                            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {canActivate(partner) && (
                        <button
                          onClick={() => activatePartner(partner.id)}
                          className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Activate Partner
                        </button>
                      )}
                      
                      {whatsappNumber && (
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi ${partner.full_name.split(' ')[0]}, this is Tredoux from Jeffy.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors inline-flex items-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" /> WhatsApp
                        </a>
                      )}
                      
                      <a
                        href={`mailto:${partner.email}?subject=Your Jeffy Zone Partner Application`}
                        className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" /> Email
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
