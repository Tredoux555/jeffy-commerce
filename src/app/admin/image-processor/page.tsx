'use client';

import { useState } from 'react';
import { Wand2, Loader2, Check, AlertCircle, Languages, Eye } from 'lucide-react';

interface Translation {
  original: string;
  translated: string;
}

interface TextRegion {
  text: string;
  bounds: { x: number; y: number; width: number; height: number };
  translation?: string;
}

interface ProcessResult {
  success: boolean;
  originalUrl: string;
  textFound: TextRegion[];
  chineseTexts: string[];
  translations: Translation[];
  error?: string;
}

export default function ImageProcessorPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testImages = [
    {
      name: 'Stanley Tumbler',
      url: 'https://cbu01.alicdn.com/img/ibank/O1CN01HfHmZ51Kj8KSDB5x4_!!2214257338879-0-cib.jpg'
    },
    {
      name: 'Water Bottle',  
      url: 'https://cbu01.alicdn.com/img/ibank/2020/023/099/21847990320_1179940267.jpg'
    },
    {
      name: 'Phone Case',
      url: 'https://cbu01.alicdn.com/img/ibank/O1CN01qJXK2T1Kj8KS7Kpg4_!!2214257338879-0-cib.jpg'
    }
  ];

  const processImage = async () => {
    if (!imageUrl) return;
    
    setProcessing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/images/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Processing failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setProcessing(false);
    }
  };

  const containsChinese = (text: string) => /[\u4e00-\u9fff]/.test(text);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Languages className="w-8 h-8 text-purple-500" />
          1688 Image Translator
        </h1>
        <p className="text-gray-600 mt-2">
          Detect Chinese text in product images and get English translations
        </p>
      </div>

      {/* Test Images */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-bold mb-4">🧪 Test with Sample 1688 Images</h2>
        <div className="flex flex-wrap gap-3">
          {testImages.map((img) => (
            <button
              key={img.name}
              onClick={() => setImageUrl(img.url)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                imageUrl === img.url 
                  ? 'border-purple-500 bg-purple-50 text-purple-700' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              {img.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-bold mb-4">📷 Image URL</h2>
        <div className="flex gap-3">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://cbu01.alicdn.com/img/... (1688 image URL)"
            className="flex-1 px-4 py-3 border-2 rounded-xl focus:border-purple-500 focus:outline-none"
          />
          <button
            onClick={processImage}
            disabled={!imageUrl || processing}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold rounded-xl flex items-center gap-2"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                Detect Text
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-700">Error</p>
            <p className="text-red-600">{error}</p>
            {error.includes('API key') && (
              <p className="text-sm text-red-500 mt-2">
                Add <code className="bg-red-100 px-1 rounded">GOOGLE_CLOUD_API_KEY</code> to Vercel environment variables
              </p>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-6 h-6 text-green-500" />
              <h2 className="font-bold text-green-700">
                Scan Complete — {result.chineseTexts.length} Chinese text regions found
              </h2>
            </div>
            
            <div className="border-2 rounded-xl overflow-hidden bg-gray-100 max-w-md">
              <img 
                src={result.originalUrl} 
                alt="Product" 
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Translations */}
          {result.translations.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <Languages className="w-5 h-5 text-purple-500" />
                Translations ({result.translations.length})
              </h2>
              <div className="space-y-3">
                {result.translations.map((t, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-red-600 font-medium">{t.original}</p>
                      <p className="text-sm text-gray-500">Chinese</p>
                    </div>
                    <div className="text-2xl">→</div>
                    <div className="flex-1">
                      <p className="text-green-700 font-medium">{t.translated}</p>
                      <p className="text-sm text-gray-500">English</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Text Detected */}
          {result.textFound.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold mb-4">
                All Text Detected ({result.textFound.length} regions)
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.textFound.map((t, i) => (
                  <span 
                    key={i} 
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      containsChinese(t.text)
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                    title={t.translation ? `→ ${t.translation}` : undefined}
                  >
                    {t.text}
                    {t.translation && (
                      <span className="ml-2 text-green-600">→ {t.translation}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* JSON Output for Developers */}
          <details className="bg-slate-800 rounded-xl p-4 text-white">
            <summary className="cursor-pointer font-bold">🔧 Raw JSON Response</summary>
            <pre className="mt-4 text-sm overflow-x-auto text-slate-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="mt-8 bg-slate-800 text-white rounded-xl p-6">
        <h2 className="font-bold text-lg mb-4">⚙️ Setup Instructions</h2>
        <ol className="space-y-3 text-slate-300">
          <li>
            <strong className="text-white">1. Enable APIs in Google Cloud Console:</strong>
            <ul className="ml-4 mt-1 text-sm space-y-1">
              <li>• Cloud Vision API</li>
              <li>• Cloud Translation API</li>
            </ul>
          </li>
          <li>
            <strong className="text-white">2. Create API Key:</strong>
            <p className="ml-4 mt-1 text-sm">APIs & Services → Credentials → Create API Key</p>
          </li>
          <li>
            <strong className="text-white">3. Add to Vercel:</strong>
            <pre className="mt-2 bg-slate-900 p-3 rounded-lg text-sm overflow-x-auto">
              GOOGLE_CLOUD_API_KEY=your_api_key_here
            </pre>
          </li>
        </ol>
        <div className="mt-4 p-3 bg-slate-700 rounded-lg">
          <p className="text-sm">
            <strong>💰 Cost:</strong> Vision API ~$1.50/1000 images, Translation ~$20/1M characters
          </p>
        </div>
      </div>
    </div>
  );
}
