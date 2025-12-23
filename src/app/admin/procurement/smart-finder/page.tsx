'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Search, Sparkles, ExternalLink, Plus, Copy, Check, 
  Loader2, TrendingUp, Package, ChevronRight, Zap, Globe, DollarSign, Award, Trash2, Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Product {
  id: string;
  title: string;
  titleCn: string;
  price: number;
  moq: number;
  sales30d: number;
  mainImage: string;
  supplierName: string;
  supplierRating: number;
  url: string;
}

interface Recommendation {
  productId: string;
  reasoning: string;
  priceAnalysis: string;
  qualityScore: number;
  valueScore: number;
}

interface Pricing {
  costZar: number;
  shippingZar: number;
  suggestedPrice: number;
  margin: number;
}

export default function SmartFinderPage() {
  const searchParams = useSearchParams();
  const wantId = searchParams.get('want_id');
  const wantTitle = searchParams.get('want_title');
  const shareCode = searchParams.get('share_code');

  const [step, setStep] = useState<'search' | 'products' | 'results'>('search');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(wantTitle || '');
  const [keywords, setKeywords] = useState<{ cn: string; en: string; tags: string[]; reasoning: string } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [translation, setTranslation] = useState<{ title: string; description: string } | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    url: '',
    title: '',
    titleCn: '',
    price: '',
    moq: '',
    sales30d: '',
    supplierName: '',
    supplierRating: '',
  });

  // Auto-search if coming from a want
  useEffect(() => {
    if (wantTitle && !keywords) {
      handleSearch();
    }
  }, [wantTitle]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/smart-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'optimize-keywords', query: searchQuery }),
      });
      
      const data = await response.json();
      if (data.success) {
        setKeywords(data.data);
        setStep('products');
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen1688 = () => {
    if (keywords?.cn) {
      window.open(`https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(keywords.cn)}`, '_blank');
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.url || !newProduct.title || !newProduct.price) {
      alert('Please fill in URL, Title, and Price');
      return;
    }

    const match = newProduct.url.match(/offer\/(\d+)/);
    const id = match ? match[1] : Date.now().toString();

    const product: Product = {
      id,
      title: newProduct.title,
      titleCn: newProduct.titleCn || newProduct.title,
      price: parseFloat(newProduct.price),
      moq: parseInt(newProduct.moq) || 1,
      sales30d: parseInt(newProduct.sales30d) || 0,
      mainImage: '',
      supplierName: newProduct.supplierName || 'Unknown',
      supplierRating: parseFloat(newProduct.supplierRating) || 0,
      url: newProduct.url,
    };

    setProducts([...products, product]);
    setNewProduct({ url: '', title: '', titleCn: '', price: '', moq: '', sales30d: '', supplierName: '', supplierRating: '' });
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleAnalyze = async () => {
    if (products.length === 0) {
      alert('Add at least one product to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/smart-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', query: searchQuery, products }),
      });
      
      const data = await response.json();
      if (data.success && data.data.recommendation) {
        setRecommendation(data.data.recommendation);
        
        const winner = products.find(p => p.id === data.data.recommendation.productId);
        if (winner) {
          const [transRes, priceRes] = await Promise.all([
            fetch('/api/smart-finder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'translate', titleCn: winner.titleCn }),
            }),
            fetch('/api/smart-finder', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'calculate-pricing', priceCny: winner.price }),
            }),
          ]);
          
          const transData = await transRes.json();
          const priceData = await priceRes.json();
          
          if (transData.success) setTranslation(transData.data.translation);
          if (priceData.success) setPricing(priceData.data.pricing);
        }
        
        setStep('results');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToWant = async () => {
    if (!wantId || !recommendation) return;
    
    const winner = products.find(p => p.id === recommendation.productId);
    if (!winner) return;

    setSaving(true);
    try {
      const response = await fetch('/api/smart-finder/save-to-want', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wantId,
          product: winner,
          recommendation,
          translation,
          pricing,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Product saved to Want! The want has been marked as sourced.');
      } else {
        alert('Failed to save: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save product to want');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyForAgent = () => {
    const winner = products.find(p => p.id === recommendation?.productId);
    if (!winner || !pricing) return;

    const wantInfo = wantId ? `\n🎁 For Want: ${wantTitle} (#${shareCode})` : '';

    const message = `🛒 SMART FINDER RECOMMENDATION${wantInfo}

Product: ${translation?.title || winner.title}
1688 URL: ${winner.url}

📊 Analysis:
- Quality Score: ${recommendation?.qualityScore}/100
- Value Score: ${recommendation?.valueScore}/100
- 30-day Sales: ${winner.sales30d}
- Supplier: ${winner.supplierName} (Rating: ${winner.supplierRating})

💰 Pricing:
- Cost: ¥${winner.price} (~R${pricing.costZar})
- Est. Shipping: R${pricing.shippingZar}
- Suggested Price: R${pricing.suggestedPrice}
- Margin: ${pricing.margin}%

📝 Why this product:
${recommendation?.reasoning}

Please confirm availability and shipping cost to SA.`;

    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep('search');
    setSearchQuery(wantTitle || '');
    setKeywords(null);
    setProducts([]);
    setRecommendation(null);
    setTranslation(null);
    setPricing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={wantId ? "/admin/wants" : "/admin/procurement"}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-jeffy-orange" />
            Smart Product Finder
          </h1>
          <p className="text-gray-600">AI-powered 1688 product research</p>
        </div>
      </div>

      {/* Want Context Banner */}
      {wantId && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-purple-800">Sourcing for Want: {wantTitle}</p>
              <p className="text-sm text-purple-600">Share code: #{shareCode}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm">
        <div className={`flex items-center gap-1 ${step === 'search' ? 'text-jeffy-orange font-medium' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'search' ? 'bg-jeffy-orange text-white' : 'bg-gray-200'}`}>1</div>
          Search
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300" />
        <div className={`flex items-center gap-1 ${step === 'products' ? 'text-jeffy-orange font-medium' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'products' ? 'bg-jeffy-orange text-white' : 'bg-gray-200'}`}>2</div>
          Add Products
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300" />
        <div className={`flex items-center gap-1 ${step === 'results' ? 'text-jeffy-orange font-medium' : 'text-gray-400'}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'results' ? 'bg-jeffy-orange text-white' : 'bg-gray-200'}`}>3</div>
          AI Recommendation
        </div>
      </div>

      {step === 'search' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Search className="h-5 w-5" />
              What product are you looking for?
            </h2>
            
            <div className="flex gap-2">
              <Input
                placeholder="e.g., wireless earbuds, phone case, LED lights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="ml-2">Smart Search</span>
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200 p-6">
            <h3 className="font-semibold mb-4">How Smart Finder Works</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <Globe className="h-6 w-6 text-jeffy-orange" />
                </div>
                <p className="text-sm font-medium">1. Enter English</p>
                <p className="text-xs text-gray-600">Describe what you want</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <Zap className="h-6 w-6 text-jeffy-orange" />
                </div>
                <p className="text-sm font-medium">2. AI Translates</p>
                <p className="text-xs text-gray-600">Optimized Chinese keywords</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <TrendingUp className="h-6 w-6 text-jeffy-orange" />
                </div>
                <p className="text-sm font-medium">3. Compare Products</p>
                <p className="text-xs text-gray-600">Add products from 1688</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <Award className="h-6 w-6 text-jeffy-orange" />
                </div>
                <p className="text-sm font-medium">4. AI Recommends</p>
                <p className="text-xs text-gray-600">Best product for SA market</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'products' && (
        <div className="space-y-6">
          {keywords && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">AI-Optimized Chinese Keywords:</p>
                  <p className="font-mono text-lg mt-1">{keywords.cn}</p>
                  <p className="text-sm text-gray-600">{keywords.en}</p>
                  {keywords.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {keywords.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={handleOpen1688} variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open on 1688
                </Button>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold mb-4">Add Product from 1688</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">1688 URL *</label>
                  <Input
                    placeholder="https://detail.1688.com/offer/..."
                    value={newProduct.url}
                    onChange={(e) => setNewProduct({ ...newProduct, url: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title (English) *</label>
                    <Input
                      placeholder="Product title"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Title (Chinese)</label>
                    <Input
                      placeholder="中文标题"
                      value={newProduct.titleCn}
                      onChange={(e) => setNewProduct({ ...newProduct, titleCn: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Price (¥) *</label>
                    <Input
                      type="number"
                      placeholder="45"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">MOQ</label>
                    <Input
                      type="number"
                      placeholder="2"
                      value={newProduct.moq}
                      onChange={(e) => setNewProduct({ ...newProduct, moq: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">30d Sales</label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={newProduct.sales30d}
                      onChange={(e) => setNewProduct({ ...newProduct, sales30d: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Supplier Name</label>
                    <Input
                      placeholder="Shop name"
                      value={newProduct.supplierName}
                      onChange={(e) => setNewProduct({ ...newProduct, supplierName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Rating (0-5)</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="4.8"
                      value={newProduct.supplierRating}
                      onChange={(e) => setNewProduct({ ...newProduct, supplierRating: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddProduct} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold mb-4">Products to Compare ({products.length})</h2>
              {products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No products added yet</p>
                  <p className="text-sm">Add 2-5 products for best comparison</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                      <div className="w-8 h-8 bg-jeffy-orange text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.title}</p>
                        <p className="text-xs text-gray-500">¥{product.price} · MOQ: {product.moq} · Sales: {product.sales30d}</p>
                      </div>
                      <button onClick={() => handleRemoveProduct(product.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={handleAnalyze} disabled={loading || products.length === 0} className="w-full mt-4" size="lg">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Analyze & Get Recommendation
              </Button>
            </div>
          </div>

          <Button variant="outline" onClick={handleReset}>
            ← Start Over
          </Button>
        </div>
      )}

      {step === 'results' && recommendation && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-500 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-green-800">🏆 AI Recommendation</h2>
            </div>

            {(() => {
              const winner = products.find(p => p.id === recommendation.productId);
              if (!winner) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg">{translation?.title || winner.title}</h3>
                    {translation?.description && (
                      <p className="text-sm text-gray-600 mt-1">{translation.description}</p>
                    )}
                    <a href={winner.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1 mt-2">
                      <ExternalLink className="h-4 w-4" />
                      View on 1688
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Quality Score</p>
                      <p className="text-2xl font-bold text-green-600">{recommendation.qualityScore}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs text-gray-500">Value Score</p>
                      <p className="text-2xl font-bold text-blue-600">{recommendation.valueScore}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Why this product?</p>
                    <p className="text-sm text-gray-600">{recommendation.reasoning}</p>
                  </div>
                </div>
              );
            })()}
          </div>

          {pricing && (
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Breakdown
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Cost (ZAR)</p>
                  <p className="text-2xl font-bold">R{pricing.costZar}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Shipping</p>
                  <p className="text-2xl font-bold">R{pricing.shippingZar}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Suggested Price</p>
                  <p className="text-2xl font-bold text-green-600">R{pricing.suggestedPrice}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Margin</p>
                  <p className="text-2xl font-bold text-blue-600">{pricing.margin}%</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={handleCopyForAgent} variant="outline" className="flex-1">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy for WhatsApp Agent'}
            </Button>
            
            {wantId ? (
              <Button onClick={handleSaveToWant} disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Gift className="h-4 w-4 mr-2" />}
                {saving ? 'Saving...' : 'Save to Want & Mark Sourced'}
              </Button>
            ) : (
              <Link href="/admin/procurement" className="flex-1">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Procurement Order
                </Button>
              </Link>
            )}
          </div>

          <Button variant="outline" onClick={handleReset}>
            ← Start New Search
          </Button>
        </div>
      )}
    </div>
  );
}