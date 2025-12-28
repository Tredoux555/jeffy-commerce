'use client';

import { useState } from 'react';
import { Users, Tag, Plus, X, Search, Crown, Star, AlertTriangle, Heart, Sparkles, Building } from 'lucide-react';

// Segment type
interface Segment {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  is_auto: boolean;
  member_count?: number;
}

// Default segments with icons
const segmentIcons: Record<string, any> = {
  'vip': Crown,
  'new': Sparkles,
  'at-risk': AlertTriangle,
  'loyal': Heart,
  'big-spender': Star,
  'wholesale': Building,
};

// Mock segments for demo
const mockSegments: Segment[] = [
  { id: '1', name: 'VIP', slug: 'vip', description: 'High-value customers', color: '#eab308', is_auto: true, member_count: 45 },
  { id: '2', name: 'New', slug: 'new', description: 'Recent signups', color: '#22c55e', is_auto: true, member_count: 128 },
  { id: '3', name: 'At Risk', slug: 'at-risk', description: 'Inactive 60+ days', color: '#ef4444', is_auto: true, member_count: 23 },
  { id: '4', name: 'Loyal', slug: 'loyal', description: '3+ orders', color: '#3b82f6', is_auto: true, member_count: 89 },
  { id: '5', name: 'Big Spender', slug: 'big-spender', description: 'Avg order R1000+', color: '#8b5cf6', is_auto: true, member_count: 31 },
  { id: '6', name: 'Wholesale', slug: 'wholesale', description: 'Business buyers', color: '#f97316', is_auto: false, member_count: 12 },
];

// Segment badge component
export function SegmentBadge({ segment }: { segment: Segment }) {
  const Icon = segmentIcons[segment.slug] || Tag;
  
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${segment.color}20`, color: segment.color }}
    >
      <Icon className="h-3 w-3" />
      {segment.name}
    </span>
  );
}

// Multiple segment badges
export function CustomerSegments({ segments }: { segments: Segment[] }) {
  if (segments.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1">
      {segments.map(segment => (
        <SegmentBadge key={segment.id} segment={segment} />
      ))}
    </div>
  );
}

// Admin segments management page
export function SegmentsManager() {
  const [segments, setSegments] = useState(mockSegments);
  const [search, setSearch] = useState('');

  const filtered = segments.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-gray-400" />
          Customer Segments
        </h1>
        <button className="flex items-center gap-2 bg-[#ff6b35] text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          <Plus className="h-5 w-5" /> New Segment
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search segments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg"
        />
      </div>

      {/* Segments Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(segment => {
          const Icon = segmentIcons[segment.slug] || Tag;
          return (
            <div key={segment.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${segment.color}20` }}
                  >
                    <Icon className="h-5 w-5" style={{ color: segment.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold">{segment.name}</h3>
                    <p className="text-sm text-gray-500">{segment.description}</p>
                  </div>
                </div>
                {segment.is_auto && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Auto</span>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t">
                <span className="text-2xl font-bold">{segment.member_count}</span>
                <span className="text-sm text-gray-500">customers</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Customer segment selector for admin
export function SegmentSelector({ 
  selectedIds, 
  onChange,
  segments = mockSegments,
}: { 
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  segments?: Segment[];
}) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Customer Segments</label>
      <div className="flex flex-wrap gap-2">
        {segments.filter(s => !s.is_auto).map(segment => {
          const isSelected = selectedIds.includes(segment.id);
          const Icon = segmentIcons[segment.slug] || Tag;
          
          return (
            <button
              key={segment.id}
              onClick={() => toggle(segment.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition ${
                isSelected 
                  ? 'border-transparent text-white' 
                  : 'bg-white hover:bg-gray-50'
              }`}
              style={isSelected ? { backgroundColor: segment.color } : {}}
            >
              <Icon className="h-4 w-4" />
              {segment.name}
              {isSelected && <X className="h-3 w-3 ml-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
