'use client';

/**
 * Image Translation Admin Page
 * /admin/products/translate-images
 * 
 * Translate Chinese product images to English using Alibaba DashScope Qwen-MT-Image
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

interface TranslationResult {
  id: string;
  original_image_url: string;
  translated_image_url: string;
  status: string;
}

export default function TranslateImagesPage() {
  const [uploading, setUploading] = useState(false);
  const [translations, setTranslations] = useState<TranslationResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
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
          throw new Error(result.error || 'Translation failed');
        }

        if (result.success) {
          setTranslations(prev => [result, ...prev]);
        } else {
          throw new Error(result.error || 'Translation failed');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        console.error('Translation error:', err);
      }
    }

    setUploading(false);
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
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            🖼️ Image Translator
          </h1>
          <p className="text-gray-600 mt-1">
            Translate Chinese product images to English for South African market
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
            transition-all duration-200
            ${isDragActive && !isDragReject 
              ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
              : isDragReject
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="mb-4">
            <svg
              className={`w-16 h-16 mx-auto ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {uploading ? (
            <div>
              <div className="text-lg font-medium text-gray-700 mb-2">
                Translating...
              </div>
              <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          ) : isDragActive ? (
            <div>
              <div className="text-lg font-medium text-blue-600">
                {isDragReject ? 'Invalid file type!' : 'Drop images here'}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-lg font-medium text-gray-700">
                Drag & drop Chinese product images
              </div>
              <div className="text-sm text-gray-500 mt-2">
                or click to browse • PNG, JPG, WebP • Max 10MB
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                  中文
                </span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  English
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {translations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Translation Results
            </h2>
            <div className="grid gap-6">
              {translations.map((translation) => (
                <div
                  key={translation.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        ✅ Completed
                      </span>
                    </div>
                  </div>
                  
                  {/* Before/After Comparison */}
                  <div className="grid md:grid-cols-2 gap-4 p-4">
                    {/* Original */}
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Original (中文)
                      </div>
                      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={translation.original_image_url}
                          alt="Original"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>

                    {/* Translated */}
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Translated (English)
                      </div>
                      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        {translation.translated_image_url ? (
                          <Image
                            src={translation.translated_image_url}
                            alt="Translated"
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            Processing...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-4 pb-4 flex gap-2">
                    {translation.translated_image_url && (
                      <>
                        <a
                          href={translation.translated_image_url}
                          download
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                        >
                          ⬇ Download Translated
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(translation.translated_image_url);
                            alert('Image URL copied to clipboard!');
                          }}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          📋 Copy URL
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {translations.length === 0 && !uploading && (
          <div className="mt-8 bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-lg font-medium text-gray-700">No translations yet</h3>
            <p className="text-gray-500 mt-1">
              Upload Chinese product images to see translations here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
