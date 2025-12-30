'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  Eye,
  Image as ImageIcon
} from 'lucide-react';

interface RefundRequest {
  id: string;
  order_id: string;
  reason: string;
  reason_category: string;
  description: string | null;
  photo_urls: string[];
  status: string;
  who_pays: string;
  amount: string;
  refund_percentage: number;
  admin_notes: string | null;
  created_at: string;
  orders: { order_number: string; total: string } | null;
  zone_partners: { full_name: string; business_name: string | null } | null;
}

const WHO_PAYS_LABELS: Record<string, { label: string; color: string }> = {
  jeffy: { label: 'Jeffy Pays', color: 'bg-blue-100 text-blue-700' },
  partner: { label: 'Partner Pays', color: 'bg-orange-100 text-orange-700' },
  review: { label: 'Needs Review', color: 'bg-yellow-100 text-yellow-700' },
};

export default function AdminRefundsPage() {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const supabase = createClient();

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('refund_requests')
        .select('*, orders(order_number, total), zone_partners(full_name, business_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('refund_requests')
        .update({
          status: action,
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      setSuccess(`Refund request ${action}!`);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Pending</span>;
    }
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
      <div>
        <h1 className="text-3xl font-bold text-navy-900">Refund Requests</h1>
        <p className="text-navy-600 mt-1">Review and process customer refund requests</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle2 className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-navy-100 p-4">
          <p className="text-sm text-navy-600">Total Requests</p>
          <p className="text-2xl font-bold text-navy-900">{requests.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-navy-100 p-4">
          <p className="text-sm text-navy-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {requests.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-navy-100 p-4">
          <p className="text-sm text-navy-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {requests.filter(r => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-navy-100 p-4">
          <p className="text-sm text-navy-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">
            {requests.filter(r => r.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Requests Table */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <Clock className="w-12 h-12 text-navy-300 mx-auto mb-4" />
          <p className="text-navy-600">No refund requests yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-navy-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-navy-50 border-b border-navy-100">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Order</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Reason</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Who Pays</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-navy-600">Photos</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-navy-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-navy-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-navy-900">#{request.orders?.order_number}</p>
                    <p className="text-sm text-navy-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-navy-900">{request.reason}</p>
                    {request.description && (
                      <p className="text-sm text-navy-500 truncate max-w-[200px]">{request.description}</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-navy-900">R{request.amount}</p>
                    {request.refund_percentage < 100 && (
                      <p className="text-sm text-yellow-600">{request.refund_percentage}% of R{request.orders?.total}</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${WHO_PAYS_LABELS[request.who_pays]?.color || 'bg-gray-100'}`}>
                      {WHO_PAYS_LABELS[request.who_pays]?.label || request.who_pays}
                    </span>
                    {request.zone_partners && request.who_pays === 'partner' && (
                      <p className="text-xs text-navy-500 mt-1">
                        {request.zone_partners.business_name || request.zone_partners.full_name}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="py-3 px-4">
                    {request.photo_urls.length > 0 ? (
                      <span className="flex items-center gap-1 text-sm text-navy-600">
                        <ImageIcon className="w-4 h-4" />
                        {request.photo_urls.length}
                      </span>
                    ) : (
                      <span className="text-navy-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {request.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setAdminNotes('');
                            }}
                            className="p-1.5 rounded hover:bg-navy-100 text-navy-600"
                            title="Review"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(request.id, 'approved')}
                            className="p-1.5 rounded hover:bg-green-50 text-green-600"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAction(request.id, 'rejected')}
                            className="p-1.5 rounded hover:bg-red-50 text-red-600"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-navy-100">
              <h2 className="text-xl font-bold text-navy-900">Review Refund Request</h2>
              <p className="text-navy-500">Order #{selectedRequest.orders?.order_number}</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-navy-500">Reason</p>
                <p className="font-medium text-navy-900">{selectedRequest.reason}</p>
              </div>
              
              {selectedRequest.description && (
                <div>
                  <p className="text-sm text-navy-500">Description</p>
                  <p className="text-navy-900">{selectedRequest.description}</p>
                </div>
              )}

              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-navy-500">Amount</p>
                  <p className="font-bold text-navy-900">R{selectedRequest.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-navy-500">Who Pays</p>
                  <span className={`px-2 py-1 text-xs rounded-full ${WHO_PAYS_LABELS[selectedRequest.who_pays]?.color}`}>
                    {WHO_PAYS_LABELS[selectedRequest.who_pays]?.label}
                  </span>
                </div>
              </div>

              {selectedRequest.photo_urls.length > 0 && (
                <div>
                  <p className="text-sm text-navy-500 mb-2">Photos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedRequest.photo_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="" className="w-full aspect-square object-cover rounded-lg" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-navy-500 mb-2">Admin Notes (optional)</p>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes..."
                  rows={2}
                  className="w-full border border-navy-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-jeffy-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-navy-100 flex gap-3">
              <button
                onClick={() => setSelectedRequest(null)}
                className="flex-1 py-2 border border-navy-200 rounded-lg text-navy-700 hover:bg-navy-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(selectedRequest.id, 'rejected')}
                disabled={processing}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Reject
              </button>
              <button
                onClick={() => handleAction(selectedRequest.id, 'approved')}
                disabled={processing}
                className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



