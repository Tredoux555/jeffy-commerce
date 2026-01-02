'use client';

/**
 * Image Upload Dropzone Component
 * 
 * Drag-and-drop interface for uploading Chinese product images
 * for translation to English.
 */

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadDropzoneProps {
  onUploadComplete: (jobs: Array<{ id: string; filename: string; status: string }>) => void;
  onUploadStart?: () => void;
  onError?: (error: string) => void;
  glossary?: Array<{ source: string; target: string }>;
  productId?: string;
  maxFiles?: number;
  disabled?: boolean;
}

export function ImageUploadDropzone({
  onUploadComplete,
  onUploadStart,
  onError,
  glossary = [],
  productId,
  maxFiles = 20,
  disabled = false,
}: ImageUploadDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    onUploadStart?.();

    try {
      const formData = new FormData();
      acceptedFiles.forEach(file => {
        formData.append('images', file);
      });
      
      if (glossary.length > 0) {
        formData.append('glossary', JSON.stringify(glossary));
      }
      
      if (productId) {
        formData.append('productId', productId);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/translate-images/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      onUploadComplete(result.jobs);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed';
      onError?.(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [onUploadComplete, onUploadStart, onError, glossary, productId]);

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
    maxFiles,
    maxSize: 10 * 1024 * 1024, // 10MB per file
    disabled: disabled || uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${isDragActive && !isDragReject 
          ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
          : isDragReject
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }
        ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      
      {/* Upload Icon */}
      <div className="mb-4">
        <svg
          className={`w-12 h-12 mx-auto ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
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

      {/* Main Text */}
      {uploading ? (
        <div>
          <div className="text-lg font-medium text-gray-700 mb-2">
            Uploading...
          </div>
          {/* Progress Bar */}
          <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="text-sm text-gray-500">
            {uploadProgress}%
          </div>
        </div>
      ) : isDragActive ? (
        <div>
          <div className="text-lg font-medium text-blue-600">
            {isDragReject ? 'Invalid file type!' : 'Drop images here'}
          </div>
          <div className="text-sm text-blue-500 mt-1">
            Release to upload
          </div>
        </div>
      ) : (
        <div>
          <div className="text-lg font-medium text-gray-700">
            Drag & drop Chinese product images
          </div>
          <div className="text-sm text-gray-500 mt-1">
            or click to browse
          </div>
          <div className="text-xs text-gray-400 mt-3">
            PNG, JPG, WebP • Max 10MB each • Up to {maxFiles} images
          </div>
        </div>
      )}

      {/* Chinese to English indicator */}
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
  );
}

