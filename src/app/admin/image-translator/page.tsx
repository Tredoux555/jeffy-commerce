'use client';

/**
 * Image Analyzer - Chinese Text Detection
 * /admin/image-translator
 * 
 * Uses Claude Vision to detect Chinese text in product images
 * Helps identify which images are "clean" for SA market
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface ChineseText {
  original: string;
  translation: string;
  location: string;
}

interface AnalysisResult {
  original_image_url: string;
  has_chinese: boolean;
  recommendation: 'CLEAN' | 'HAS_CHINESE' | 'MINOR_CHINESE' | 'UNKNOWN';
  chinese_texts: ChineseText[];
  summary: string;
}

export default function ImageTranslatorPage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setAnalyzing(true);
    setError(null);

    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/translate-image', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Analysis failed');
        }

        if (result.success) {
          setResults(prev => [result, ...prev]);
        } else {
          throw new Error(result.error || 'Analysis failed');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        console.error('Analysis error:', err);
      }
    }

    setAnalyzing(false);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024,
    disabled: analyzing,
  });

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case 'CLEAN':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'MINOR_CHINESE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'HAS_CHINESE':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'CLEAN': return '✅';
      case 'MINOR_CHINESE': return '⚠️';
      case 'HAS_CHINESE': return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          🔍 Image Analyzer
        </h1>
        <p className="text-gray-600 mt-1">
          Detect Chinese text in product images • Find clean images for SA market
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive && !isDragReject 
            ? 'border-orange-500 bg-orange-50 scale-[1.01]' 
            : isDragReject
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50'
          }
          ${analyzing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {analyzing ? (
          <div className="py-4">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-3" />
            <div className="text-lg font-medium text-gray-700">
              Analyzing with Claude Vision...
            </div>
          </div>
        ) : isDragActive ? (
          <div className="py-4">
            <div className="text-lg font-medium text-orange-600">
              {isDragReject ? 'Invalid file type!' : 'Drop images here'}
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="text-4xl mb-3">📸</div>
            <div className="text-lg font-medium text-gray-700">
              Drop product images to analyze
            </div>
            <div className="text-sm text-gray-500 mt-1">
              PNG, JPG, WebP • Max 10MB • Claude AI will detect Chinese text
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Results Legend */}
      {results.length > 0 && (
        <div className="flex gap-4 text-sm">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
            ✅ CLEAN - Safe to use
          </span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
            ⚠️ MINOR - Small Chinese text
          </span>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full">
            ❌ HAS_CHINESE - Avoid
          </span>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Analysis Results ({results.length})
          </h2>
          
          <div className="grid gap-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl border-2 overflow-hidden ${getRecommendationStyle(result.recommendation)}`}
              >
                <div className="flex">
                  {/* Image Preview */}
                  <div className="w-48 h-48 relative flex-shrink-0 bg-gray-100">
                    {result.original_image_url ? (
                      <Image
                        src={result.original_image_url}
                        alt="Analyzed image"
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No preview
                      </div>
                    )}
                  </div>

                  {/* Analysis Details */}
                  <div className="flex-1 p-4">
                    {/* Recommendation Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-2xl`}>
                        {getRecommendationIcon(result.recommendation)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getRecommendationStyle(result.recommendation)}`}>
                        {result.recommendation}
                      </span>
                      <span className="text-gray-600">
                        {result.has_chinese ? `${result.chinese_texts?.length || 0} Chinese text(s) found` : 'No Chinese text detected'}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-gray-700 mb-3">
                      {result.summary}
                    </p>

                    {/* Chinese Texts Found */}
                    {result.chinese_texts && result.chinese_texts.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-600">Chinese text found:</div>
                        <div className="space-y-1">
                          {result.chinese_texts.map((text, i) => (
                            <div key={i} className="bg-white/50 rounded p-2 text-sm">
                              <div className="flex gap-2">
                                <span className="text-red-600 font-medium">{text.original}</span>
                                <span className="text-gray-400">→</span>
                                <span className="text-green-700">{text.translation}</span>
                              </div>
                              <div className="text-gray-500 text-xs mt-1">
                                📍 {text.location}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !analyzing && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-lg font-medium text-gray-700">No images analyzed yet</h3>
          <p className="text-gray-500 mt-1">
            Drop product images to check for Chinese text
          </p>
          <div className="mt-4 text-sm text-gray-400">
            Tip: Use this to find clean images for your SA product listings
          </div>
        </div>
      )}
    </div>
  );
}
