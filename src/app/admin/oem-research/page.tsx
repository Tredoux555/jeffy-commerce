'use client';

import { useState, useEffect, useCallback } from 'react';
import { Factory, Save, Zap, Trash2, Copy, Check, ExternalLink, ChevronDown, ChevronUp, FileText, Upload } from 'lucide-react';

interface OEMResearch {
  id: string;
  product_name: string;
  raw_research: string | null;
  research_status: string;
  priority: number;
  created_at: string;
  tags: string[] | null;
}

interface AnalyzedProduct {
  name: string;
  category: string;
  chineseKeywords: string[];
  searchUrls: { url: string; keyword: string }[];
  priceRange: { margin: string } | null;
}

export default function OEMResearchPage() {
  const [research, setResearch] = useState<OEMResearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [researchText, setResearchText] = useState('');
  const [researchName, setResearchName] = useState('');
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [analyzedResults, setAnalyzedResults] = useState<Record<string, AnalyzedProduct[]>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleSave = async () => {
    if (!researchText.trim()) {
      alert('Please paste some research first');
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
        fetchResearch();
      }
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async (id: string, text: string) => {
    setAnalyzing(id);
    try {
      const res = await fetch('/api/admin/oem-research/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ research_text: text }),
      });

      const data = await res.json();
      if (data.success) {
        setAnalyzedResults(prev => ({ ...prev, [id]: data.products }));
        setExpandedId(id);
      }
    } catch (error) {
      console.error('Error analyzing:', error);
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

  const copyAllLinks = async (products: AnalyzedProduct[]) => {
    const allLinks = products
      .flatMap(p => p.searchUrls.map(u => u.url))
      .join('\n');
    await navigator.clipboard.writeText(allLinks);
    alert(`Copied ${products.flatMap(p => p.searchUrls).length} links!`);
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
    }
    
    // Handle file drops
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setResearchText(prev => prev + (prev ? '\n\n' : '') + content);
        };
        reader.readAsText(file);
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Factory className="h-7 w-7 text-amber-500" />
          OEM Research → 1688 Links
        </h1>
        <p className="text-gray-600 mt-1">
          Paste your deep dive research, save it, then analyze to get factory search links
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
            <Upload className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={researchName}
              onChange={(e) => setResearchName(e.target.value)}
              placeholder="Research name (optional - auto-generates if empty)"
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <textarea
          value={researchText}
          onChange={(e) => setResearchText(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 focus:outline-none focus:ring-0 border-0 resize-none font-mono text-sm"
          placeholder={isDragging 
            ? "Drop your research here..." 
            : `Paste or drag & drop your deep dive research here...

Examples of what to paste:
• Product research from TikTok, Amazon, market analysis
• Factory information and pricing
• Competitor analysis
• Any text mentioning products like "Stanley Cup", "massage gun", "LED skincare"

The analyzer will extract products and generate 1688 search links in Chinese.`}
        />
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {researchText.length > 0 ? `${researchText.length.toLocaleString()} characters` : 'Drag & drop text files or paste directly'}
          </span>
          <button
            onClick={handleSave}
            disabled={saving || !researchText.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Research
              </>
            )}
          </button>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          </div>
        ) : research.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
            No research saved yet. Paste your first deep dive above!
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
                    onClick={() => item.raw_research && handleAnalyze(item.id, item.raw_research)}
                    disabled={analyzing === item.id || !item.raw_research}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 font-medium"
                  >
                    {analyzing === item.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Analyze → 1688 Links
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    {expandedId === item.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
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
                  {item.raw_research && (
                    <div className="p-4 bg-gray-50 border-b max-h-48 overflow-y-auto">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                        {item.raw_research.slice(0, 2000)}
                        {item.raw_research.length > 2000 && '...'}
                      </pre>
                    </div>
                  )}

                  {/* Analyzed Results */}
                  {analyzedResults[item.id] && analyzedResults[item.id].length > 0 && (
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-green-700">
                          ✓ Found {analyzedResults[item.id].length} products → {analyzedResults[item.id].reduce((sum, p) => sum + p.searchUrls.length, 0)} 1688 links
                        </h4>
                        <button
                          onClick={() => copyAllLinks(analyzedResults[item.id])}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm transition"
                        >
                          <Copy className="h-4 w-4" />
                          Copy All Links
                        </button>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {analyzedResults[item.id].map((product, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-900">{product.name}</span>
                              <span className="text-xs px-2 py-0.5 bg-gray-200 rounded">{product.category}</span>
                              {product.priceRange?.margin && (
                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                  {product.priceRange.margin}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {product.searchUrls.map((url, j) => (
                                <div key={j} className="flex items-center gap-1">
                                  <span className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded font-mono">
                                    {url.keyword}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(url.url)}
                                    className={`p-1 rounded transition ${
                                      copiedUrl === url.url ? 'bg-green-100 text-green-600' : 'hover:bg-gray-200'
                                    }`}
                                  >
                                    {copiedUrl === url.url ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  </button>
                                  <a
                                    href={url.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              ))}
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
