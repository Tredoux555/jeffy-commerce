'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Factory, Save, Trash2, Copy, Check, ExternalLink, ChevronDown, ChevronUp, FileText, Archive, Loader2, Brain, TrendingUp, DollarSign, Zap, Package, Plane, Ship, AlertTriangle, Star, Target } from 'lucide-react';

interface OEMResearch {
  id: string;
  product_name: string;
  raw_research: string | null;
  research_status: string;
  priority: number;
  created_at: string;
}

interface ExtractedProduct {
  name: string;
  chineseKeyword: string;
  chineseKeywordAlt: string;
  category: string;
  subcategory: string;
  estimatedRetailZAR: number;
  estimated1688CostZAR: number;
  landedCostZAR: number;
  marginPercent: number;
  saTrendScore: number;
  tiktokVelocityScore: number;
  aliexpressScore: number;
  priceCompetitivenessScore: number;
  searchVolumeScore: number;
  mobileFriendlinessScore: number;
  supplierReliabilityScore: number;
  categoryAdoptionScore: number;
  demandSignals: string[];
  competitionLevel: 'low' | 'medium' | 'high';
  trendLagWeeks: number;
  trendSource: string;
  priceTier: 'impulse' | 'considered' | 'premium';
  dutyCategory: 'zero' | 'standard' | 'clothing_45';
  dutyPercent: number;
  mobileFriendly: boolean;
  moqEstimate: string;
  shippingType: 'air' | 'sea' | 'express';
  recommendation: string;
  riskFactors: string[];
  searchUrls: { primary: string; factory: string; oem: string; };
}

interface AnalysisSummary {
  totalProducts: number;
  avgSATrendScore: number;
  avgMargin: number;
  highPotentialCount: number;
  quickWinsCount: number;
  impulsePriceCount: number;
  airFreightReadyCount: number;
  categories: string[];
}

interface TokenUsage {
  input: number;
  output: number;
  estimatedCost: number;
}

export default function OEMResearchPage() {
  const [research, setResearch] = useState<OEMResearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [researchText, setResearchText] = useState('');
  const [researchName, setResearchName] = useState('');
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analyzedResults, setAnalyzedResults] = useState<Record<string, { 
    products: ExtractedProduct[]; 
    summary: AnalysisSummary;
    topPicks: ExtractedProduct[];
    quickWins: ExtractedProduct[];
    tokenUsage: TokenUsage;
  }>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'quickwins' | 'toppicks'>('quickwins');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAIAnalyze = async (id: string, text: string) => {
    setAnalyzing(id);
    try {
      const res = await fetch('/api/admin/oem-research/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ research_text: text, research_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalyzedResults(prev => ({ ...prev, [id]: data }));
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

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const exportToCSV = (products: ExtractedProduct[]) => {
    const headers = ['Product', 'SA Score', 'Chinese', 'Category', 'Retail ZAR', '1688 Cost', 'Landed', 'Margin %', 'Price Tier', 'Duty', 'Ship', 'Competition', 'Trend Lag', 'Primary URL'];
    const rows = products.map(p => [
      p.name, p.saTrendScore, p.chineseKeyword, p.category, p.estimatedRetailZAR, p.estimated1688CostZAR,
      p.landedCostZAR, p.marginPercent, p.priceTier, p.dutyPercent + '%', p.shippingType, p.competitionLevel,
      p.trendLagWeeks + 'w', p.searchUrls.primary
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sa-products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 65) return 'bg-yellow-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-700 border-green-300';
    if (score >= 65) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    if (score >= 50) return 'bg-orange-100 text-orange-700 border-orange-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  const ProductCard = ({ product, isQuickWin = false }: { product: ExtractedProduct; isQuickWin?: boolean }) => (
    <div className={`rounded-lg p-4 border-2 ${isQuickWin ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isQuickWin && <Zap className="h-5 w-5 text-green-600" />}
            <h4 className="font-bold text-gray-900">{product.name}</h4>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">{product.category}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              product.priceTier === 'impulse' ? 'bg-green-100 text-green-700' :
              product.priceTier === 'considered' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
            }`}>
              {product.priceTier === 'impulse' ? '🎯 Impulse' : product.priceTier === 'considered' ? '💭 Considered' : '💎 Premium'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              product.shippingType === 'air' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {product.shippingType === 'air' ? <><Plane className="h-3 w-3 inline" /> Air</> : <><Ship className="h-3 w-3 inline" /> Sea</>}
            </span>
          </div>
        </div>
        {/* SA Score Badge */}
        <div className={`text-center px-3 py-2 rounded-lg border ${getScoreBg(product.saTrendScore)}`}>
          <div className="text-2xl font-bold">{product.saTrendScore}</div>
          <div className="text-xs">SA Score</div>
        </div>
      </div>

      {/* Pricing Row */}
      <div className="grid grid-cols-4 gap-2 mb-3 text-sm">
        <div className="bg-gray-50 rounded p-2 text-center">
          <div className="text-gray-500 text-xs">Retail</div>
          <div className="font-bold text-gray-900">R{product.estimatedRetailZAR}</div>
        </div>
        <div className="bg-gray-50 rounded p-2 text-center">
          <div className="text-gray-500 text-xs">1688 Cost</div>
          <div className="font-bold text-green-600">R{product.estimated1688CostZAR}</div>
        </div>
        <div className="bg-gray-50 rounded p-2 text-center">
          <div className="text-gray-500 text-xs">Landed</div>
          <div className="font-bold text-orange-600">R{product.landedCostZAR}</div>
        </div>
        <div className={`rounded p-2 text-center ${product.marginPercent >= 70 ? 'bg-green-100' : product.marginPercent >= 50 ? 'bg-yellow-100' : 'bg-red-100'}`}>
          <div className="text-gray-500 text-xs">Margin</div>
          <div className="font-bold">{product.marginPercent}%</div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Score Breakdown:</div>
        <div className="flex gap-1 flex-wrap">
          {[
            { label: 'TikTok', score: product.tiktokVelocityScore },
            { label: 'AliEx', score: product.aliexpressScore },
            { label: 'Price', score: product.priceCompetitivenessScore },
            { label: 'Search', score: product.searchVolumeScore },
            { label: 'Mobile', score: product.mobileFriendlinessScore },
          ].map(({ label, score }) => (
            <div key={label} className="flex items-center gap-1">
              <span className="text-xs text-gray-600">{label}:</span>
              <div className="w-8 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full ${getScoreColor(score)}`} style={{ width: `${score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chinese Keywords */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">1688 Keywords:</div>
        <div className="flex gap-2">
          <button onClick={() => copyToClipboard(product.chineseKeyword)} 
            className={`px-2 py-1 rounded font-mono text-sm transition ${copiedUrl === product.chineseKeyword ? 'bg-green-200 text-green-800' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}>
            {product.chineseKeyword} {copiedUrl === product.chineseKeyword ? <Check className="h-3 w-3 inline" /> : <Copy className="h-3 w-3 inline" />}
          </button>
          {product.chineseKeywordAlt && (
            <button onClick={() => copyToClipboard(product.chineseKeywordAlt)}
              className="px-2 py-1 bg-orange-50 text-orange-700 rounded font-mono text-sm hover:bg-orange-100">
              {product.chineseKeywordAlt}
            </button>
          )}
        </div>
      </div>

      {/* Demand Signals */}
      {product.demandSignals?.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Demand Signals:</div>
          <div className="flex flex-wrap gap-1">
            {product.demandSignals.map((s, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Risk & Recommendation */}
      <div className="mb-3 space-y-1">
        {product.recommendation && (
          <div className="text-sm text-gray-700 bg-gray-50 rounded p-2">💡 {product.recommendation}</div>
        )}
        {product.riskFactors?.length > 0 && (
          <div className="text-sm text-orange-700 bg-orange-50 rounded p-2 flex items-start gap-1">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>Risks: {product.riskFactors.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
        <span>Competition: <b className={product.competitionLevel === 'low' ? 'text-green-600' : product.competitionLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'}>{product.competitionLevel}</b></span>
        <span>•</span>
        <span>SA Peak: ~{product.trendLagWeeks} weeks</span>
        <span>•</span>
        <span>Duty: {product.dutyPercent}%</span>
        <span>•</span>
        <span>MOQ: {product.moqEstimate}</span>
      </div>

      {/* 1688 Links */}
      <div className="flex flex-wrap gap-2">
        <a href={product.searchUrls.primary} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition">
          <ExternalLink className="h-3 w-3" /> 1688 Search
        </a>
        <a href={product.searchUrls.factory} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition">
          <TrendingUp className="h-3 w-3" /> Top Sellers
        </a>
        <a href={product.searchUrls.oem} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded text-sm hover:bg-amber-600 transition">
          <Factory className="h-3 w-3" /> OEM Factories
        </a>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Factory className="h-7 w-7 text-amber-500" />
          SA Product Intelligence
          <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
            <Brain className="h-3 w-3" /> AI-Powered SA Scoring
          </span>
        </h1>
        <p className="text-gray-600 mt-1">
          Upload research → AI extracts products with <b>SA Trend Scores</b> → Get 1688 factory links
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-300">
        <div className="p-4 border-b bg-gray-50 rounded-t-xl flex items-center gap-4">
          <input type="text" value={researchName} onChange={(e) => setResearchName(e.target.value)}
            placeholder="Research name (optional)" className="flex-1 px-3 py-2 border rounded-lg" />
          <input ref={fileInputRef} type="file" accept=".zip,.docx,.pdf,.txt,.md,.csv,.json" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={extracting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
            {extracting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
            {extracting ? 'Extracting...' : 'Upload Files'}
          </button>
        </div>
        <textarea value={researchText} onChange={(e) => setResearchText(e.target.value)} rows={8}
          className="w-full px-4 py-3 border-0 resize-none font-mono text-sm"
          placeholder="Paste research or drag files here..." />
        <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-between items-center">
          <span className="text-sm text-gray-500">{researchText.length > 0 ? `${researchText.length.toLocaleString()} chars (~${Math.round(researchText.length/4).toLocaleString()} tokens)` : 'No content'}</span>
          <div className="flex gap-2">
            {researchText && <button onClick={() => { setResearchText(''); setResearchName(''); }} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">Clear</button>}
            <button onClick={handleSave} disabled={saving || !researchText.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 font-semibold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
            </button>
          </div>
        </div>
      </div>

      {/* Saved Research */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2"><FileText className="h-5 w-5" /> Saved Research ({research.length})</h2>
        
        {loading ? (
          <div className="bg-white rounded-lg border p-8 text-center"><Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" /></div>
        ) : research.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center text-gray-500">No research saved yet</div>
        ) : (
          research.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                  <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleDateString()} • {item.raw_research?.length.toLocaleString()} chars</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => item.raw_research && handleAIAnalyze(item.id, item.raw_research)}
                    disabled={analyzing === item.id}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 font-medium shadow-sm">
                    {analyzing === item.id ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Brain className="h-4 w-4" /> AI Extract → SA Score</>}
                  </button>
                  <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} className="p-2 hover:bg-gray-100 rounded-lg">
                    {expandedId === item.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 className="h-5 w-5" /></button>
                </div>
              </div>

              {expandedId === item.id && analyzedResults[item.id] && (
                <div className="border-t p-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-700">{analyzedResults[item.id].summary.totalProducts}</div>
                      <div className="text-xs text-purple-600">Products</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-700">{analyzedResults[item.id].summary.avgSATrendScore}</div>
                      <div className="text-xs text-green-600">Avg SA Score</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-700">{analyzedResults[item.id].summary.avgMargin}%</div>
                      <div className="text-xs text-blue-600">Avg Margin</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-yellow-700">{analyzedResults[item.id].summary.quickWinsCount}</div>
                      <div className="text-xs text-yellow-600">Quick Wins</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-700">{analyzedResults[item.id].summary.impulsePriceCount}</div>
                      <div className="text-xs text-orange-600">Impulse Price</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-indigo-700">${analyzedResults[item.id].tokenUsage.estimatedCost.toFixed(3)}</div>
                      <div className="text-xs text-indigo-600">API Cost</div>
                    </div>
                  </div>

                  {/* Tab Navigation */}
                  <div className="flex gap-2 mb-4">
                    <button onClick={() => setActiveTab('quickwins')}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${activeTab === 'quickwins' ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      <Zap className="h-4 w-4" /> Quick Wins ({analyzedResults[item.id].quickWins.length})
                    </button>
                    <button onClick={() => setActiveTab('toppicks')}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${activeTab === 'toppicks' ? 'bg-purple-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      <Star className="h-4 w-4" /> Top Picks ({analyzedResults[item.id].topPicks.length})
                    </button>
                    <button onClick={() => setActiveTab('all')}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition ${activeTab === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                      <Package className="h-4 w-4" /> All ({analyzedResults[item.id].products.length})
                    </button>
                    <button onClick={() => exportToCSV(analyzedResults[item.id].products)}
                      className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium ml-auto">
                      <FileText className="h-4 w-4" /> Export CSV
                    </button>
                  </div>

                  {/* Product Grid */}
                  <div className="grid gap-4 md:grid-cols-2 max-h-[800px] overflow-y-auto">
                    {(activeTab === 'quickwins' ? analyzedResults[item.id].quickWins :
                      activeTab === 'toppicks' ? analyzedResults[item.id].topPicks :
                      analyzedResults[item.id].products
                    ).map((product, i) => (
                      <ProductCard key={i} product={product} isQuickWin={activeTab === 'quickwins'} />
                    ))}
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
