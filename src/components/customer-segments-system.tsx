'use client';

import { useState } from 'react';
import { Users, Crown, AlertTriangle, Heart, Package, Plus, X, Search, Tag } from 'lucide-react';

interface Segment {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  memberCount: number;
  isAuto: boolean;
}

interface Customer {
  email: string;
  name: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  segments: string[];
}

// Segment badge component
export function SegmentBadge({ segment }: { segment: { name: string; color: string; icon: string } }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${segment.color}20`, color: segment.color }}
    >
      <span>{segment.icon}</span>
      {segment.name}
    </span>
  );
}

// Multiple segments display
export function CustomerSegments({ segments }: { segments: Array<{ name: string; color: string; icon: string }> }) {
  if (segments.length === 0) return <span className="text-gray-400 text-sm">No segments</span>;
  
  return (
    <div className="flex flex-wrap gap-1">
      {segments.map((segment, idx) => (
        <SegmentBadge key={idx} segment={segment} />
      ))}
    </div>
  );
}

// Admin segments management page
export function SegmentManager() {
  const [segments, setSegments] = useState<Segment[]>([
    { id: '1', name: 'VIP', slug: 'vip', description: 'Top spending customers', color: '#eab308', icon: '👑', memberCount: 24, isAuto: false },
    { id: '2', name: 'New Customer', slug: 'new', description: 'Signed up in last 30 days', color: '#22c55e', icon: '🆕', memberCount: 156, isAuto: true },
    { id: '3', name: 'At Risk', slug: 'at-risk', description: 'No purchase in 60+ days', color: '#ef4444', icon: '⚠️', memberCount: 43, isAuto: true },
    { id: '4', name: 'Loyal', slug: 'loyal', description: '5+ orders completed', color: '#3b82f6', icon: '💙', memberCount: 89, isAuto: true },
    { id: '5', name: 'Wholesale', slug: 'wholesale', description: 'Bulk buyers and resellers', color: '#8b5cf6', icon: '📦', memberCount: 12, isAuto: false },
  ]);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customer Segments</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-lg hover:bg-orange-600"
        >
          <Plus className="h-5 w-5" /> New Segment
        </button>
      </div>

      {/* Segment Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((segment) => (
          <div key={segment.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{segment.icon}</span>
                <div>
                  <h3 className="font-bold">{segment.name}</h3>
                  <p className="text-sm text-gray-500">{segment.description}</p>
                </div>
              </div>
              <span
                className="px-2 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: `${segment.color}20`, color: segment.color }}
              >
                {segment.isAuto ? 'Auto' : 'Manual'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="h-4 w-4" />
                <span className="font-medium">{segment.memberCount}</span>
                <span className="text-sm">customers</span>
              </div>
              <button className="text-[#ff6b35] text-sm font-medium hover:underline">
                View Members →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add customer to segment
export function AddToSegmentButton({ 
  customerEmail, 
  currentSegments,
  availableSegments,
  onAdd 
}: { 
  customerEmail: string;
  currentSegments: string[];
  availableSegments: Segment[];
  onAdd: (segmentId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const unassigned = availableSegments.filter(s => !currentSegments.includes(s.id) && !s.isAuto);

  if (unassigned.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-sm text-[#ff6b35] hover:underline"
      >
        <Tag className="h-4 w-4" /> Add Segment
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50 py-1">
            {unassigned.map((segment) => (
              <button
                key={segment.id}
                onClick={() => { onAdd(segment.id); setIsOpen(false); }}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
              >
                <span>{segment.icon}</span>
                {segment.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Customer list with segment filtering
export function CustomerListWithSegments() {
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const segments = [
    { id: 'vip', name: 'VIP', icon: '👑', color: '#eab308' },
    { id: 'new', name: 'New', icon: '🆕', color: '#22c55e' },
    { id: 'at-risk', name: 'At Risk', icon: '⚠️', color: '#ef4444' },
    { id: 'loyal', name: 'Loyal', icon: '💙', color: '#3b82f6' },
  ];

  const mockCustomers: Customer[] = [
    { email: 'john@example.com', name: 'John Doe', totalOrders: 12, totalSpent: 4500, lastOrderDate: '2024-12-20', segments: ['vip', 'loyal'] },
    { email: 'jane@example.com', name: 'Jane Smith', totalOrders: 1, totalSpent: 350, lastOrderDate: '2024-12-25', segments: ['new'] },
    { email: 'bob@example.com', name: 'Bob Wilson', totalOrders: 3, totalSpent: 890, lastOrderDate: '2024-10-15', segments: ['at-risk'] },
  ];

  const filtered = mockCustomers.filter(c => {
    if (filter !== 'all' && !c.segments.includes(filter)) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
          >
            All
          </button>
          {segments.map((seg) => (
            <button
              key={seg.id}
              onClick={() => setFilter(seg.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap flex items-center gap-1 ${filter === seg.id ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
            >
              {seg.icon} {seg.name}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Table */}
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Customer</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Segments</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Orders</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Total Spent</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.map((customer) => (
            <tr key={customer.email} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.email}</p>
              </td>
              <td className="px-4 py-3">
                <CustomerSegments 
                  segments={customer.segments.map(id => segments.find(s => s.id === id)!).filter(Boolean)} 
                />
              </td>
              <td className="px-4 py-3 text-right">{customer.totalOrders}</td>
              <td className="px-4 py-3 text-right font-medium">R{customer.totalSpent.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
