'use client';

import { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export function ImageZoom({ src, alt, className = '' }: ImageZoomProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !isZoomed) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPosition({ x, y });
  }, [isZoomed]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current || !isZoomed) return;
    
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    
    setPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  }, [isZoomed]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden cursor-zoom-in ${className}`}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onClick={() => setIsZoomed(!isZoomed)}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-200 ${
          isZoomed ? 'scale-[2.5]' : 'scale-100'
        }`}
        style={isZoomed ? { transformOrigin: `${position.x}% ${position.y}%` } : undefined}
        draggable={false}
      />
      
      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 bg-black/50 text-white p-2 rounded-lg pointer-events-none">
        {isZoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
      </div>
    </div>
  );
}

// Full-screen lightbox gallery
interface LightboxGalleryProps {
  images: Array<{ src: string; alt: string }>;
  initialIndex?: number;
  onClose: () => void;
}

export function LightboxGallery({ images, initialIndex = 0, onClose }: LightboxGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const goNext = () => setCurrentIndex((i) => (i + 1) % images.length);
  const goPrev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  }, [onClose]);

  // Add keyboard listener
  useState(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      {/* Close button */}
      <button onClick={onClose} className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2">
        <X className="h-8 w-8" />
      </button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 text-white/80 text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="text-white/80 hover:text-white p-2 bg-white/10 rounded-lg">
          <ZoomOut className="h-5 w-5" />
        </button>
        <span className="text-white/80 px-3 py-2">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(3, z + 0.5))} className="text-white/80 hover:text-white p-2 bg-white/10 rounded-lg">
          <ZoomIn className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button onClick={goPrev} className="absolute left-4 text-white/80 hover:text-white p-2 bg-white/10 rounded-full">
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button onClick={goNext} className="absolute right-4 text-white/80 hover:text-white p-2 bg-white/10 rounded-full">
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      {/* Main image */}
      <div className="max-w-[90vw] max-h-[90vh] overflow-auto">
        <img
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          className="max-w-none transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          draggable={false}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                idx === currentIndex ? 'border-white' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
            >
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Product gallery with zoom
interface ProductGalleryProps {
  images: Array<{ src: string; alt: string }>;
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-6xl">
        📦
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main image with zoom */}
        <div
          className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer"
          onClick={() => setShowLightbox(true)}
        >
          <ImageZoom
            src={images[selectedIndex].src}
            alt={images[selectedIndex].alt}
            className="w-full h-full"
          />
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                  idx === selectedIndex ? 'border-[#ff6b35]' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <LightboxGallery
          images={images}
          initialIndex={selectedIndex}
          onClose={() => setShowLightbox(false)}
        />
      )}
    </>
  );
}
