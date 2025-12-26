'use client';

import { useState, useEffect } from 'react';
import { Calendar, Send, Check, Loader2, Users, TrendingUp, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  type: 'promotional' | 'transactional' | 'newsletter' | 'abandoned_cart';
}

interface Campaign {
  id: string;
  name: string;
  template: string;
  status: 'draft' | 'scheduled' | 'sent' | 'sending';
  scheduledAt?: string;
  sentAt?: string;
  recipients: number;
  opened: number;
  clicked: number;
  segment?: string;
}

// Admin Email Campaign Dashboard
export function EmailCampaignDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      setCampaigns(data || []);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter(c => c.status === 'sent').length,
    totalRecipients: campaigns.reduce((sum, c) => sum + c.recipients, 0),
    avgOpenRate: campaigns.filter(c => c.status === 'sent').length > 0
      ? campaigns.filter(c => c.status === 'sent')
          .reduce((sum, c) => sum + (c.opened / c.recipients) * 100, 0) / 
          campaigns.filter(c => c.status === 'sent').length
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <Mail className="h-5 w-5 text-[#ff6b35] mb-2" />
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Campaigns</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <Send className="h-5 w-5 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats.sent}</p>
          <p className="text-sm text-gray-600">Sent</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <Users className="h-5 w-5 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats.totalRecipients.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Recipients</p>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <TrendingUp className="h-5 w-5 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{stats.avgOpenRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-600">Avg Open Rate</p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold">Recent Campaigns</h2>
          <Button size="sm">
            <Mail className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No campaigns yet
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Campaign</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Recipients</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Open Rate</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{campaign.name}</p>
                  </td>
                  <td className="px-4 py-3">
                    <CampaignStatus status={campaign.status} />
                  </td>
                  <td className="px-4 py-3">
                    {campaign.recipients.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {campaign.status === 'sent' 
                      ? `${((campaign.opened / campaign.recipients) * 100).toFixed(1)}%`
                      : '-'
                    }
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {campaign.sentAt || campaign.scheduledAt || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function CampaignStatus({ status }: { status: string }) {
  const styles = {
    draft: 'bg-gray-100 text-gray-700',
    scheduled: 'bg-blue-100 text-blue-700',
    sending: 'bg-yellow-100 text-yellow-700',
    sent: 'bg-green-100 text-green-700'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Email Campaign Creator
interface CampaignCreatorProps {
  templates: EmailTemplate[];
  segments: Array<{ id: string; name: string; count: number }>;
  onSend: (data: any) => Promise<void>;
}

export function EmailCampaignCreator({ templates, segments, onSend }: CampaignCreatorProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    templateId: '',
    subject: '',
    previewText: '',
    segmentId: 'all',
    scheduleType: 'now' as 'now' | 'scheduled',
    scheduledDate: '',
    scheduledTime: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSend(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              s <= step ? 'bg-[#ff6b35] text-white' : 'bg-gray-200'
            }`}>
              {s < step ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-[#ff6b35]' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Campaign Details</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Campaign Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Summer Sale Announcement"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email Template</label>
            <select
              value={formData.templateId}
              onChange={(e) => {
                const template = templates.find(t => t.id === e.target.value);
                setFormData({ 
                  ...formData, 
                  templateId: e.target.value,
                  subject: template?.subject || '',
                  previewText: template?.previewText || ''
                });
              }}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select a template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subject Line</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Don't miss our biggest sale!"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preview Text</label>
            <input
              type="text"
              value={formData.previewText}
              onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
              placeholder="Up to 50% off selected items"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Step 2: Audience */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Select Audience</h2>
          
          <div className="space-y-2">
            <button
              onClick={() => setFormData({ ...formData, segmentId: 'all' })}
              className={`w-full p-4 border rounded-lg text-left ${
                formData.segmentId === 'all' ? 'border-[#ff6b35] bg-orange-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">All Subscribers</p>
                  <p className="text-sm text-gray-500">Send to everyone</p>
                </div>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
            </button>

            {segments.map((segment) => (
              <button
                key={segment.id}
                onClick={() => setFormData({ ...formData, segmentId: segment.id })}
                className={`w-full p-4 border rounded-lg text-left ${
                  formData.segmentId === segment.id ? 'border-[#ff6b35] bg-orange-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{segment.name}</p>
                    <p className="text-sm text-gray-500">{segment.count.toLocaleString()} subscribers</p>
                  </div>
                  {formData.segmentId === segment.id && <Check className="h-5 w-5 text-[#ff6b35]" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Schedule */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Schedule Send</h2>
          
          <div className="space-y-2">
            <button
              onClick={() => setFormData({ ...formData, scheduleType: 'now' })}
              className={`w-full p-4 border rounded-lg text-left ${
                formData.scheduleType === 'now' ? 'border-[#ff6b35] bg-orange-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5 text-[#ff6b35]" />
                <div>
                  <p className="font-medium">Send Now</p>
                  <p className="text-sm text-gray-500">Deliver immediately</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setFormData({ ...formData, scheduleType: 'scheduled' })}
              className={`w-full p-4 border rounded-lg text-left ${
                formData.scheduleType === 'scheduled' ? 'border-[#ff6b35] bg-orange-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#ff6b35]" />
                <div>
                  <p className="font-medium">Schedule</p>
                  <p className="text-sm text-gray-500">Choose date and time</p>
                </div>
              </div>
            </button>
          </div>

          {formData.scheduleType === 'scheduled' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(s => s - 1)}>
            Back
          </Button>
        )}
        <Button
          onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()}
          disabled={loading}
          className="flex-1"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {step < 3 ? 'Continue' : formData.scheduleType === 'now' ? 'Send Now' : 'Schedule'}
        </Button>
      </div>
    </div>
  );
}
