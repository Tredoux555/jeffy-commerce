'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Factory, Save, Zap, Trash2, Copy, Check, ExternalLink, ChevronDown, ChevronUp, FileText, Upload, File, Archive, Loader2, Brain, TrendingUp, DollarSign } from 'lucide-react';

interface OEMResearch {
  id: string;
  product_name: string;
  raw_research: string | null;
  research_status: string;
  priority: number;
  created_at: string;
  tags: string[] | null;
}

interface ExtractedProduct {
  name: string;
  chineseKeyword: string;
  chineseKeywordAlt: string;
  category: string;
  estimatedRetailUSD: string;
  estimated1688CostUSD: string;
  marginPercent: number;
  demandSignals: string[];
  moqEstimate: string;
  competitionLevel: string;
  recommendation: string;
  searchUrls: {
    primary: string;
    factory: string;
    oem: string;
  };
}

interface AnalysisSummary {
  totalProducts: number;
  categories: string[];
  averageMargin: number;
  highMarginCount: number;
  totalSearchLinks: number;
}

interface ExtractedFileInfo {
  name: string;
  type: string;
  size: number;
  contentLength: number;
}

export default function OEMResearchPage() {
  const [research, setResearch] = useState<OEMResearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [researchText, setResearchText] = useState('');
  const [researchName, setResearchName] = useState('');
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analyzedResults, setAnalyzedResults] = useState<Record<string, { products: ExtractedProduct[]; summary: AnalysisSummary }>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFileInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchResearch();
  }, []);

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
    setExtractedFiles([]);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/admin/oem-research/extract', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.success) {
        setResearchText(prev => prev + (prev ? '\n\n' : '') + data.combinedText);
        setExtractedFiles(data.stats.files);
        if (!researchName && file.name) {
          setResearchName(file.name.replace(/\.[^/.]+$/, ''));
        }
      } else {
        alert(`Error: ${data.error || 'Failed to extract file'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!researchText.trim()) {
      alert('Please paste some research or upload files first');
      return;
    }

    setSaving(true);
    try {
      const name = researchName.trim() || `Research - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
      
      const res = await fetch('/api/admin/oem-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: name,
          raw_research: researchText,
          research_status: 'draft',
          priority: 5,
          tags: ['deep-dive']
        }),
      });

      if (res.ok) {
        setResearchText('');
        setResearchName('');
        setExtractedFiles([]);
        fetchResearch();
      }
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
        body: JSON.stringify({ research_text: text }),
      });

      const data = await res.json();
      if (data.success) {
        setAnalyzedResults(prev => ({ 
          ...prev, 
          [id]: { products: data.products, summary: data.summary }
        }));
        setExpandedId(id);
      } else {
        alert(`Analysis failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error analyzing:', error);
      alert('Analysis failed - check console');
    } finally {
      setAnalyzing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this research?')) return;
    try {
      await fetch(`/api/admin/oem-research?id=${id}`, { method: 'DELETE' });
      setAnalyzedResults(prev => {
        const newResults = { ...prev };
        delete newResults[id];
        return newResults;
      });
      fetchResearch();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const copyAllLinks = async (products: ExtractedProduct[]) => {
    const allLinks = products
      .flatMap(p => [p.searchUrls.primary, p.searchUrls.factory, p.searchUrls.oem])
      .join('\n');
    await navigator.clipboard.writeText(allLinks);
    alert(`Copied ${products.length * 3} links!`);
  };

  const exportToCSV = (products: ExtractedProduct[]) => {
    const headers = ['Product', 'Chinese Keyword', 'Category', 'Retail USD', '1688 Cost', 'Margin %', 'Competition', 'MOQ', 'Primary URL', 'Factory URL', 'OEM URL'];
    const rows = products.map(p => [
      p.name,
      p.chineseKeyword,
      p.category,
      p.estimatedRetailUSD,
      p.estimated1688CostUSD,
      p.marginPercent,
      p.competitionLevel,
      p.moqEstimate,
      p.searchUrls.primary,
      p.searchUrls.factory,
      p.searchUrls.oem
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `1688-products-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      setResearchText(prev => prev + (prev ? '\n\n' : '') + text);
      return;
    }
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 60) return 'bg-green-100 text-green-700';
    if (margin >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getCompetitionColor = (level: string) => {
    if (level === 'low') return 'bg-green-100 text-green-700';
    if (level === 'medium') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Factory className="h-7 w-7 text-amber-500" />
          OEM Research → 1688 Links
          <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
            <Brain className="h-3 w-3" /> AI Powered
          </span>
        </h1>
        <p className="text-gray-600 mt-1">
          Upload research files → AI extracts products with Chinese keywords → Get 1688 factory links
        </p>
      </div>

      {/* Input Section */}
      <div 
        className={`bg-white rounded-xl border-2 border-dashed transition-colors ${
          isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={researchName}
              onChange={(e) => setResearchName(e.target.value)}
              placeholder="Research name (optional)"
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.docx,.pdf,.txt,.md,.csv,.json,.html,.rtf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={extracting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            >
              {extracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  Upload Files
                </>
              )}
            </button>
          </div>
          
          {extractedFiles.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {extractedFiles.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                  <File className="h-3 w-3" />
                  {f.name} ({(f.contentLength / 1000).toFixed(1)}k)
                </span>
              ))}
            </div>
          )}
        </div>
        
        <textarea
          value={researchText}
          onChange={(e) => setResearchText(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 focus:outline-none focus:ring-0 border-0 resize-none font-mono text-sm"
          placeholder={isDragging 
            ? "Drop files here..." 
            : `Drop files or paste research...

Supported: .zip, .docx, .pdf, .txt, .md, .csv, .json

AI will extract:
• Product names & Chinese keywords
• Pricing estimates & margins
• Demand signals & competition
• 1688 factory search links`}
        />
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {researchText.length > 0 ? `${researchText.length.toLocaleString()} chars` : 'Drop files or paste'}
          </span>
          <div className="flex gap-2">
            {researchText && (
              <button
                onClick={() => { setResearchText(''); setExtractedFiles([]); setResearchName(''); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !researchText.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 font-semibold"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Saved Research List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Saved Research ({research.length})
        </h2>

        {loading ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
          </div>
        ) : research.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
            No research saved yet. Upload files or paste research above!
          </div>
        ) : (
          research.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border overflow-hidden">
              {/* Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()} • 
                    {item.raw_research ? ` ${item.raw_research.length.toLocaleString()} chars` : ' No content'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => item.raw_research && handleAIAnalyze(item.id, item.raw_research)}
                    disabled={analyzing === item.id || !item.raw_research}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:from-purple-600 hover:to-indigo-600 transition disabled:opacity-50 font-medium shadow-sm"
                  >
                    {analyzing === item.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        AI Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        AI Extract → 1688
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    {expandedId === item.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === item.id && (
                <div className="border-t">
                  {/* Raw Research Preview */}
                  {item.raw_research && !analyzedResults[item.id] && (
                    <div className="p-4 bg-gray-50 max-h-48 overflow-y-auto">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                        {item.raw_research.slice(0, 2000)}
                        {item.raw_research.length > 2000 && '...'}
                      </pre>
                    </div>
                  )}

                  {/* AI Analysis Results */}
                  {analyzedResults[item.id] && (
                    <div className="p-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="bg-purple-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-purple-700">{analyzedResults[item.id].summary.totalProducts}</div>
                          <div className="text-xs text-purple-600">Products Found</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-green-700">{analyzedResults[item.id].summary.averageMargin}%</div>
                          <div className="text-xs text-green-600">Avg Margin</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-blue-700">{analyzedResults[item.id].summary.highMarginCount}</div>
                          <div className="text-xs text-blue-600">High Margin (50%+)</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold text-amber-700">{analyzedResults[item.id].summary.totalSearchLinks}</div>
                          <div className="text-xs text-amber-600">1688 Links</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mb-4">
                        <button
                          onClick={() => copyAllLinks(analyzedResults[item.id].products)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm transition"
                        >
                          <Copy className="h-4 w-4" /> Copy All Links
                        </button>
                        <button
                          onClick={() => exportToCSV(analyzedResults[item.id].products)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm transition"
                        >
                          <FileText className="h-4 w-4" /> Export CSV
                        </button>
                      </div>

                      {/* Product Cards */}
                      <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {analyzedResults[item.id].products.map((product, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            {/* Product Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">{product.category}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${getMarginColor(product.marginPercent)}`}>
                                    {product.marginPercent}% margin
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${getCompetitionColor(product.competitionLevel)}`}>
                                    {product.competitionLevel} competition
                                  </span>
                                </div>
                              </div>
                              <div className="text-right text-sm">
                                <div className="text-gray-500">Retail: <span className="text-gray-900 font-medium">{product.estimatedRetailUSD}</span></div>
                                <div className="text-gray-500">1688: <span className="text-green-600 font-medium">{product.estimated1688CostUSD}</span></div>
                              </div>
                            </div>

                            {/* Chinese Keywords */}
                            <div className="mb-3">
                              <div className="text-xs text-gray-500 mb-1">Chinese Keywords:</div>
                              <div className="flex gap-2">
                                <span className="px-2 py-1 bg-red-50 text-red-700 rounded font-mono text-sm">{product.chineseKeyword}</span>
                                {product.chineseKeywordAlt && (
                                  <span className="px-2 py-1 bg-orange-50 text-orange-700 rounded font-mono text-sm">{product.chineseKeywordAlt}</span>
                                )}
                              </div>
                            </div>

                            {/* Demand Signals */}
                            {product.demandSignals?.length > 0 && (
                              <div className="mb-3">
                                <div className="text-xs text-gray-500 mb-1">Demand Signals:</div>
                                <div className="flex flex-wrap gap-1">
                                  {product.demandSignals.map((signal, j) => (
                                    <span key={j} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded">{signal}</span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recommendation */}
                            {product.recommendation && (
                              <div className="mb-3 text-sm text-gray-600 italic">
                                💡 {product.recommendation}
                              </div>
                            )}

                            {/* 1688 Links */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                              <a
                                href={product.searchUrls.primary}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition"
                              >
                                <ExternalLink className="h-3 w-3" /> 1688 Search
                              </a>
                              <a
                                href={product.searchUrls.factory}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition"
                              >
                                <TrendingUp className="h-3 w-3" /> Top Sellers
                              </a>
                              <a
                                href={product.searchUrls.oem}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded text-sm hover:bg-amber-600 transition"
                              >
                                <Factory className="h-3 w-3" /> OEM Factories
                              </a>
                              <button
                                onClick={() => copyToClipboard(product.chineseKeyword)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition ${
                                  copiedUrl === product.chineseKeyword 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-gray-200 hover:bg-gray-300'
                                }`}
                              >
                                {copiedUrl === product.chineseKeyword ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                Copy 中文
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
