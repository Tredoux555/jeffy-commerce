'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Search, ExternalLink, Copy, Check, TrendingUp, DollarSign, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Keywords {
  cn: string;
  en: string;
  tags: string[];
  reasoning?: string;
}

interface Product1688 {
  id: string;
  title: string;
  titleCn: string;
  price: number;
  priceRange: { min: number; max: number };
  moq: number;
  sales30d: number;
  mainImage: string;
  images: string[];
  supplierName: string;
  supplierRating: number;
  supplierYears: number;
  supplierLocation: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState<Keywords | null>(null);
  const [productUrls, setProductUrls] = useState('');
  const [products, setProducts] = useState<Product1688[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Search, 2: Select Products, 3: AI Analysis
  const [copied, setCopied] = useState(false);

  const optimizeKeywords = async () => {
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
        setStep(2);
      }
    } catch (error) {
      console.error('Failed to optimize keywords:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeProducts = async () => {
    const urls = productUrls.split('\n').map(url => url.trim()).filter(url => url);
    if (urls.length === 0) return;

    setLoading(true);
    try {
      const productPromises = urls.map(async (url) => {
        const response = await fetch('/api/smart-finder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get-product', url }),
        });
        const data = await response.json();
        return data.success ? data.data.product : null;
      });

      const fetchedProducts = (await Promise.all(productPromises)).filter(Boolean);
      setProducts(fetchedProducts);

      if (fetchedProducts.length > 0) {
        // Get AI recommendation
        const analysisResponse = await fetch('/api/smart-finder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'analyze',
            query: searchQuery,
            products: fetchedProducts
          }),
        });

        const analysisData = await analysisResponse.json();
        if (analysisData.success) {
          setRecommendation(analysisData.data.recommendation);
          setPricing(analysisData.data.pricing);
          setStep(3);
        }
      }
    } catch (error) {
      console.error('Failed to analyze products:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyForWhatsApp = () => {
    if (!recommendation || !pricing || products.length === 0) return;

    const recommendedProduct = products.find(p => p.id === recommendation.productId);
    if (!recommendedProduct) return;

    const message = `🛒 New Product Request

Product: ${recommendedProduct.title}
1688 URL: ${recommendedProduct.url}
Cost: ¥${recommendedProduct.price} (~R${pricing.costZar})

AI Recommendation: ${recommendation.reasoning}

Suggested Sell Price: R${pricing.suggestedPrice}
Margin: ${pricing.margin}%

Please confirm availability and shipping cost to SA.`;

    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recommendedProduct = products.find(p => p.id === recommendation?.productId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/procurement">
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
          <p className="text-gray-600">AI-powered product sourcing from 1688.com</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-jeffy-orange' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 1 ? 'bg-jeffy-orange text-white' : 'bg-gray-200'
            }`}>1</div>
            <span className="hidden md:block">Search</span>
          </div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-jeffy-orange' : 'bg-gray-200'}`} />
          <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-jeffy-orange' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 2 ? 'bg-jeffy-orange text-white' : 'bg-gray-200'
            }`}>2</div>
            <span className="hidden md:block">Select Products</span>
          </div>
          <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-jeffy-orange' : 'bg-gray-200'}`} />
          <div className={`flex items-center space-x-2 ${step >= 3 ? 'text-jeffy-orange' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= 3 ? 'bg-jeffy-orange text-white' : 'bg-gray-200'
            }`}>3</div>
            <span className="hidden md:block">AI Analysis</span>
          </div>
        </div>
      </div>

      {/* Step 1: Search */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Step 1: Find Products on 1688</h2>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="e.g., wireless earbuds, stanley tumbler"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && optimizeKeywords()}
            className="flex-1"
          />
          <Button onClick={optimizeKeywords} disabled={loading || !searchQuery}>
            {loading ? 'Optimizing...' : 'Optimize Keywords'}
          </Button>
        </div>

        {keywords && (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h3 className="font-medium mb-2">Optimized Keywords:</h3>
            <div className="space-y-2">
              <p><strong>Chinese:</strong> {keywords.cn}</p>
              <p><strong>English:</strong> {keywords.en}</p>
              {keywords.tags.length > 0 && (
                <p><strong>Tags:</strong> {keywords.tags.join(', ')}</p>
              )}
              {keywords.reasoning && (
                <p className="text-sm text-gray-600 mt-2">{keywords.reasoning}</p>
              )}
            </div>

            <Button
              className="mt-3"
              onClick={() => window.open(`https://s.1688.com/selloffer/offer_search.htm?keywords=${encodeURIComponent(keywords.cn)}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Search on 1688.com
            </Button>
          </div>
        )}
      </div>

      {/* Step 2: Select Products */}
      {step >= 2 && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Step 2: Paste Product URLs</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              1688 Product URLs (one per line)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[120px]"
              placeholder="https://detail.1688.com/offer/123456789.html&#10;https://detail.1688.com/offer/987654321.html"
              value={productUrls}
              onChange={(e) => setProductUrls(e.target.value)}
            />
          </div>

          <Button onClick={analyzeProducts} disabled={loading || !productUrls.trim()}>
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? 'Analyzing...' : 'Get AI Recommendation'}
          </Button>
        </div>
      )}

      {/* Step 3: AI Analysis */}
      {step >= 3 && recommendation && recommendedProduct && pricing && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            AI Recommendation
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Product Details */}
            <div>
              <h3 className="font-medium mb-2">Recommended Product:</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium">{recommendedProduct.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{recommendedProduct.supplierName}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span>¥{recommendedProduct.price}</span>
                  <span>MOQ: {recommendedProduct.moq}</span>
                  <span>Sales: {recommendedProduct.sales30d}</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">AI Reasoning:</h4>
                <p className="text-sm text-gray-700">{recommendation.reasoning}</p>
              </div>
            </div>

            {/* Pricing Analysis */}
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing Breakdown
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cost (CNY)</span>
                  <span>¥{recommendedProduct.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cost (ZAR)</span>
                  <span>R{pricing.costZar}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>R{pricing.shippingZar}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span>Suggested Price</span>
                  <span className="font-semibold text-green-600">R{pricing.suggestedPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Margin</span>
                  <span className="text-green-600">{pricing.margin}%</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-2">Price Analysis:</h4>
                <p className="text-sm text-gray-700">{recommendation.priceAnalysis}</p>
              </div>
            </div>
          </div>

          {/* Scores */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{recommendation.qualityScore}%</div>
              <div className="text-sm text-gray-600">Quality Score</div>
            </div>
            <div className="flex-1 bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{recommendation.valueScore}%</div>
              <div className="text-sm text-gray-600">Value Score</div>
            </div>
          </div>

          {/* WhatsApp Message */}
          <div className="border-t pt-6">
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Send to Chinese Agent
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 font-mono text-sm whitespace-pre-wrap">
{`🛒 New Product Request

Product: ${recommendedProduct.title}
1688 URL: ${recommendedProduct.url}
Cost: ¥${recommendedProduct.price} (~R${pricing.costZar})

AI Recommendation: ${recommendation.reasoning}

Suggested Sell Price: R${pricing.suggestedPrice}
Margin: ${pricing.margin}%

Please confirm availability and shipping cost to SA.`}
            </div>

            <Button onClick={copyForWhatsApp} className="w-full">
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied to Clipboard!' : 'Copy for WhatsApp'}
            </Button>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-medium text-blue-900 mb-2">How Smart Finder Works:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Enter your product idea in English</li>
          <li>AI optimizes keywords for Chinese 1688 search</li>
          <li>Search 1688 manually and paste 2-3 product URLs</li>
          <li>AI analyzes and recommends the best option</li>
          <li>Copy the WhatsApp message for your Chinese agent</li>
        </ul>
      </div>
    </div>
  );
}
