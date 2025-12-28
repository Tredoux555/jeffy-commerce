'use client';

import { useState } from 'react';
import { Loader2, Upload, Image as ImageIcon, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageResult {
  originalUrl: string;
  processedUrl?: string;
  chineseTextFound?: string;
  translatedText?: string;
  error?: string;
}

interface ImportResult {
  success: boolean;
  productId?: string;
  editUrl?: string;
  translation?: {
    title: string;
    description: string;
  };
  pricing?: {
    suggestedPriceCents: number;
    margin: number;
  };
  imageDetails?: ImageResult[];
  error?: string;
}

export default function ImportPage() {
  const [testUrl, setTestUrl] = useState('');
  const [testImageUrl, setTestImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [imageResult, setImageResult] = useState<any>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);

  // Check API status
  const checkStatus = async () => {
    try {
      const res = await fetch('/api/import/1688');
      const data = await res.json();
      setApiStatus(data);
    } catch (e) {
      setApiStatus({ error: 'API not reachable' });
    }
  };

  // Test image processing
  const testImageProcessing = async () => {
    if (!testImageUrl) return;
    
    setImageLoading(true);
    setImageResult(null);
    
    try {
      const res = await fetch('/api/import/1688/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: testImageUrl,
          action: 'full-process'
        })
      });
      
      const data = await res.json();
      setImageResult(data);
    } catch (e: any) {
      setImageResult({ success: false, error: e.message });
    } finally {
      setImageLoading(false);
    }
  };

  // Test full import (manual data)
  const testImport = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const testData = {
        url: testUrl || 'https://detail.1688.com/test',
        titleCn: '高品质不锈钢保温杯 双层真空设计 大容量500ml',
        title: '',
        price: 25,
        priceRange: { min: 20, max: 35 },
        moq: 50,
        images: testImageUrl ? [testImageUrl] : [
          'https://cbu01.alicdn.com/img/ibank/O1CN01test.jpg'
        ],
        mainImage: testImageUrl || 'https://cbu01.alicdn.com/img/ibank/O1CN01test.jpg',
        specifications: {
          '材质': '304不锈钢',
          '容量': '500ml',
          '尺寸': '7.5x22cm'
        },
        supplier: {
          name: '义乌市优品贸易有限公司',
          rating: 4.8
        },
        sales30d: 1500,
        scrapedAt: new Date().toISOString()
      };
      
      const res = await fetch('/api/import/1688', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ success: false, error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-2">1688 Import System</h1>
      <p className="text-gray-600 mb-8">Test the Chrome extension API and image processing</p>

      {/* API Status */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">API Status</h2>
          <Button onClick={checkStatus} variant="outline" size="sm">
            Check Status
          </Button>
        </div>
        
        {apiStatus && (
          <div className={`p-4 rounded-lg ${apiStatus.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(apiStatus, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Image Processing Test */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold mb-4">🖼️ Test Image Processing</h2>
        <p className="text-sm text-gray-600 mb-4">
          Paste a 1688 product image URL to test OCR and text removal
        </p>
        
        <div className="flex gap-3 mb-4">
          <Input
            placeholder="https://cbu01.alicdn.com/img/..."
            value={testImageUrl}
            onChange={(e) => setTestImageUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={testImageProcessing} disabled={imageLoading || !testImageUrl}>
            {imageLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            <span className="ml-2">Process</span>
          </Button>
        </div>

        {imageResult && (
          <div className={`p-4 rounded-lg ${imageResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
            {imageResult.success ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Image processed successfully!</span>
                </div>
                
                {imageResult.chineseTextFound && (
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm font-medium text-gray-700">Chinese Text Found:</p>
                    <p className="text-gray-900">{imageResult.chineseTextFound}</p>
                    <p className="text-sm font-medium text-gray-700 mt-2">Translation:</p>
                    <p className="text-[#ff6b35]">{imageResult.translatedText}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Original:</p>
                    <img src={imageResult.originalUrl} alt="Original" className="rounded border w-full" />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Processed:</p>
                    <img src={imageResult.processedUrl} alt="Processed" className="rounded border w-full" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>{imageResult.error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Import Test */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-semibold mb-4">📦 Test Full Import</h2>
        <p className="text-sm text-gray-600 mb-4">
          Tests the complete pipeline: scrape → translate → process images → create product
        </p>
        
        <div className="flex gap-3 mb-4">
          <Input
            placeholder="1688 product URL (optional)"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            className="flex-1"
          />
          <Button onClick={testImport} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <span className="ml-2">Test Import</span>
          </Button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
            {result.success ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Product imported!</span>
                </div>
                
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium">{result.translation?.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{result.translation?.description?.slice(0, 200)}...</p>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <span>Price: <strong>R{((result.pricing?.suggestedPriceCents || 0) / 100).toFixed(2)}</strong></span>
                  <span>Margin: <strong>{result.pricing?.margin}%</strong></span>
                </div>
                
                {result.editUrl && (
                  <a 
                    href={result.editUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#ff6b35] hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Admin
                  </a>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>{result.error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chrome Extension Instructions */}
      <div className="bg-gradient-to-r from-[#ff6b35] to-orange-500 rounded-xl p-6 text-white">
        <h2 className="font-semibold mb-3">🧩 Install Chrome Extension</h2>
        <ol className="space-y-2 text-sm">
          <li>1. Open Chrome → Extensions → Enable Developer Mode</li>
          <li>2. Click "Load unpacked" → Select <code className="bg-white/20 px-1 rounded">chrome-extension</code> folder</li>
          <li>3. Go to any 1688.com product page</li>
          <li>4. Click the orange "Send to Jeffy" button</li>
        </ol>
        <p className="text-xs mt-4 opacity-80">
          Extension folder: /jeffy-mvp/chrome-extension/
        </p>
      </div>
    </div>
  );
}
