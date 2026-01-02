'use client';

/**
 * Translation Job Card Component
 * 
 * Shows the status, progress, and results of an image translation job.
 * Includes before/after comparison slider when complete.
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface TranslationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  originalUrl: string;
  originalFilename?: string;
  translatedUrl?: string;
  processingTimeMs?: number;
  error?: string;
}

interface TranslationJobCardProps {
  job: TranslationJob;
  onRetry?: (jobId: string) => void;
  onDelete?: (jobId: string) => void;
  onUseImage?: (translatedUrl: string) => void;
}

export function TranslationJobCard({
  job,
  onRetry,
  onDelete,
  onUseImage,
}: TranslationJobCardProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isHovering, setIsHovering] = useState(false);

  // Status colors and icons
  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: '⏳',
      label: 'Waiting...',
    },
    processing: {
      color: 'bg-blue-100 text-blue-800',
      icon: '🔄',
      label: 'Translating...',
    },
    completed: {
      color: 'bg-green-100 text-green-800',
      icon: '✅',
      label: 'Complete',
    },
    failed: {
      color: 'bg-red-100 text-red-800',
      icon: '❌',
      label: 'Failed',
    },
  };

  const config = statusConfig[job.status];

  // Handle slider drag
  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovering) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.icon} {config.label}
          </span>
          <span className="text-sm text-gray-600 truncate max-w-[200px]">
            {job.originalFilename || 'Image'}
          </span>
        </div>
        
        {job.processingTimeMs && (
          <span className="text-xs text-gray-400">
            {(job.processingTimeMs / 1000).toFixed(1)}s
          </span>
        )}
      </div>

      {/* Image Area */}
      <div className="relative aspect-video bg-gray-100">
        {job.status === 'completed' && job.translatedUrl ? (
          /* Before/After Comparison Slider */
          <div
            className="relative w-full h-full cursor-col-resize select-none"
            onMouseMove={handleSliderMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* Original Image (Full) */}
            <div className="absolute inset-0">
              <Image
                src={job.originalUrl}
                alt="Original"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            
            {/* Translated Image (Clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <div className="relative w-full h-full" style={{ width: `${100 / (sliderPosition / 100)}%` }}>
                <Image
                  src={job.translatedUrl}
                  alt="Translated"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>

            {/* Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-col-resize"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
              English ✓
            </div>
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
              中文 Original
            </div>
          </div>
        ) : job.status === 'processing' ? (
          /* Processing State */
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="relative w-24 h-24">
              <Image
                src={job.originalUrl}
                alt="Processing"
                fill
                className="object-contain opacity-30"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Translating... {job.progress}%
            </div>
            <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>
        ) : job.status === 'failed' ? (
          /* Error State */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm text-red-600 font-medium">Translation Failed</div>
            <div className="text-xs text-red-400 mt-1 max-w-[250px] text-center">
              {job.error || 'Unknown error'}
            </div>
          </div>
        ) : (
          /* Pending State */
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src={job.originalUrl}
              alt="Pending"
              fill
              className="object-contain opacity-50"
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <div className="text-gray-500 text-sm">Queued for translation</div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {job.status === 'failed' && onRetry && (
            <button
              onClick={() => onRetry(job.id)}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              🔄 Retry
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(job.id)}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Delete
            </button>
          )}
        </div>
        
        {job.status === 'completed' && job.translatedUrl && (
          <div className="flex gap-2">
            <a
              href={job.translatedUrl}
              download
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              ⬇ Download
            </a>
            {onUseImage && (
              <button
                onClick={() => onUseImage(job.translatedUrl!)}
                className="px-3 py-1.5 text-sm bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                ✓ Use This Image
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

