'use client';

import { useState } from 'react';
import { Wand2, Upload, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';

export default function ImageProcessorPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testImages = [
    {
      name: 'Stanley Tumbler (1688)',
      url: 'https://cbu01.alicdn.com/img/ibank/O1CN01HfHmZ51Kj8KSDB5x4_!!2214257338879-0-cib.jpg'
    },
    {
      name: 'Water Bottle',
      url: 'https://cbu01.alicdn.com/img/ibank/2020/023/099/21847990320_1179940267.jpg'
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
        body: JSON.stringify({
          imageUrl,
          options: {
            removeChineseText: true,
            addEnglishTranslation: true,
            outputFormat: 'png'
          }
        })
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Wand2 className="w-8 h-8 text-purple-500" />
          Image Processor — Chinese → English
        </h1>
        <p className="text-gray-600 mt-2">
          Remove Chinese text from 1688 product images and replace with English translations
        </p>
      </div>

      {/* Test Images */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="font-bold mb-4">🧪 Test with Sample Images</h2>
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
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Process Image
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
                Add <code className="bg-red-100 px-1 rounded">GOOGLE_CLOUD_API_KEY</code> to your .env.local
              </p>
            )}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Check className="w-6 h-6 text-green-500" />
            <h2 className="font-bold text-green-700">Processing Complete!</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Original */}
            <div>
              <h3 className="font-medium mb-2 text-gray-600">Original Image</h3>
              <div className="border-2 rounded-xl overflow-hidden bg-gray-100">
                <img 
                  src={result.originalUrl} 
                  alt="Original" 
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Processed */}
            <div>
              <h3 className="font-medium mb-2 text-gray-600">Processed Image</h3>
              <div className="border-2 border-green-300 rounded-xl overflow-hidden bg-gray-100">
                {result.processedUrl ? (
                  <img 
                    src={result.processedUrl} 
                    alt="Processed" 
                    className="w-full h-auto"
                  />
                ) : result.processedBase64 ? (
                  <img 
                    src={`data:image/png;base64,${result.processedBase64}`} 
                    alt="Processed" 
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No processed image available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Text Found */}
          {result.textFound && result.textFound.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-2 text-gray-600">
                Text Detected ({result.textFound.length} regions)
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.textFound.slice(0, 20).map((t: any, i: number) => (
                  <span 
                    key={i} 
                    className={`px-3 py-1 rounded-full text-sm ${
                      /[\u4e00-\u9fff]/.test(t.text)
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {t.text}
                  </span>
                ))}
                {result.textFound.length > 20 && (
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-500">
                    +{result.textFound.length - 20} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Download */}
          {result.processedUrl && (
            <div className="mt-6">
              <a
                href={result.processedUrl}
                target="_blank"
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                <Upload className="w-4 h-4" />
                Download Processed Image
              </a>
            </div>
          )}
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
            <ul className="ml-4 mt-1 text-sm">
              <li>• Go to APIs & Services → Credentials → Create API Key</li>
            </ul>
          </li>
          <li>
            <strong className="text-white">3. Add to .env.local:</strong>
            <pre className="mt-2 bg-slate-900 p-3 rounded-lg text-sm overflow-x-auto">
              GOOGLE_CLOUD_API_KEY=your_api_key_here
            </pre>
          </li>
          <li>
            <strong className="text-white">4. Create Supabase Storage Bucket:</strong>
            <pre className="mt-2 bg-slate-900 p-3 rounded-lg text-sm overflow-x-auto">
              product-images (public bucket)
            </pre>
          </li>
        </ol>
        <div className="mt-4 p-3 bg-slate-700 rounded-lg">
          <p className="text-sm">
            <strong>💰 Cost:</strong> ~$1.50 per 1,000 images (Vision) + ~$20 per 1M characters (Translation)
          </p>
        </div>
      </div>
    </div>
  );
}
