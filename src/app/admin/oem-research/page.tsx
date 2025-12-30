'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Factory, ExternalLink, ChevronDown, ChevronUp, Eye, Trash2, Save, X, FileText, Tag, DollarSign, Globe, Package, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface OEMResearch {
  id: string;
  product_name: string;
  brand_name: string | null;
  product_category: string | null;
  factory_name: string | null;
  factory_location: string | null;
  factory_certifications: string[] | null;
  factory_moq: number | null;
  factory_lead_time: string | null;
  alibaba_link: string | null;
  link_1688: string | null;
  factory_website: string | null;
  other_links: { url: string; description: string }[] | null;
  retail_price_usd: number | null;
  oem_price_usd: number | null;
  oem_price_rmb: number | null;
  price_tier_info: Record<string, number> | null;
  raw_research: string | null;
  key_findings: string[] | null;
  quality_notes: string | null;
  competition_analysis: string | null;
  market_demand_notes: string | null;
  verified: boolean;
  verification_notes: string | null;
  research_status: 'draft' | 'verified' | 'sourcing' | 'rejected' | 'active';
  priority: number;
  images: string[] | null;
  documents: { url: string; name: string; type: string }[] | null;
  source: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  verified: 'bg-blue-100 text-blue-800',
  sourcing: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
  active: 'bg-green-100 text-green-800',
};

export default function OEMResearchPage() {
  const [research, setResearch] = useState<OEMResearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state for new research
  const [formData, setFormData] = useState({
    product_name: '',
    brand_name: '',
    product_category: '',
    factory_name: '',
    factory_location: '',
    factory_certifications: '',
    factory_moq: '',
    factory_lead_time: '',
    alibaba_link: '',
    link_1688: '',
    factory_website: '',
    retail_price_usd: '',
    oem_price_usd: '',
    oem_price_rmb: '',
    raw_research: '',
    key_findings: '',
    quality_notes: '',
    competition_analysis: '',
    market_demand_notes: '',
    source: '',
    tags: '',
    priority: '0',
    research_status: 'draft' as const,
  });

  useEffect(() => {
    fetchResearch();
  }, [statusFilter, searchTerm]);

  const fetchResearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const res = await fetch(`/api/admin/oem-research?${params}`);
      const json = await res.json();
      setResearch(json.data || []);
    } catch (error) {
      console.error('Error fetching research:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const payload = {
        product_name: formData.product_name,
        brand_name: formData.brand_name || null,
        product_category: formData.product_category || null,
        factory_name: formData.factory_name || null,
        factory_location: formData.factory_location || null,
        factory_certifications: formData.factory_certifications ? formData.factory_certifications.split(',').map(s => s.trim()) : null,
        factory_moq: formData.factory_moq ? parseInt(formData.factory_moq) : null,
        factory_lead_time: formData.factory_lead_time || null,
        alibaba_link: formData.alibaba_link || null,
        link_1688: formData.link_1688 || null,
        factory_website: formData.factory_website || null,
        retail_price_usd: formData.retail_price_usd ? parseFloat(formData.retail_price_usd) : null,
        oem_price_usd: formData.oem_price_usd ? parseFloat(formData.oem_price_usd) : null,
        oem_price_rmb: formData.oem_price_rmb ? parseFloat(formData.oem_price_rmb) : null,
        raw_research: formData.raw_research || null,
        key_findings: formData.key_findings ? formData.key_findings.split('\n').filter(s => s.trim()) : null,
        quality_notes: formData.quality_notes || null,
        competition_analysis: formData.competition_analysis || null,
        market_demand_notes: formData.market_demand_notes || null,
        source: formData.source || null,
        tags: formData.tags ? formData.tags.split(',').map(s => s.trim()) : null,
        priority: parseInt(formData.priority) || 0,
        research_status: formData.research_status,
      };
      
      const res = await fetch('/api/admin/oem-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setShowAddForm(false);
        setFormData({
          product_name: '',
          brand_name: '',
          product_category: '',
          factory_name: '',
          factory_location: '',
          factory_certifications: '',
          factory_moq: '',
          factory_lead_time: '',
          alibaba_link: '',
          link_1688: '',
          factory_website: '',
          retail_price_usd: '',
          oem_price_usd: '',
          oem_price_rmb: '',
          raw_research: '',
          key_findings: '',
          quality_notes: '',
          competition_analysis: '',
          market_demand_notes: '',
          source: '',
          tags: '',
          priority: '0',
          research_status: 'draft',
        });
        fetchResearch();
      }
    } catch (error) {
      console.error('Error saving research:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this research entry?')) return;
    
    try {
      await fetch(`/api/admin/oem-research?id=${id}`, { method: 'DELETE' });
      fetchResearch();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/admin/oem-research', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, research_status: newStatus }),
      });
      fetchResearch();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Factory className="h-7 w-7 text-jeffy-orange" />
            OEM Research Database
          </h1>
          <p className="text-gray-600 mt-1">Deep dive research on best-selling products and their OEM factories</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/oem-research/analyzer"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
          >
            <Sparkles className="h-5 w-5" />
            Research → 1688 Links
          </Link>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-jeffy-orange text-white rounded-lg hover:bg-orange-600 transition"
          >
            <Plus className="h-5 w-5" />
            Add Research
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, brands, research..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="verified">Verified</option>
          <option value="sourcing">Sourcing</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {['draft', 'verified', 'sourcing', 'active', 'rejected'].map((status) => {
          const count = research.filter(r => r.research_status === status).length;
          return (
            <div key={status} className="bg-white rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className={`text-sm capitalize ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]} px-2 py-1 rounded-full inline-block mt-1`}>
                {status}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Add New Research</h2>
              <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Product Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.product_name}
                      onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                      placeholder="e.g., Stanley Quencher Tumbler"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={formData.brand_name}
                      onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                      placeholder="e.g., Stanley"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.product_category}
                      onChange={(e) => setFormData({...formData, product_category: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                      placeholder="e.g., Drinkware"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority (0-10)</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                    />
                  </div>
                </div>
              </div>

              {/* Factory Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Factory / OEM Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Factory Name</label>
                    <input
                      type="text"
                      value={formData.factory_name}
                      onChange={(e) => setFormData({...formData, factory_name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Factory Location</label>
                    <input
                      type="text"
                      value={formData.factory_location}
                      onChange={(e) => setFormData({...formData, factory_location: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                      placeholder="e.g., Yongkang, Zhejiang, China"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certifications (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.factory_certifications}
                      onChange={(e) => setFormData({...formData, factory_certifications: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                      placeholder="ISO9001, FDA, LFGB, CE"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MOQ</label>
                    <input
                      type="number"
                      value={formData.factory_moq}
                      onChange={(e) => setFormData({...formData, factory_moq: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time</label>
                    <input
                      type="text"
                      value={formData.factory_lead_time}
                      onChange={(e) => setFormData({...formData, factory_lead_time: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                      placeholder="e.g., 15-20 days"
                    />
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Sourcing Links
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">1688 Link</label>
                    <input
                      type="url"
                      value={formData.link_1688}
                      onChange={(e) => setFormData({...formData, link_1688: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                      placeholder="https://detail.1688.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alibaba Link</label>
                    <input
                      type="url"
                      value={formData.alibaba_link}
                      onChange={(e) => setFormData({...formData, alibaba_link: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Factory Website</label>
                    <input
                      type="url"
                      value={formData.factory_website}
                      onChange={(e) => setFormData({...formData, factory_website: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pricing
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.retail_price_usd}
                      onChange={(e) => setFormData({...formData, retail_price_usd: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                      placeholder="45.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OEM Price (USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.oem_price_usd}
                      onChange={(e) => setFormData({...formData, oem_price_usd: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                      placeholder="8.50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OEM Price (RMB)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.oem_price_rmb}
                      onChange={(e) => setFormData({...formData, oem_price_rmb: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                      placeholder="60.00"
                    />
                  </div>
                </div>
              </div>

              {/* Research Content */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Research Content
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raw Research (paste all your deep dive notes here)
                  </label>
                  <textarea
                    value={formData.raw_research}
                    onChange={(e) => setFormData({...formData, raw_research: e.target.value})}
                    rows={10}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange font-mono text-sm"
                    placeholder="Paste all your research notes, findings, links, screenshots text, etc. Claude will be able to read through all of this..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Key Findings (one per line)
                  </label>
                  <textarea
                    value={formData.key_findings}
                    onChange={(e) => setFormData({...formData, key_findings: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                    placeholder="Finding 1&#10;Finding 2&#10;Finding 3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quality Notes</label>
                    <textarea
                      value={formData.quality_notes}
                      onChange={(e) => setFormData({...formData, quality_notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Competition Analysis</label>
                    <textarea
                      value={formData.competition_analysis}
                      onChange={(e) => setFormData({...formData, competition_analysis: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Market Demand Notes</label>
                  <textarea
                    value={formData.market_demand_notes}
                    onChange={(e) => setFormData({...formData, market_demand_notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                  />
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Metadata
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                      placeholder="e.g., TikTok research, Reddit, YouTube"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                      placeholder="viral, drinkware, trending"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.research_status}
                      onChange={(e) => setFormData({...formData, research_status: e.target.value as typeof formData.research_status})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-jeffy-orange"
                    >
                      <option value="draft">Draft</option>
                      <option value="verified">Verified</option>
                      <option value="sourcing">Sourcing</option>
                      <option value="active">Active</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-jeffy-orange text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />
                  {saving ? 'Saving...' : 'Save Research'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Research List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jeffy-orange mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading research...</p>
          </div>
        ) : research.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <Factory className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No research found</h3>
            <p className="text-gray-500 mt-1">Start by adding your first deep dive research</p>
          </div>
        ) : (
          research.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border overflow-hidden">
              {/* Header Row */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-jeffy-orange/10 rounded-lg flex items-center justify-center">
                    <Factory className="h-5 w-5 text-jeffy-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      {item.brand_name && <span>{item.brand_name}</span>}
                      {item.factory_name && <span>• {item.factory_name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.oem_price_usd && item.retail_price_usd && (
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Margin</div>
                      <div className="font-semibold text-green-600">
                        {Math.round((1 - item.oem_price_usd / item.retail_price_usd) * 100)}%
                      </div>
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.research_status]}`}>
                    {item.research_status}
                  </span>
                  {expandedId === item.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === item.id && (
                <div className="border-t px-4 py-6 space-y-6">
                  {/* Quick Actions */}
                  <div className="flex gap-2">
                    {item.link_1688 && (
                      <a
                        href={item.link_1688}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                        1688
                      </a>
                    )}
                    {item.alibaba_link && (
                      <a
                        href={item.alibaba_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm hover:bg-orange-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Alibaba
                      </a>
                    )}
                    <select
                      value={item.research_status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="px-3 py-1 border rounded text-sm"
                    >
                      <option value="draft">Draft</option>
                      <option value="verified">Verified</option>
                      <option value="sourcing">Sourcing</option>
                      <option value="active">Active</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 ml-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Retail Price</div>
                      <div className="font-semibold">${item.retail_price_usd || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">OEM Price</div>
                      <div className="font-semibold">${item.oem_price_usd || 'N/A'} / ¥{item.oem_price_rmb || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">MOQ</div>
                      <div className="font-semibold">{item.factory_moq || 'N/A'} units</div>
                    </div>
                  </div>

                  {/* Factory Info */}
                  {item.factory_name && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Factory Details</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p><strong>Name:</strong> {item.factory_name}</p>
                        <p><strong>Location:</strong> {item.factory_location || 'N/A'}</p>
                        <p><strong>Lead Time:</strong> {item.factory_lead_time || 'N/A'}</p>
                        {item.factory_certifications && (
                          <div className="flex gap-2 flex-wrap">
                            <strong>Certs:</strong>
                            {item.factory_certifications.map((cert, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                {cert}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Findings */}
                  {item.key_findings && item.key_findings.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Key Findings</h4>
                      <ul className="bg-green-50 p-4 rounded-lg space-y-2">
                        {item.key_findings.map((finding, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-600">✓</span>
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Raw Research */}
                  {item.raw_research && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Raw Research Notes</h4>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                        {item.raw_research}
                      </pre>
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {item.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-400 pt-2 border-t">
                    Created: {new Date(item.created_at).toLocaleDateString()} • 
                    Updated: {new Date(item.updated_at).toLocaleDateString()} •
                    Source: {item.source || 'N/A'}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
