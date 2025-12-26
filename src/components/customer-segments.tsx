'use client';

import { useState } from 'react';
import { Users, Crown, Sparkles, AlertTriangle, Heart, TrendingUp, Moon, Plus, X, Search } from 'lucide-react';

const SEGMENT_ICONS: Record<string, any> = {
  users: Users,
  crown: Crown,
  sparkles: Sparkles,
  'alert-triangle': AlertTriangle,
  heart: Heart,
  'trending-up': TrendingUp,
  moon: Moon,
};

interface Segment {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  customer_count: number;
  is_automatic: boolean;
}

// Mock segments
const mockSegments: Segment[] = [
  { id: '1', name: 'VIP', description: '5+ orders or R5000+ spend', color: '#f59e0b', icon: 'crown', customer_count: 45, is_automatic: true },
  { id: '2', name: 'New', description: 'Joined in last 30 days', color: '#22c55e', icon: 'sparkles', customer_count: 128, is_automatic: true },
  { id: '3', name: 'At Risk', description: 'No orders in 60+ days', color: '#ef4444', icon: 'alert-triangle', customer_count: 67, is_automatic: true },
  { id: '4', name: 'Loyal', description: '3+ orders', color: '#3b82f6', icon: 'heart', customer_count: 234, is_automatic: true },
  { id: '5', name: 'Big Spenders', description: 'R2000+ single order', color: '#8b5cf6', icon: 'trending-up', customer_count: 23, is_automatic: true },
  { id: '6', name: 'Inactive', description: 'No orders in 90+ days', color: '#6b7280', icon: 'moon', customer_count: 156, is_automatic: true },
];

export function CustomerSegmentsAdmin() {
  const [segments, setSegments] = useState(mockSegments);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customer Segments</h1>
        <button className="flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          <Plus className="h-5 w-5" /> New Segment
        </button>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {segments.map((segment) => {
          const Icon = SEGMENT_ICONS[segment.icon] || Users;
          return (
            <button
              key={segment.id}
              onClick={() => setSelectedSegment(segment)}
              className={`bg-white rounded-xl border p-4 text-left hover:shadow-md transition ${
                selectedSegment?.id === segment.id ? 'ring-2 ring-[#ff6b35]' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${segment.color}20` }}>
                  <Icon className="h-5 w-5" style={{ color: segment.color }} />
                </div>
                <div>
                  <h3 className="font-bold">{segment.name}</h3>
                  {segment.is_automatic && (
                    <span className="text-xs text-gray-400">Auto</span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">{segment.description}</p>
              <p className="text-2xl font-bold" style={{ color: segment.color }}>
                {segment.customer_count.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">customers</p>
            </button>
          );
        })}
      </div>

      {/* Segment Detail Panel */}
      {selectedSegment && (
        <SegmentDetailPanel 
          segment={selectedSegment} 
          onClose={() => setSelectedSegment(null)} 
        />
      )}
    </div>
  );
}

function SegmentDetailPanel({ segment, onClose }: { segment: Segment; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const Icon = SEGMENT_ICONS[segment.icon] || Users;

  // Mock customers
  const customers = [
    { email: 'john@example.com', name: 'John Smith', orders: 7, spend: 8500 },
    { email: 'jane@example.com', name: 'Jane Doe', orders: 5, spend: 6200 },
    { email: 'bob@example.com', name: 'Bob Wilson', orders: 12, spend: 15000 },
  ];

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ backgroundColor: `${segment.color}10` }}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${segment.color}20` }}>
            <Icon className="h-6 w-6" style={{ color: segment.color }} />
          </div>
          <div>
            <h2 className="text-xl font-bold">{segment.name}</h2>
            <p className="text-sm text-gray-600">{segment.customer_count} customers</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Actions */}
      <div className="p-4 border-b flex flex-wrap gap-2">
        <button className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg text-sm font-medium hover:bg-orange-600">
          Send Email Campaign
        </button>
        <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
          Export List
        </button>
        <button className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
          Create Discount
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="max-h-80 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Customer</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Orders</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Total Spend</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers.map((customer) => (
              <tr key={customer.email} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </td>
                <td className="px-4 py-3 text-center">{customer.orders}</td>
                <td className="px-4 py-3 text-right font-medium">R{(customer.spend / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Segment badge for customer profile
export function SegmentBadge({ name, color, icon }: { name: string; color: string; icon: string }) {
  const Icon = SEGMENT_ICONS[icon] || Users;
  return (
    <span 
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      <Icon className="h-3 w-3" />
      {name}
    </span>
  );
}
