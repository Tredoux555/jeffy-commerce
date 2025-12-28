'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Download, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PartnerAcceptancesPage() {
  const [acceptances, setAcceptances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [zones, setZones] = useState<string[]>([]);
  const [selectedAcceptance, setSelectedAcceptance] = useState<any>(null);

  useEffect(() => {
    const loadAcceptances = async () => {
      const supabase = createClient();

      const { data: acceptanceData, error: acceptanceError } = await supabase
        .from('zone_partner_acceptances')
        .select('*')
        .order('created_at', { ascending: false });

      if (!acceptanceError && acceptanceData) {
        setAcceptances(acceptanceData);

        const uniqueZones = [...new Set(acceptanceData.map((a: any) => a.zone_name))].filter(
          Boolean
        ) as string[];
        setZones(uniqueZones);
      }

      setLoading(false);
    };

    loadAcceptances();
  }, []);

  const filteredAcceptances = acceptances.filter((acceptance) => {
    const matchesSearch =
      acceptance.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acceptance.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acceptance.phone?.includes(searchTerm);

    const matchesZone = !filterZone || acceptance.zone_name === filterZone;

    return matchesSearch && matchesZone;
  });

  const downloadCSV = () => {
    const headers = [
      'Full Name',
      'Email',
      'Phone',
      'Zone',
      'Accepted At',
      'IP Address',
      'Device',
      'Confirmation Email Sent',
    ];
    const rows = filteredAcceptances.map((a) => [
      a.full_name,
      a.email,
      a.phone,
      a.zone_name,
      new Date(a.accepted_at).toLocaleString(),
      a.accepted_ip,
      a.accepted_device,
      a.confirmation_email_sent ? 'Yes' : 'No',
    ]);

    const csv =
      [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zone-partner-acceptances-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Zone Partner Acceptances</h1>
          <p className="text-gray-600">
            Track all partners who have accepted the Zone Partner Agreement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Acceptances</div>
            <div className="text-3xl font-bold text-gray-900">{acceptances.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">This Month</div>
            <div className="text-3xl font-bold text-gray-900">
              {
                acceptances.filter(
                  (a) =>
                    new Date(a.created_at).getMonth() === new Date().getMonth() &&
                    new Date(a.created_at).getFullYear() === new Date().getFullYear()
                ).length
              }
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Emails Confirmed</div>
            <div className="text-3xl font-bold text-green-600">
              {acceptances.filter((a) => a.confirmation_email_sent).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Zones</div>
            <div className="text-3xl font-bold text-gray-900">{zones.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Zones</option>
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <Button
              onClick={downloadCSV}
              variant="outline"
              className="flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Showing {filteredAcceptances.length} of {acceptances.length} acceptances
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Accepted
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAcceptances.map((acceptance) => {
                const acceptedDate = new Date(acceptance.accepted_at);
                const isRecentlyAccepted =
                  Date.now() - acceptedDate.getTime() < 24 * 60 * 60 * 1000;

                return (
                  <tr key={acceptance.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{acceptance.full_name}</div>
                      <div className="text-sm text-gray-500">{acceptance.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        {acceptance.zone_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{acceptance.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {acceptedDate.toLocaleDateString()} {acceptedDate.toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {acceptance.confirmation_email_sent ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-700">Email Sent</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-yellow-700">Pending</span>
                          </>
                        )}
                        {isRecentlyAccepted && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            New
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAcceptance(acceptance)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredAcceptances.length === 0 && (
            <div className="p-8 text-center text-gray-600">
              No acceptances found matching your filters.
            </div>
          )}
        </div>
      </div>

      {selectedAcceptance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-96 overflow-y-auto">
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-4 text-white">
              <h2 className="text-xl font-bold">Acceptance Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedAcceptance.full_name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Zone</label>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedAcceptance.zone_name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="text-gray-900">{selectedAcceptance.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Phone</label>
                <p className="text-gray-900">{selectedAcceptance.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Accepted At</label>
                <p className="text-gray-900">
                  {new Date(selectedAcceptance.accepted_at).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">IP Address</label>
                <p className="text-gray-900 font-mono text-sm">{selectedAcceptance.accepted_ip}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Device</label>
                <p className="text-gray-900">{selectedAcceptance.accepted_device}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Confirmation Email</label>
                <p className="text-gray-900">
                  {selectedAcceptance.confirmation_email_sent ? '✓ Sent' : '✗ Pending'}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedAcceptance(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


