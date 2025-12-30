'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Zap, Copy, Check, ExternalLink, ArrowLeft, Factory, Tag, DollarSign, Sparkles, Download } from 'lucide-react';

interface SearchUrl {
  url: string;
  keyword: string;
  type: 'exact' | 'category' | 'broad';
}

interface ExtractedProduct {
  name: string;
  category: string;
  chineseKeywords: string[];
  searchUrls: SearchUrl[];
  priceRange: {
    retailUsd: string;
    oemUsd: string;
    margin: string;
  } | null;
  notes: string[];
  priority: number;
}

interface AnalysisResult {
  success: boolean;
  summary: {
    productsFound: number;
    categoriesDetected: string[];
    totalSearchLinks: number;
    topCategories: string[];
  };
  products: ExtractedProduct[];
  quickLinks: {
    product: string;
    keyword: string;
    url: string;
  }[];
}

export default function ResearchAnalyzerPage() {
  const [researchText, setResearchText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [saveToDb, setSaveToDb] = useState(false);

  const handleAnalyze = async () => {
    if (!researchText.trim() || researchText.length < 50) {
      alert('Please paste more research text (at least 50 characters)');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch('/api/admin/oem-research/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          research_text: researchText,
          save_to_db: saveToDb
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        alert(data.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to analyze research');
    } finally {
      setAnalyzing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const copyAllLinks = async () => {
    if (!result) return;
    const allLinks = result.products
      .flatMap(p => p.searchUrls.map(u => `${p.name}: ${u.url}`))
      .join('\n');
    await navigator.clipboard.writeText(allLinks);
    alert('All links copied!');
  };

  const exportToCsv = () => {
    if (!result) return;
    const rows = [
      ['Product', 'Category', 'Chinese Keyword', '1688 URL', 'Margin'].join(','),
      ...result.products.flatMap(p => 
        p.searchUrls.map(u => 
          [
            `"${p.name}"`,
            p.category,
            `"${u.keyword}"`,
            u.url,
            p.priceRange?.margin || ''
          ].join(',')
        )
      )
    ].join('\n');
    
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `1688-links-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/oem-research"
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-amber-500" />
              Research → 1688 Links
            </h1>
            <p className="text-gray-600 mt-1">
              Paste your deep dive research, get factory search links instantly
            </p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">Paste Your Research</h2>
          <p className="text-sm text-gray-500">
            Paste product research, market analysis, or any text mentioning products. 
            The system will extract products and generate 1688 factory search links.
          </p>
        </div>
        <div className="p-4">
          <textarea
            value={researchText}
            onChange={(e) => setResearchText(e.target.value)}
            rows={12}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent font-mono text-sm"
            placeholder="Paste your research here...

Example: 
- TikTok trending products analysis
- Amazon bestseller research  
- Product sourcing notes
- Competitor analysis
- Market research documents

The system will extract products like 'Stanley Cup', 'massage gun', 'LED skincare devices' and generate Chinese keywords with 1688 search links."
          />
          
          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={saveToDb}
                onChange={(e) => setSaveToDb(e.target.checked)}
                className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              Save to OEM Research database
            </label>
            
            <button
              onClick={handleAnalyze}
              disabled={analyzing || researchText.length < 50}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {analyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Generate 1688 Links
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <>
          {/* Summary */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Analysis Complete!</h2>
                <p className="opacity-90">
                  Found {result.summary.productsFound} products across {result.summary.categoriesDetected.length} categories
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{result.summary.totalSearchLinks}</div>
                <div className="text-sm opacity-90">1688 Links Generated</div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2 flex-wrap">
              {result.summary.topCategories.map((cat, i) => (
                <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {cat}
                </span>
              ))}
            </div>
            
            <div className="mt-4 flex gap-3">
              <button
                onClick={copyAllLinks}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm"
              >
                <Copy className="h-4 w-4" />
                Copy All Links
              </button>
              <button
                onClick={exportToCsv}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-green-50">
              <h2 className="font-semibold text-green-900 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Links - Top Products
              </h2>
              <p className="text-sm text-green-700">Click to open in 1688, or copy the link</p>
            </div>
            <div className="divide-y">
              {result.quickLinks.map((link, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-900">{link.product}</div>
                    <div className="text-sm text-gray-500 font-mono">{link.keyword}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(link.url)}
                      className={`p-2 rounded-lg transition ${
                        copiedUrl === link.url 
                          ? 'bg-green-100 text-green-600' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {copiedUrl === link.url ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open 1688
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Products */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Factory className="h-5 w-5 text-amber-500" />
                All Extracted Products ({result.products.length})
              </h2>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {result.products.map((product, i) => (
                <div key={i} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{product.name}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {product.category}
                        </span>
                        {product.priceRange && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {product.priceRange.margin} margin
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex gap-2 flex-wrap">
                        {product.chineseKeywords.map((kw, j) => (
                          <span key={j} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-sm font-mono">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Search URLs */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {product.searchUrls.map((url, j) => (
                      <div 
                        key={j}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-700 truncate">
                            {url.keyword}
                          </div>
                          <div className="text-xs text-gray-400 truncate">
                            {url.url}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(url.url)}
                          className={`p-1.5 rounded transition flex-shrink-0 ${
                            copiedUrl === url.url 
                              ? 'bg-green-100 text-green-600' 
                              : 'hover:bg-gray-200 text-gray-500'
                          }`}
                        >
                          {copiedUrl === url.url ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                        <a
                          href={url.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition flex-shrink-0"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Tips */}
      {!result && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Tips for Best Results</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Paste product research that mentions specific products (e.g., "Stanley Cup", "massage gun")</li>
            <li>• Include price information if you have it (e.g., "source $15, sell $60")</li>
            <li>• The system recognizes 50+ common products and translates them to Chinese keywords</li>
            <li>• Look for 源头厂家 (Source Factory) badges when browsing 1688 results</li>
            <li>• Use the "热销排序" links to find top-selling factories</li>
          </ul>
        </div>
      )}
    </div>
  );
}
