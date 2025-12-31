'use client';

import { useState, useEffect, useRef } from 'react';
import { Factory, Save, Trash2, Copy, Check, ExternalLink, ChevronDown, ChevronUp, FileText, Archive, Loader2, Brain, Rocket, Star, TrendingUp, AlertTriangle, X, Search, Image, MapPin, Shield, Package, Plane, Ship, DollarSign, Target, Zap, Info, Clock, Users, AlertCircle } from 'lucide-react';

interface OEMResearch {
  id: string;
  product_name: string;
  raw_research: string | null;
  research_status: string;
  priority: number;
  created_at: string;
}

interface Product {
  name: string;
  category: string;
  subcategory: string;
  chineseKeywords: { primary: string; alt: string; factory: string };
  pricing: {
    retailZAR: number;
    cost1688ZAR: number;
    shippingZAR: number;
    dutyZAR: number;
    landedCostZAR: number;
    marginPercent: number;
    marginZAR: number;
  };
  scores: {
    total: number;
    marginPotential: number;
    trendVelocity: number;
    competitionLevel: number;
    supplierQuality: number;
    shippingEase: number;
  };
  verdict: 'rocket' | 'star' | 'trending' | 'review' | 'skip';
  verdictReason: string;
  market: {
    priceTier: string;
    dutyCategory: string;
    dutyPercent: number;
    trendLagWeeks: number;
    competitionLevel: string;
    demandSignals: string[];
    targetAudience: string;
  };
  sourcing: {
    shippingType: string;
    weightGrams: number;
    moqEstimate: string;
    leadTimeDays: number;
    factoryCluster: string;
    clusterMatch: boolean;
    recommendedBadges: string[];
  };
  risks: string[];
  opportunities: string[];
  recommendation: string;
  factoryVerification: {
    knownOEMs: string[];
    certifications: string[];
    redFlags: string[];
  };
  urls: {
    search: string;
    factory: string;
    oem: string;
    superFactory: string;
    imageSearch: { ali1688: string; taobao: string; aliexpress: string };
  };
}

interface AnalysisResult {
  summary: {
    totalProducts: number;
    quickWins: number;
    topPicks: number;
    trending: number;
    needsReview: number;
    avgScore: number;
    avgMargin: number;
    totalPotentialProfit: number;
    categories: string[];
  };
  products: Product[];
  grouped: {
    quickWins: Product[];
    topPicks: Product[];
    trending: Product[];
    needsReview: Product[];
  };
  tokenUsage: { input: number; output: number; estimatedCost: number };
}

// Verdict config
const VERDICTS = {
  rocket: { icon: Rocket, label: 'Quick Win', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50', border: 'border-green-400' },
  star: { icon: Star, label: 'Top Pick', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50', border: 'border-purple-400' },
  trending: { icon: TrendingUp, label: 'Trending', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', border: 'border-blue-400' },
  review: { icon: AlertTriangle, label: 'Review', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50', border: 'border-yellow-400' },
  skip: { icon: X, label: 'Skip', color: 'bg-gray-400', textColor: 'text-gray-600', bgLight: 'bg-gray-50', border: 'border-gray-300' },
};

// Simple Product Card - shows only essentials, expandable for details
function ProductCard({ product }: { product: Product }) {
  const [expanded, setExpanded] = useState(false);
  const [copiedKeyword, setCopiedKeyword] = useState(false);
  
  const verdict = VERDICTS[product.verdict] || VERDICTS.review;
  const VerdictIcon = verdict.icon;
  
  const copyKeyword = async () => {
    await navigator.clipboard.writeText(product.chineseKeywords.primary);
    setCopiedKeyword(true);
    setTimeout(() => setCopiedKeyword(false), 2000);
  };

  return (
    <div className={`rounded-xl border-2 ${verdict.border} ${verdict.bgLight} overflow-hidden transition-all`}>
      {/* Main Card - Always Visible */}
      <div className="p-4">
        {/* Top Row: Verdict + Name + Score */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className={`shrink-0 p-1.5 rounded-lg ${verdict.color} text-white`}>
              <VerdictIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{product.name}</h3>
              <p className="text-xs text-gray-500">{product.category}</p>
            </div>
          </div>
          <div className="text-center shrink-0">
            <div className={`text-2xl font-bold ${product.scores.total >= 75 ? 'text-green-600' : product.scores.total >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {product.scores.total}
            </div>
            <div className="text-[10px] text-gray-500 uppercase">Score</div>
          </div>
        </div>

        {/* Key Numbers Row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-gray-900">R{product.pricing.retailZAR}</div>
            <div className="text-[10px] text-gray-500">Sell Price</div>
          </div>
          <div className="bg-white/60 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-green-600">R{product.pricing.landedCostZAR}</div>
            <div className="text-[10px] text-gray-500">Landed Cost</div>
          </div>
          <div className={`rounded-lg p-2 text-center ${product.pricing.marginPercent >= 60 ? 'bg-green-100' : product.pricing.marginPercent >= 40 ? 'bg-yellow-100' : 'bg-red-100'}`}>
            <div className="text-lg font-bold">{product.pricing.marginPercent}%</div>
            <div className="text-[10px] text-gray-500">Margin</div>
          </div>
        </div>

        {/* Verdict Reason */}
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{product.verdictReason}</p>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <a href={product.urls.factory} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition">
            <Search className="h-3.5 w-3.5" /> Find on 1688
          </a>
          <button onClick={copyKeyword}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${copiedKeyword ? 'bg-green-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border'}`}>
            {copiedKeyword ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedKeyword ? 'Copied!' : product.chineseKeywords.primary}
          </button>
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 border transition ml-auto">
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {expanded ? 'Less' : 'More'}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t bg-white p-4 space-y-4">
          {/* Score Breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
              <Target className="h-3 w-3" /> Score Breakdown
            </h4>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: 'Margin', score: product.scores.marginPotential, weight: '30%' },
                { label: 'Trend', score: product.scores.trendVelocity, weight: '25%' },
                { label: 'Competition', score: product.scores.competitionLevel, weight: '20%' },
                { label: 'Supplier', score: product.scores.supplierQuality, weight: '15%' },
                { label: 'Shipping', score: product.scores.shippingEase, weight: '10%' },
              ].map(({ label, score, weight }) => (
                <div key={label} className="text-center">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                    <div className={`h-full ${score >= 70 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                      style={{ width: `${score}%` }} />
                  </div>
                  <div className="text-xs font-medium">{score}</div>
                  <div className="text-[10px] text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Pricing Breakdown
            </h4>
            <div className="flex items-center gap-1 text-sm flex-wrap">
              <span className="px-2 py-0.5 bg-gray-100 rounded">1688: R{product.pricing.cost1688ZAR}</span>
              <span className="text-gray-400">+</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded">Ship: R{product.pricing.shippingZAR}</span>
              <span className="text-gray-400">+</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded">Duty: R{product.pricing.dutyZAR}</span>
              <span className="text-gray-400">=</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">Landed: R{product.pricing.landedCostZAR}</span>
              <span className="text-gray-400">→</span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">Profit: R{product.pricing.marginZAR}/unit</span>
            </div>
          </div>

          {/* Market Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <Users className="h-3 w-3" /> Market
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Target:</span>
                  <span className="font-medium">{product.market.targetAudience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Competition:</span>
                  <span className={`font-medium ${product.market.competitionLevel === 'low' ? 'text-green-600' : product.market.competitionLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {product.market.competitionLevel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SA Peak:</span>
                  <span className="font-medium">~{product.market.trendLagWeeks} weeks</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <Package className="h-3 w-3" /> Sourcing
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">MOQ:</span>
                  <span className="font-medium">{product.sourcing.moqEstimate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lead Time:</span>
                  <span className="font-medium">{product.sourcing.leadTimeDays} days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Ship:</span>
                  <span className="font-medium flex items-center gap-1">
                    {product.sourcing.shippingType === 'air' ? <Plane className="h-3 w-3" /> : <Ship className="h-3 w-3" />}
                    {product.sourcing.shippingType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Factory Cluster */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Factory Location
            </h4>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-sm ${product.sourcing.clusterMatch ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.sourcing.factoryCluster}
              </span>
              {product.sourcing.clusterMatch ? (
                <span className="text-xs text-green-600 flex items-center gap-1"><Check className="h-3 w-3" /> Verified cluster</span>
              ) : (
                <span className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Check location</span>
              )}
            </div>
            {product.sourcing.recommendedBadges.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                <span className="text-xs text-gray-500">Look for:</span>
                {product.sourcing.recommendedBadges.map((badge, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">{badge}</span>
                ))}
              </div>
            )}
          </div>

          {/* Demand Signals */}
          {product.market.demandSignals.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                <Zap className="h-3 w-3" /> Demand Signals
              </h4>
              <div className="flex flex-wrap gap-1">
                {product.market.demandSignals.map((signal, i) => (
                  <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">{signal}</span>
                ))}
              </div>
            </div>
          )}

          {/* Risks & Opportunities */}
          <div className="grid grid-cols-2 gap-4">
            {product.risks.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-red-500 uppercase mb-2">⚠️ Risks</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {product.risks.map((risk, i) => <li key={i} className="flex items-start gap-1"><span className="text-red-400">•</span>{risk}</li>)}
                </ul>
              </div>
            )}
            {product.opportunities.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-green-500 uppercase mb-2">💡 Opportunities</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {product.opportunities.map((opp, i) => <li key={i} className="flex items-start gap-1"><span className="text-green-400">•</span>{opp}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Recommendation */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-purple-700 uppercase mb-1">💡 Recommendation</h4>
            <p className="text-sm text-gray-700">{product.recommendation}</p>
          </div>

          {/* All 1688 Links */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">🔗 All Search Links</h4>
            <div className="flex flex-wrap gap-2">
              <a href={product.urls.search} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Basic Search</a>
              <a href={product.urls.factory} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">Top Sellers</a>
              <a href={product.urls.oem} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200">Source Factories</a>
              <a href={product.urls.superFactory} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200">Super Factories</a>
              <a href={product.urls.imageSearch.ali1688} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1">
                <Image className="h-3 w-3" /> Image Search
              </a>
            </div>
          </div>

          {/* Alternative Keywords */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">🔤 Chinese Keywords</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => navigator.clipboard.writeText(product.chineseKeywords.primary)} 
                className="text-sm px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 font-mono">
                {product.chineseKeywords.primary}
              </button>
              {product.chineseKeywords.alt && (
                <button onClick={() => navigator.clipboard.writeText(product.chineseKeywords.alt)}
                  className="text-sm px-2 py-1 bg-orange-50 text-orange-700 rounded hover:bg-orange-100 font-mono">
                  {product.chineseKeywords.alt}
                </button>
              )}
              {product.chineseKeywords.factory && (
                <button onClick={() => navigator.clipboard.writeText(product.chineseKeywords.factory)}
                  className="text-sm px-2 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 font-mono">
                  {product.chineseKeywords.factory}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OEMResearchPage() {
  const [research, setResearch] = useState<OEMResearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [researchText, setResearchText] = useState('');
  const [researchName, setResearchName] = useState('');
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, AnalysisResult>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'rocket' | 'star' | 'trending' | 'review'>('all');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchResearch(); }, []);

  const fetchResearch = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/oem-research');
      const json = await res.json();
      setResearch(json.data || []);
    } catch (error) {
      console.error('Error fetching research:', error);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging false if we're leaving the drop zone entirely
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setExtracting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/oem-research/extract', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setResearchText(prev => prev + (prev ? '\n\n' : '') + data.combinedText);
        if (!researchName && file.name) setResearchName(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!researchText.trim()) return;
    setSaving(true);
    try {
      const name = researchName.trim() || `Research - ${new Date().toLocaleDateString()}`;
      await fetch('/api/admin/oem-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_name: name, raw_research: researchText, research_status: 'draft', priority: 5, tags: ['deep-dive'] }),
      });
      setResearchText('');
      setResearchName('');
      fetchResearch();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async (id: string, text: string) => {
    setAnalyzing(id);
    try {
      const res = await fetch('/api/admin/oem-research/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ research_text: text, research_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(prev => ({ ...prev, [id]: data }));
        setExpandedId(id);
      } else {
        alert(`Analysis failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error analyzing:', error);
    } finally {
      setAnalyzing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this research?')) return;
    await fetch(`/api/admin/oem-research?id=${id}`, { method: 'DELETE' });
    fetchResearch();
  };

  const getFilteredProducts = (result: AnalysisResult) => {
    if (activeFilter === 'all') return result.products;
    if (activeFilter === 'rocket') return result.grouped.quickWins;
    if (activeFilter === 'star') return result.grouped.topPicks;
    if (activeFilter === 'trending') return result.grouped.trending;
    if (activeFilter === 'review') return result.grouped.needsReview;
    return result.products;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Factory className="h-8 w-8 text-amber-500" />
          Product Finder
        </h1>
        <p className="text-gray-500 mt-1">Upload research → AI finds products → Get 1688 factory links</p>
      </div>

      {/* Input Card with Drag & Drop */}
      <div 
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all ${
          isDragging 
            ? 'border-amber-500 border-dashed bg-amber-50 ring-4 ring-amber-100' 
            : 'border-gray-200'
        }`}>
        <div className="p-4 bg-gray-50 border-b flex items-center gap-3">
          <input type="text" value={researchName} onChange={(e) => setResearchName(e.target.value)}
            placeholder="Name this research (optional)" className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
          <input ref={fileInputRef} type="file" accept=".zip,.docx,.pdf,.txt,.md,.csv,.json" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={extracting}
            className="flex items-center gap-2 px-5 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 font-medium transition">
            {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            {extracting ? 'Reading...' : 'Upload'}
          </button>
        </div>
        
        <div className="relative">
          {isDragging && (
            <div className="absolute inset-0 bg-amber-50 flex items-center justify-center z-10 pointer-events-none">
              <div className="text-center">
                <Archive className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                <p className="text-amber-600 font-medium">Drop files here</p>
                <p className="text-amber-500 text-sm">.zip, .docx, .pdf, .txt, .md, .csv, .json</p>
              </div>
            </div>
          )}
          <textarea value={researchText} onChange={(e) => setResearchText(e.target.value)} rows={6}
            className="w-full px-4 py-3 border-0 resize-none focus:ring-0 text-gray-700"
            placeholder="Paste your product research here or drag & drop files... (trends, product ideas, competitor analysis, etc.)" />
        </div>
        
        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
          <span className="text-sm text-gray-400">
            {researchText.length > 0 ? `${researchText.length.toLocaleString()} characters` : 'Ready for input'}
          </span>
          <div className="flex gap-2">
            {researchText && (
              <button onClick={() => { setResearchText(''); setResearchName(''); }} 
                className="px-4 py-2 text-gray-500 hover:bg-gray-200 rounded-xl transition">
                Clear
              </button>
            )}
            <button onClick={handleSave} disabled={saving || !researchText.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 font-semibold transition">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Research
            </button>
          </div>
        </div>
      </div>

      {/* Saved Research List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
          <FileText className="h-5 w-5" /> Your Research ({research.length})
        </h2>
        
        {loading ? (
          <div className="bg-white rounded-2xl border p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
            <p className="text-gray-500 mt-2">Loading...</p>
          </div>
        ) : research.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center">
            <Factory className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No research saved yet. Paste some product research above!</p>
          </div>
        ) : (
          research.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border overflow-hidden shadow-sm">
              {/* Research Header */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                  <p className="text-sm text-gray-400">{new Date(item.created_at).toLocaleDateString()} • {item.raw_research?.length.toLocaleString()} chars</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => item.raw_research && handleAnalyze(item.id, item.raw_research)}
                    disabled={analyzing === item.id}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 font-semibold shadow-sm transition">
                    {analyzing === item.id ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Brain className="h-4 w-4" /> Find Products</>
                    )}
                  </button>
                  {results[item.id] && (
                    <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} 
                      className="p-2.5 hover:bg-gray-100 rounded-xl transition">
                      {expandedId === item.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  )}
                  <button onClick={() => handleDelete(item.id)} className="p-2.5 hover:bg-red-50 text-red-400 rounded-xl transition">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Results Section */}
              {expandedId === item.id && results[item.id] && (
                <div className="border-t">
                  {/* Summary Bar */}
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-white flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{results[item.id].summary.totalProducts}</div>
                        <div className="text-xs text-gray-500">Products</div>
                      </div>
                      <div className="h-10 w-px bg-gray-200" />
                      <div className="flex gap-3">
                        <div className="flex items-center gap-1 text-green-600">
                          <Rocket className="h-4 w-4" />
                          <span className="font-bold">{results[item.id].summary.quickWins}</span>
                          <span className="text-xs text-gray-400">Quick Wins</span>
                        </div>
                        <div className="flex items-center gap-1 text-purple-600">
                          <Star className="h-4 w-4" />
                          <span className="font-bold">{results[item.id].summary.topPicks}</span>
                          <span className="text-xs text-gray-400">Top Picks</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-bold">{results[item.id].summary.trending}</span>
                          <span className="text-xs text-gray-400">Trending</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-4 text-sm">
                      <div>Avg Score: <span className="font-bold text-gray-900">{results[item.id].summary.avgScore}</span></div>
                      <div>Avg Margin: <span className="font-bold text-green-600">{results[item.id].summary.avgMargin}%</span></div>
                      <div className="text-gray-400 text-xs">API: ${results[item.id].tokenUsage.estimatedCost.toFixed(3)}</div>
                    </div>
                  </div>

                  {/* Filter Tabs */}
                  <div className="px-4 py-2 border-y bg-white flex gap-2 overflow-x-auto">
                    {[
                      { key: 'all', label: 'All', count: results[item.id].products.length, color: 'gray' },
                      { key: 'rocket', label: '🚀 Quick Wins', count: results[item.id].summary.quickWins, color: 'green' },
                      { key: 'star', label: '⭐ Top Picks', count: results[item.id].summary.topPicks, color: 'purple' },
                      { key: 'trending', label: '📈 Trending', count: results[item.id].summary.trending, color: 'blue' },
                      { key: 'review', label: '⚠️ Review', count: results[item.id].summary.needsReview, color: 'yellow' },
                    ].map(({ key, label, count, color }) => (
                      <button key={key} onClick={() => setActiveFilter(key as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                          activeFilter === key 
                            ? `bg-${color}-100 text-${color}-700 ring-2 ring-${color}-500` 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        {label} ({count})
                      </button>
                    ))}
                  </div>

                  {/* Product Grid */}
                  <div className="p-4 grid gap-4 md:grid-cols-2">
                    {getFilteredProducts(results[item.id]).map((product, i) => (
                      <ProductCard key={i} product={product} />
                    ))}
                    {getFilteredProducts(results[item.id]).length === 0 && (
                      <div className="col-span-2 text-center py-8 text-gray-400">
                        No products in this category
                      </div>
                    )}
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
