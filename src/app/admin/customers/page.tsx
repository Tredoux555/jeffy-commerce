'use client';

import { useState } from 'react';
import { Users, Crown, Star, AlertTriangle, Heart, DollarSign, Plus, Mail, ChevronRight } from 'lucide-react';

// Mock data
const mockSegments = [
  { id: '1', name: 'VIP', slug: 'vip', icon: '👑', color: '#fbbf24', memberCount: 45, description: 'High-value customers' },
  { id: '2', name: 'New Customers', slug: 'new', icon: '🌟', color: '#22c55e', memberCount: 128, description: 'First-time buyers' },
  { id: '3', name: 'At Risk', slug: 'at-risk', icon: '⚠️', color: '#ef4444', memberCount: 32, description: 'Haven\'t ordered recently' },
  { id: '4', name: 'Loyal', slug: 'loyal', icon: '💜', color: '#8b5cf6', memberCount: 89, description: 'Ordered 3+ times' },
  { id: '5', name: 'Big Spenders', slug: 'big-spenders', icon: '💰', color: '#f97316', memberCount: 23, description: 'R2000+ total spend' },
];

export default function CustomerSegmentsPage() {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customer Segments</h1>
        <button className="flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          <Plus className="h-5 w-5" /> Create Segment
        </button>
      </div>

      {/* Segment Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {mockSegments.map((segment) => (
          <div key={segment.id} onClick={() => setSelectedSegment(segment.id)} className={`bg-white rounded-xl border p-4 cursor-pointer transition hover:shadow-md ${selectedSegment === segment.id ? 'ring-2 ring-[#ff6b35]' : ''}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="text-3xl">{segment.icon}</div>
              <div>
                <h3 className="font-bold">{segment.name}</h3>
                <p className="text-gray-500 text-sm">{segment.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="font-bold">{segment.memberCount}</span>
                <span className="text-gray-500 text-sm">members</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Segment Actions */}
      {selectedSegment && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold mb-4">Segment Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 transition">
              <Mail className="h-6 w-6 text-blue-500" />
              <div className="text-left">
                <p className="font-medium">Send Email</p>
                <p className="text-sm text-gray-500">Email all members</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 transition">
              <DollarSign className="h-6 w-6 text-green-500" />
              <div className="text-left">
                <p className="font-medium">Create Offer</p>
                <p className="text-sm text-gray-500">Exclusive discount</p>
              </div>
            </button>
            <button className="flex items-center gap-3 p-4 border rounded-xl hover:bg-gray-50 transition">
              <Users className="h-6 w-6 text-purple-500" />
              <div className="text-left">
                <p className="font-medium">View Members</p>
                <p className="text-sm text-gray-500">See customer list</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Segment Stats */}
      <div className="mt-6 bg-white rounded-xl border p-6">
        <h2 className="font-bold mb-4">Segment Overview</h2>
        <div className="space-y-3">
          {mockSegments.map((segment) => (
            <div key={segment.id} className="flex items-center gap-3">
              <span className="text-xl">{segment.icon}</span>
              <span className="flex-1 font-medium">{segment.name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, segment.memberCount)}%`, backgroundColor: segment.color }} />
              </div>
              <span className="text-gray-500 w-20 text-right">{segment.memberCount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
