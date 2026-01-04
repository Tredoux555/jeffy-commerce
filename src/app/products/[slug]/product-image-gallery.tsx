'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  discountPercent: number;
  variantImage?: string | null;
}

export function ProductImageGallery({ 
  images, 
  productName, 
  discountPercent,
  variantImage
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [useVariantImage, setUseVariantImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  // When variant changes, show variant image and reset error state
  useEffect(() => {
    setUseVariantImage(true);
    setImageError(false);
  }, [variantImage]);

  // Determine what to display
  const displayImage = (useVariantImage && variantImage && !imageError) 
    ? variantImage 
    : (images[selectedIndex] || images[0]);

  const handleThumbnailClick = (index: number) => {
    setSelectedIndex(index);
    setUseVariantImage(false);
  };

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setUseVariantImage(false);
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setUseVariantImage(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setUseVariantImage(false);
  };

  if (!images.length && !variantImage) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
        No image
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
        <img 
          src={displayImage} 
          alt={productName}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        
        {discountPercent > 0 && (
          <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
            Save {discountPercent}%
          </span>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
            {useVariantImage && variantImage && !imageError ? 'Variant' : `${selectedIndex + 1} / ${images.length}`}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                !useVariantImage && index === selectedIndex 
                  ? 'ring-2 ring-[#ff6b35] ring-offset-2' 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img 
                src={img} 
                alt={`Thumbnail ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
