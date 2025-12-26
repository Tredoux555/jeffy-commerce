'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, X, GripVertical, Loader2, Check, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary: boolean;
  order: number;
}

interface ProductImageManagerProps {
  images: ProductImage[];
  onUpload: (files: File[]) => Promise<string[]>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (imageIds: string[]) => Promise<void>;
  onSetPrimary: (id: string) => Promise<void>;
  maxImages?: number;
}

export function ProductImageManager({ 
  images, 
  onUpload, 
  onDelete, 
  onReorder, 
  onSetPrimary,
  maxImages = 10 
}: ProductImageManagerProps) {
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.slice(0, remainingSlots);
    
    setUploading(true);
    try {
      await onUpload(filesToUpload);
    } finally {
      setUploading(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...images];
    const [dragged] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, dragged);
    
    await onReorder(newOrder.map(img => img.id));
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#ff6b35] transition">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={uploading || images.length >= maxImages}
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          {uploading ? (
            <Loader2 className="h-10 w-10 text-gray-400 mx-auto mb-2 animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          )}
          <p className="font-medium">{uploading ? 'Uploading...' : 'Click to upload images'}</p>
          <p className="text-sm text-gray-500 mt-1">
            {images.length}/{maxImages} images • PNG, JPG, WebP up to 5MB
          </p>
        </label>
      </div>

      {/* Image Grid */}
      {sortedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {sortedImages.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => { setDraggedIndex(null); setDragOverIndex(null); }}
              className={`relative group aspect-square rounded-xl overflow-hidden border-2 ${
                dragOverIndex === index ? 'border-[#ff6b35] border-dashed' : 
                image.isPrimary ? 'border-[#ff6b35]' : 'border-gray-200'
              } ${draggedIndex === index ? 'opacity-50' : ''}`}
            >
              <Image
                src={image.url}
                alt={image.alt || 'Product image'}
                fill
                className="object-cover"
              />
              
              {/* Primary Badge */}
              {image.isPrimary && (
                <span className="absolute top-2 left-2 bg-[#ff6b35] text-white text-xs px-2 py-0.5 rounded">
                  Primary
                </span>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <GripVertical className="absolute top-2 left-2 h-5 w-5 text-white cursor-grab" />
                
                {!image.isPrimary && (
                  <button
                    onClick={() => onSetPrimary(image.id)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Set as primary"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </button>
                )}
                
                <button
                  onClick={() => onDelete(image.id)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                  title="Delete"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>

              {/* Order Number */}
              <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded">
                {index + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {sortedImages.length === 0 && !uploading && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No images uploaded yet</p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Drag images to reorder. First image is the primary image shown in listings.
        </p>
      </div>
    </div>
  );
}

// Simple image uploader for other uses
export function SimpleImageUploader({ 
  onUpload, 
  currentImage,
  aspectRatio = '1/1',
  placeholder = 'Upload image'
}: { 
  onUpload: (file: File) => Promise<string>;
  currentImage?: string;
  aspectRatio?: string;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const url = await onUpload(file);
      setPreview(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative" style={{ aspectRatio }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="simple-upload"
        disabled={uploading}
      />
      <label
        htmlFor="simple-upload"
        className="absolute inset-0 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#ff6b35] transition overflow-hidden"
      >
        {preview ? (
          <Image src={preview} alt="" fill className="object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <>
                <Upload className="h-8 w-8 mb-2" />
                <span className="text-sm">{placeholder}</span>
              </>
            )}
          </div>
        )}
      </label>
    </div>
  );
}
