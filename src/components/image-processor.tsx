'use client';

import { useState } from 'react';
import { Loader2, Wand2, Check, X, Eye, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageAnalysis {
  textElements: Array<{
    text: string;
    language: string;
    translation?: string;
    position: string;
    category: string;
    recommendation: string;
    reason: string;
  }>;
  overallQuality: number;
  needsCleaning: boolean;
  cleaningNotes: string;
}

interface ImageProcessorProps {
  imageUrl: string;
  onProcessed?: (result: any) => void;
}

export function ImageProcessor({ imageUrl, onProcessed }: ImageProcessorProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/import/1688/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, action: 'analyze' })
      });
      
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const removeText = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/import/1688/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, action: 'remove-text' })
      });
      
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.analysis);
        if (data.processedUrl) {
          setProcessedUrl(data.processedUrl);
          onProcessed?.({ originalUrl: imageUrl, processedUrl: data.processedUrl });
        }
      } else {
        setError(data.error);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'remove': return 'bg-red-100 text-red-700';
      case 'translate': return 'bg-blue-100 text-blue-700';
      case 'keep': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      {/* Image Preview */}
      <div className="relative aspect-square bg-gray-100">
        <img 
          src={processedUrl || imageUrl} 
          alt="Product" 
          className="w-full h-full object-contain"
        />
        {processedUrl && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
            ✓ Processed
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t">
        <div className="flex gap-2 mb-4">
          <Button 
            onClick={analyzeImage} 
            disabled={loading}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            Analyze Text
          </Button>
          <Button 
            onClick={removeText} 
            disabled={loading}
            size="sm"
            className="flex-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
            Clean Image
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            {/* Quality Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Quality Score</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${analysis.overallQuality >= 7 ? 'bg-green-500' : analysis.overallQuality >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${analysis.overallQuality * 10}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{analysis.overallQuality}/10</span>
              </div>
            </div>

            {/* Cleaning Needed */}
            {analysis.needsCleaning && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-800">Cleaning Recommended</p>
                <p className="text-xs text-orange-600 mt-1">{analysis.cleaningNotes}</p>
              </div>
            )}

            {/* Text Elements Found */}
            {analysis.textElements?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Text Found ({analysis.textElements.length})</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {analysis.textElements.map((el, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded-lg text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{el.text}</p>
                          {el.translation && el.language === 'chinese' && (
                            <p className="text-gray-500 text-xs">→ {el.translation}</p>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getRecommendationColor(el.recommendation)}`}>
                          {el.recommendation}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-1 text-xs text-gray-400">
                        <span>{el.position}</span>
                        <span>•</span>
                        <span>{el.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Batch processor for multiple images
export function BatchImageProcessor({ images, onComplete }: { images: string[], onComplete?: (results: any[]) => void }) {
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  const processAll = async () => {
    setProcessing(true);
    const newResults = [];
    
    for (let i = 0; i < images.length; i++) {
      setCurrent(i);
      try {
        const res = await fetch('/api/import/1688/process-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: images[i], action: 'analyze' })
        });
        const data = await res.json();
        newResults.push({ url: images[i], ...data });
      } catch (e) {
        newResults.push({ url: images[i], error: true });
      }
    }
    
    setResults(newResults);
    setProcessing(false);
    onComplete?.(newResults);
  };

  return (
    <div className="p-4 border rounded-xl bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Batch Image Processor</h3>
        <Button onClick={processAll} disabled={processing}>
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing {current + 1}/{images.length}
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Analyze All ({images.length})
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {images.map((img, i) => (
          <div key={i} className="relative aspect-square bg-gray-100 rounded overflow-hidden">
            <img src={img} alt="" className="w-full h-full object-cover" />
            {results[i] && (
              <div className={`absolute inset-0 flex items-center justify-center ${results[i].success ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {results[i].success ? <Check className="h-6 w-6 text-green-600" /> : <X className="h-6 w-6 text-red-600" />}
              </div>
            )}
            {processing && current === i && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
