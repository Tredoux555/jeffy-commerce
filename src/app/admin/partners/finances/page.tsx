'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Package,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  RefreshCw
} from 'lucide-react';

interface Balance {
  partner_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  zone_name: string | null;
  is_active: boolean;
  total_delivered_cents: number;
  total_paid_cents: number;
  balance_cents: number;
  last_delivery_date: string | null;
  last_payment_date: string | null;
  delivery_count: number;
  payment_count: number;
}

interface Transaction {
  id: string;
  partner_id: string;
  delivery_date?: string;
  payment_date?: string;
  wholesale_total_cents?: number;
  amount_cents?: number;
  status: string;
  notes?: string;
  method?: string;
  reference?: string;
  week_number?: number;
  year?: number;
}

export default function PartnerFinancesPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [totals, setTotals] = useState({
    totalDelivered: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    activePartners: 0,
    partnersWithBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Expanded partner view
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [partnerHistory, setPartnerHistory] = useState<{
    deliveries: Transaction[];
    payments: Transaction[];
  }>({ deliveries: [], payments: [] });
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'delivery' | 'payment'>('delivery');
  const [selectedPartner, setSelectedPartner] = useState<Balance | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    method: 'eft',
    reference: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/zone-partners/finances');
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error);
      
      setBalances(data.balances || []);
      setTotals(data.totals);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerHistory = async (partnerId: string) => {
    try {
      const res = await fetch(`/api/zone-partners/finances?partner_id=${partnerId}`);
      const data = await res.json();
      
      if (data.success) {
        setPartnerHistory({
          deliveries: data.deliveries || [],
          payments: data.payments || []
        });
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExpand = async (partner: Balance) => {
    if (expandedId === partner.partner_id) {
      setExpandedId(null);
    } else {
      setExpandedId(partner.partner_id);
      await fetchPartnerHistory(partner.partner_id);
    }
  };

  const openModal = (type: 'delivery' | 'payment', partner: Balance) => {
    setModalType(type);
    setSelectedPartner(partner);
    setFormData({
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      method: 'eft',
      reference: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/zone-partners/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: modalType,
          partner_id: selectedPartner.partner_id,
          amount: parseFloat(formData.amount),
          date: formData.date,
          notes: formData.notes || undefined,
          method: formData.method,
          reference: formData.reference || undefined
        })
      });

      const data = await res.json();
      
      if (!data.success) throw new Error(data.error);
      
      setSuccess(data.message);
      setShowModal(false);
      await fetchData();
      
      // Refresh history if this partner is expanded
      if (expandedId === selectedPartner.partner_id) {
        await fetchPartnerHistory(selectedPartner.partner_id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatRands = (cents: number) => {
    return `R${(cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;
  };

  const getBalanceColor = (cents: number) => {
    if (cents === 0) return 'text-green-600';
    if (cents > 0) return 'text-red-600';
    return 'text-blue-600'; // Credit balance (overpaid)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Partner Finances</h1>
          <p className="text-gray-600 mt-1">Track deliveries and payments</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">×</button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {success}
          <button onClick={() => setSuccess(null)} className="ml-auto">×</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <Package className="w-4 h-4" />
            <span className="text-sm">Total Delivered</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatRands(totals.totalDelivered)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm">Total Received</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatRands(totals.totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">Outstanding</span>
          </div>
          <p className={`text-2xl font-bold ${totals.totalOutstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatRands(totals.totalOutstanding)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-600 mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">With Balance</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{totals.partnersWithBalance}</p>
        </div>
      </div>

      {/* Partner List */}
      {balances.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No approved partners yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {balances
            .sort((a, b) => b.balance_cents - a.balance_cents)
            .map((partner) => {
              const isExpanded = expandedId === partner.partner_id;
              
              return (
                <div key={partner.partner_id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Main Row */}
                  <div 
                    onClick={() => handleExpand(partner)}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-gray-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{partner.full_name}</p>
                          {partner.is_active && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">Active</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{partner.zone_name || 'No zone'}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Delivered</p>
                        <p className="font-medium text-gray-900">{formatRands(partner.total_delivered_cents)}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Paid</p>
                        <p className="font-medium text-green-600">{formatRands(partner.total_paid_cents)}</p>
                      </div>
                      
                      <div className="text-right min-w-[100px]">
                        <p className="text-sm text-gray-500">Balance</p>
                        <p className={`font-bold ${getBalanceColor(partner.balance_cents)}`}>
                          {partner.balance_cents === 0 ? '✓ Clear' : formatRands(partner.balance_cents)}
                        </p>
                      </div>
                      
                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => openModal('delivery', partner)}
                          className="p-2 rounded-lg hover:bg-orange-50 text-orange-600 transition-colors"
                          title="Record Delivery"
                        >
                          <Package className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openModal('payment', partner)}
                          className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                          title="Record Payment"
                        >
                          <CreditCard className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Deliveries */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Package className="w-4 h-4 text-orange-500" />
                              Recent Deliveries
                            </h3>
                            <button
                              onClick={() => openModal('delivery', partner)}
                              className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" /> Add
                            </button>
                          </div>
                          {partnerHistory.deliveries.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No deliveries yet</p>
                          ) : (
                            <div className="space-y-2">
                              {partnerHistory.deliveries.map(d => (
                                <div key={d.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {formatRands(d.wholesale_total_cents || 0)}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Week {d.week_number}, {d.year}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-600">
                                        {d.delivery_date ? format(new Date(d.delivery_date), 'MMM d') : '-'}
                                      </p>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        d.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {d.status}
                                      </span>
                                    </div>
                                  </div>
                                  {d.notes && <p className="text-xs text-gray-500 mt-1">{d.notes}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Payments */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-green-500" />
                              Recent Payments
                            </h3>
                            <button
                              onClick={() => openModal('payment', partner)}
                              className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" /> Add
                            </button>
                          </div>
                          {partnerHistory.payments.length === 0 ? (
                            <p className="text-gray-500 text-sm italic">No payments yet</p>
                          ) : (
                            <div className="space-y-2">
                              {partnerHistory.payments.map(p => (
                                <div key={p.id} className="bg-white rounded-lg p-3 border border-gray-200">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-green-600">
                                        {formatRands(p.amount_cents || 0)}
                                      </p>
                                      <p className="text-xs text-gray-500 uppercase">
                                        {p.method} {p.reference && `• ${p.reference}`}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-600">
                                        {p.payment_date ? format(new Date(p.payment_date), 'MMM d') : '-'}
                                      </p>
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        p.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        {p.status}
                                      </span>
                                    </div>
                                  </div>
                                  {p.notes && <p className="text-xs text-gray-500 mt-1">{p.notes}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Add Modal */}
      {showModal && selectedPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className={`p-4 ${modalType === 'delivery' ? 'bg-orange-500' : 'bg-green-500'} text-white`}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {modalType === 'delivery' ? (
                    <><Package className="w-5 h-5" /> Record Delivery</>
                  ) : (
                    <><CreditCard className="w-5 h-5" /> Record Payment</>
                  )}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-white/20 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/80 text-sm mt-1">{selectedPartner.full_name}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (Rands)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={e => setFormData(f => ({ ...f, amount: e.target.value }))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              
              {modalType === 'payment' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                    <select
                      value={formData.method}
                      onChange={e => setFormData(f => ({ ...f, method: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="eft">EFT</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reference (optional)</label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={e => setFormData(f => ({ ...f, reference: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Bank reference"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={2}
                  placeholder="Any additional notes"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                    modalType === 'delivery' 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
