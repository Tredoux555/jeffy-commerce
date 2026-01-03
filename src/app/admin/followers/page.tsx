'use client';

import { useState, useEffect } from 'react';
import { Users, Loader2, Phone, Mail, Calendar, Tag, Download, RefreshCw, Filter, Plus, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Follower {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  source: string;
  interests: string[];
  status: string;
  notes: string | null;
  created_at: string;
}

export default function FollowersPage() {
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [stats, setStats] = useState({ total: 0, hustle: 0, website: 0, whatsapp: 0 });

  useEffect(() => {
    loadFollowers();
  }, []);

  const loadFollowers = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('followers')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (data) {
      setFollowers(data);
      
      // Calculate stats
      setStats({
        total: data.length,
        hustle: data.filter(f => f.source === 'hustle').length,
        website: data.filter(f => f.source === 'website').length,
        whatsapp: data.filter(f => f.source === 'whatsapp').length
      });
    }

    setLoading(false);
  };

  const filteredFollowers = filter === 'all' 
    ? followers 
    : followers.filter(f => f.source === filter);

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Source', 'Interests', 'Joined'];
    const rows = followers.map(f => [
      f.name || '',
      f.phone,
      f.email || '',
      f.source,
      (f.interests || []).join('; '),
      new Date(f.created_at).toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jeffy-followers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatPhone = (phone: string) => {
    // Format +27738439496 → 073 843 9496
    if (phone.startsWith('+27')) {
      const num = '0' + phone.substring(3);
      return num.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-jeffy-orange" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-7 w-7 text-jeffy-orange" />
            Followers
          </h1>
          <p className="text-gray-600 mt-1">
            People who want to hear from you
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadFollowers}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-jeffy-orange text-white rounded-lg hover:bg-jeffy-orange/90 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Tag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">From Hustle</p>
              <p className="text-2xl font-bold">{stats.hustle}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Tag className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">From Website</p>
              <p className="text-2xl font-bold">{stats.website}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">From WhatsApp</p>
              <p className="text-2xl font-bold">{stats.whatsapp}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['all', 'hustle', 'website', 'whatsapp'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f
                ? 'bg-jeffy-orange text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Followers List */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {filteredFollowers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No followers yet</p>
            <p className="text-sm mt-1">Share your /hustle page to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Phone</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Source</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Interests</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Joined</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredFollowers.map(follower => (
                <tr key={follower.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {follower.name || <span className="text-gray-400">No name</span>}
                    </div>
                    {follower.email && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {follower.email}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="font-mono text-sm">{formatPhone(follower.phone)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      follower.source === 'hustle' 
                        ? 'bg-green-100 text-green-700'
                        : follower.source === 'whatsapp'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {follower.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(follower.interests || []).map((interest, i) => (
                        <span 
                          key={i}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(follower.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`https://wa.me/${follower.phone.replace('+', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      WhatsApp →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Tip */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-800 mb-1">💡 Tip: Add manual followers</h4>
        <p className="text-sm text-blue-600">
          When someone WhatsApps you directly, add them here by calling the API:
        </p>
        <code className="block mt-2 p-2 bg-blue-100 rounded text-xs text-blue-800">
          POST /api/followers {`{ "phone": "0738439496", "name": "John", "source": "whatsapp" }`}
        </code>
      </div>
    </div>
  );
}
