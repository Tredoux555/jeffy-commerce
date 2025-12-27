'use client';

import { useState } from 'react';
import { X, Check, ArrowLeftRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageEnhancePreviewProps {
  originalUrl: string;
  enhancedUrl: string;
  analysis?: {
    mainTitle?: { chinese: string; english: string };
    featuresCount: number;
    recommendation: string;
  };
  onAccept: () => void;
  onReject: () => void;
  isLoading?: boolean;
}

export function ImageEnhancePreview({
  originalUrl,
  enhancedUrl,
  analysis,
  onAccept,
  onReject,
  isLoading
}: ImageEnhancePreviewProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Image Enhancement Preview</h3>
          <button onClick={onReject} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image Comparison */}
        <div className="p-4">
          <div className="relative aspect-square max-h-[400px] mx-auto rounded-xl overflow-hidden bg-gray-100">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
                <p className="mt-4 text-gray-600">Enhancing image...</p>
              </div>
            ) : (
              <>
                <img 
                  src={showOriginal ? originalUrl : enhancedUrl} 
                  alt={showOriginal ? "Original" : "Enhanced"}
                  className="w-full h-full object-contain"
                />
                {/* Toggle indicator */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/70 text-white text-sm rounded-full">
                  {showOriginal ? 'Original' : 'Enhanced'}
                </div>
              </>
            )}
          </div>

          {/* Toggle Button */}
          {!isLoading && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                <ArrowLeftRight className="h-4 w-4" />
                {showOriginal ? 'Show Enhanced' : 'Show Original'}
              </button>
            </div>
          )}
        </div>

        {/* Analysis Info */}
        {analysis && !isLoading && (
          <div className="mx-4 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-medium text-blue-900 mb-2">What was enhanced:</h4>
            {analysis.mainTitle && (
              <div className="text-sm mb-2">
                <span className="text-blue-600">Title:</span>{' '}
                <span className="text-gray-500 line-through">{analysis.mainTitle.chinese}</span>{' '}
                → <span className="text-green-700 font-medium">{analysis.mainTitle.english}</span>
              </div>
            )}
            {analysis.featuresCount > 0 && (
              <p className="text-sm text-blue-700">
                + {analysis.featuresCount} product features translated
              </p>
            )}
            <p className="text-xs text-blue-500 mt-2">{analysis.recommendation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t bg-gray-50">
          <Button
            onClick={onReject}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Keep Original
          </Button>
          <Button
            onClick={onAccept}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            <Check className="h-4 w-4 mr-2" />
            Use Enhanced
          </Button>
        </div>
      </div>
    </div>
  );
}
