'use client';

import { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Mail, MessageCircle, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Segment {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  customerCount: number;
  isAuto: boolean;
}

const mockSegments: Segment[] = [
  { id: '1', name: 'VIP', slug: 'vip', description: 'High-value customers', color: '#8b5cf6', icon: '⭐', customerCount: 45, isAuto: true },
  { id: '2', name: 'New', slug: 'new', description: 'Signed up in last 30 days', color: '#22c55e', icon: '🆕', customerCount: 128, isAuto: true },
  { id: '3', name: 'At Risk', slug: 'at-risk', description: 'No order in 60+ days', color: '#ef4444', icon: '⚠️', customerCount: 67, isAuto: true },
  { id: '4', name: 'Loyal', slug: 'loyal', description: 'Repeat purchasers', color: '#3b82f6', icon: '💙', customerCount: 89, isAuto: true },
  { id: '5', name: 'Big Spenders', slug: 'big-spenders', description: 'Orders over R2000', color: '#f59e0b', icon: '💰', customerCount: 23, isAuto: true },
];

export function CustomerSegments() {
  const [segments] = useState(mockSegments);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const totalCustomers = segments.reduce((sum, s) => sum + s.customerCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Customer Segments</h2>
          <p className="text-gray-500">{totalCustomers} total customers across {segments.length} segments</p>
        </div>
        <button className="flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          <Plus className="h-5 w-5" /> Create Segment
        </button>
      </div>

      {/* Segments Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((segment) => (
          <div
            key={segment.id}
            onClick={() => setSelectedSegment(segment.id === selectedSegment ? null : segment.id)}
            className={`bg-white rounded-xl border p-5 cursor-pointer transition hover:shadow-lg ${
              selectedSegment === segment.id ? 'ring-2 ring-[#ff6b35]' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{segment.icon}</span>
                <div>
                  <h3 className="font-bold">{segment.name}</h3>
                  <p className="text-sm text-gray-500">{segment.description}</p>
                </div>
              </div>
              {segment.isAuto && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Auto</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold" style={{ color: segment.color }}>{segment.customerCount}</p>
                <p className="text-sm text-gray-500">customers</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg" title="Send Email">
                  <Mail className="h-4 w-4 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg" title="Send SMS">
                  <MessageCircle className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Progress bar showing % of total */}
            <div className="mt-4">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(segment.customerCount / totalCustomers) * 100}%`, backgroundColor: segment.color }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{((segment.customerCount / totalCustomers) * 100).toFixed(1)}% of customers</p>
            </div>
          </div>
        ))}
      </div>

      {/* Segment Actions */}
      {selectedSegment && (
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4">Actions for "{segments.find(s => s.id === selectedSegment)?.name}"</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ActionButton icon={Mail} label="Email Campaign" color="bg-blue-500" />
            <ActionButton icon={MessageCircle} label="SMS Blast" color="bg-green-500" />
            <ActionButton icon={Filter} label="Export List" color="bg-purple-500" />
            <ActionButton icon={Edit2} label="Edit Segment" color="bg-gray-500" />
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <button className={`${color} text-white p-4 rounded-xl flex flex-col items-center gap-2 hover:opacity-90 transition`}>
      <Icon className="h-6 w-6" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
