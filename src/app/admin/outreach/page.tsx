'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Mail, Send, CheckCircle, Clock, MessageSquare, Calendar,
  UserPlus, Search, Filter, ExternalLink, Phone, Instagram,
  Youtube, Linkedin, Twitter, XCircle, Star, TrendingUp
} from 'lucide-react';

interface Influencer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  platform: string | null;
  handle: string | null;
  followers: number | null;
  category: string | null;
  priority: string;
  notes: string | null;
  profile_url: string | null;
  outreach_contacts?: OutreachContact[];
}

interface OutreachContact {
  id: string;
  influencer_id: string;
  status: string;
  pitch_type: string;
  sent_at: string | null;
  replied_at: string | null;
  meeting_at: string | null;
  outcome: string | null;
  follow_up_date: string | null;
  notes: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  not_contacted: { label: 'Not Contacted', color: 'bg-gray-100 text-gray-700', icon: <Clock className="w-4 h-4" /> },
  email_sent: { label: 'Email Sent', color: 'bg-blue-100 text-blue-700', icon: <Send className="w-4 h-4" /> },
  opened: { label: 'Opened', color: 'bg-yellow-100 text-yellow-700', icon: <Mail className="w-4 h-4" /> },
  replied: { label: 'Replied', color: 'bg-green-100 text-green-700', icon: <MessageSquare className="w-4 h-4" /> },
  meeting_scheduled: { label: 'Meeting Set', color: 'bg-purple-100 text-purple-700', icon: <Calendar className="w-4 h-4" /> },
  converted: { label: 'Converted! 🎉', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-4 h-4" /> },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
  no_response: { label: 'No Response', color: 'bg-orange-100 text-orange-700', icon: <Clock className="w-4 h-4" /> },
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="w-4 h-4 text-pink-500" />,
  YouTube: <Youtube className="w-4 h-4 text-red-500" />,
  LinkedIn: <Linkedin className="w-4 h-4 text-blue-600" />,
  Twitter: <Twitter className="w-4 h-4 text-sky-500" />,
};

const EMAIL_TEMPLATE = {
  subject: "Partnership Opportunity - Jeffy Commerce | Building Free Schools Through E-Commerce",
  body: `Hi [NAME],

I hope this message finds you well. My name is Tredoux, and I'm the founder of Jeffy Commerce.

I've been following your work in [AREA] and deeply admire your commitment to [SPECIFIC_THING].

Jeffy Commerce is more than just an e-commerce platform - we're building a movement. Our mission is simple but audacious: use commerce to fund FREE SCHOOLS across South Africa.

Here's our model:
• Zone Partners run local delivery operations with 50/50 profit sharing
• All profits beyond operational costs fund merit-based schools
• Graduates receive 1 hectare of land, skills training, and production facilities
• We're creating self-sufficient communities that can manufacture food, tech, medicine, and clothing

We're looking for founding partners who share our vision of making South Africans the most capable people on the planet.

I'd love 15 minutes of your time to share our vision and explore how we might work together.

Would you be open to a brief call this week?

Warm regards,
Tredoux Willemse
Founder, Jeffy Commerce
www.jeffy.co.za

P.S. - "We plant trees under whose shade we'll never sit." This isn't about us - it's about the generations that follow.`
};

export default function OutreachPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    const { data, error } = await supabase
      .from('influencers')
      .select(`
        *,
        outreach_contacts (*)
      `)
      .order('priority', { ascending: true })
      .order('name');
    
    if (data) {
      setInfluencers(data);
    }
    setLoading(false);
  };

  const getLatestContact = (influencer: Influencer): OutreachContact | null => {
    if (!influencer.outreach_contacts || influencer.outreach_contacts.length === 0) return null;
    return influencer.outreach_contacts.sort((a, b) => 
      new Date(b.sent_at || 0).getTime() - new Date(a.sent_at || 0).getTime()
    )[0];
  };

  const getStatus = (influencer: Influencer): string => {
    const contact = getLatestContact(influencer);
    return contact?.status || 'not_contacted';
  };

  const updateStatus = async (influencerId: string, newStatus: string) => {
    const existing = influencers.find(i => i.id === influencerId);
    const contact = existing ? getLatestContact(existing) : null;

    if (contact) {
      // Update existing contact
      await supabase
        .from('outreach_contacts')
        .update({ 
          status: newStatus,
          ...(newStatus === 'email_sent' && !contact.sent_at ? { sent_at: new Date().toISOString() } : {}),
          ...(newStatus === 'replied' ? { replied_at: new Date().toISOString() } : {}),
        })
        .eq('id', contact.id);
    } else {
      // Create new contact record
      await supabase
        .from('outreach_contacts')
        .insert({
          influencer_id: influencerId,
          status: newStatus,
          ...(newStatus === 'email_sent' ? { sent_at: new Date().toISOString() } : {}),
        });
    }
    
    fetchInfluencers();
  };

  const generateGmailLink = (influencer: Influencer) => {
    if (!influencer.email) return null;
    
    const subject = encodeURIComponent(EMAIL_TEMPLATE.subject);
    const body = encodeURIComponent(
      EMAIL_TEMPLATE.body
        .replace('[NAME]', influencer.name.split(' ')[0])
        .replace('[AREA]', influencer.category || 'your field')
        .replace('[SPECIFIC_THING]', 'empowering South Africans')
    );
    
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${influencer.email}&su=${subject}&body=${body}`;
  };

  const markAsSent = async (influencer: Influencer) => {
    await updateStatus(influencer.id, 'email_sent');
  };

  // Stats
  const stats = {
    total: influencers.length,
    notContacted: influencers.filter(i => getStatus(i) === 'not_contacted').length,
    emailSent: influencers.filter(i => getStatus(i) === 'email_sent').length,
    replied: influencers.filter(i => ['replied', 'meeting_scheduled'].includes(getStatus(i))).length,
    converted: influencers.filter(i => getStatus(i) === 'converted').length,
  };

  // Filtered list
  const filtered = influencers.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category?.toLowerCase().includes(search.toLowerCase()) ||
      i.platform?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || getStatus(i) === filterStatus;
    const matchesPriority = filterPriority === 'all' || i.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return <div className="p-8 text-center">Loading outreach data...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-orange-500" />
            Influencer Outreach
          </h1>
          <p className="text-gray-600">Track and manage your influencer partnerships</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <UserPlus className="w-4 h-4" />
          Add Influencer
        </button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
          <p className="text-sm text-gray-500">Not Contacted</p>
          <p className="text-2xl font-bold text-gray-600">{stats.notContacted}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
          <p className="text-sm text-blue-600">Email Sent</p>
          <p className="text-2xl font-bold text-blue-600">{stats.emailSent}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-green-200">
          <p className="text-sm text-green-600">Replied/Meeting</p>
          <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-2 border-emerald-200">
          <p className="text-sm text-emerald-600">Converted 🎉</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.converted}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search influencers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Priorities</option>
          <option value="high">🔥 High Priority</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Influencer List */}
      <div className="space-y-3">
        {filtered.map((influencer) => {
          const status = getStatus(influencer);
          const statusConfig = STATUS_CONFIG[status];
          const gmailLink = generateGmailLink(influencer);
          const contact = getLatestContact(influencer);

          return (
            <div key={influencer.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                {/* Priority indicator */}
                <div className={`w-2 h-12 rounded-full ${
                  influencer.priority === 'high' ? 'bg-red-500' :
                  influencer.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-300'
                }`} />

                {/* Main info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{influencer.name}</h3>
                    {influencer.priority === 'high' && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                    {PLATFORM_ICONS[influencer.platform || ''] || null}
                    {influencer.handle && (
                      <span className="text-sm text-gray-500">@{influencer.handle}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="capitalize">{influencer.category}</span>
                    {influencer.followers && (
                      <span>{(influencer.followers / 1000).toFixed(0)}K followers</span>
                    )}
                    {influencer.email && <span>{influencer.email}</span>}
                  </div>
                  {influencer.notes && (
                    <p className="text-sm text-gray-600 mt-1">{influencer.notes}</p>
                  )}
                </div>

                {/* Status badge */}
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.color}`}>
                  {statusConfig.icon}
                  <span className="text-sm font-medium">{statusConfig.label}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {influencer.email && status === 'not_contacted' && gmailLink && (
                    <a
                      href={gmailLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markAsSent(influencer)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Send Email
                    </a>
                  )}

                  {!influencer.email && status === 'not_contacted' && (
                    <button
                      onClick={() => setSelectedInfluencer(influencer)}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Email
                    </button>
                  )}

                  {/* Status dropdown */}
                  <select
                    value={status}
                    onChange={(e) => updateStatus(influencer.id, e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>

                  {influencer.profile_url && (
                    <a
                      href={influencer.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Contact history */}
              {contact?.sent_at && (
                <div className="mt-3 pt-3 border-t text-sm text-gray-500">
                  Contacted: {new Date(contact.sent_at).toLocaleDateString()}
                  {contact.replied_at && ` • Replied: ${new Date(contact.replied_at).toLocaleDateString()}`}
                  {contact.notes && ` • ${contact.notes}`}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No influencers found matching your filters.
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddForm || selectedInfluencer) && (
        <InfluencerModal
          influencer={selectedInfluencer}
          onClose={() => {
            setShowAddForm(false);
            setSelectedInfluencer(null);
          }}
          onSave={() => {
            fetchInfluencers();
            setShowAddForm(false);
            setSelectedInfluencer(null);
          }}
        />
      )}
    </div>
  );
}


// Modal component for adding/editing influencers
function InfluencerModal({ 
  influencer, 
  onClose, 
  onSave 
}: { 
  influencer: Influencer | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: influencer?.name || '',
    email: influencer?.email || '',
    phone: influencer?.phone || '',
    platform: influencer?.platform || 'LinkedIn',
    handle: influencer?.handle || '',
    followers: influencer?.followers?.toString() || '',
    category: influencer?.category || '',
    priority: influencer?.priority || 'medium',
    notes: influencer?.notes || '',
    profile_url: influencer?.profile_url || '',
  });
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = {
      ...form,
      followers: form.followers ? parseInt(form.followers) : null,
    };

    if (influencer) {
      await supabase
        .from('influencers')
        .update(data)
        .eq('id', influencer.id);
    } else {
      await supabase
        .from('influencers')
        .insert(data);
    }

    setSaving(false);
    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {influencer ? 'Edit Influencer' : 'Add New Influencer'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="their@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="+27..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="Twitter">Twitter/X</option>
                <option value="TikTok">TikTok</option>
                <option value="Facebook">Facebook</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Handle</label>
              <input
                type="text"
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="@username"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="entrepreneur, lifestyle, etc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Followers</label>
              <input
                type="number"
                value={form.followers}
                onChange={(e) => setForm({ ...form, followers: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="50000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="high">🔥 High - Contact First</option>
              <option value="medium">Medium</option>
              <option value="low">Low - Long Shot</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Profile URL</label>
            <input
              type="url"
              value={form.profile_url}
              onChange={(e) => setForm({ ...form, profile_url: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Why are they a good fit? What do they care about?"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300"
            >
              {saving ? 'Saving...' : influencer ? 'Update' : 'Add Influencer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
