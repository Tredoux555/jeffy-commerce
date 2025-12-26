'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingCart, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  slug: string;
  selling_price_cents: number;
  compare_at_price_cents?: number | null;
  primary_image_url: string | null;
  images?: string[];
  short_description?: string | null;
  quantity: number;
}

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  if (!isOpen) return null;

  const images = product.images?.length ? product.images : 
    (product.primary_image_url ? [product.primary_image_url] : []);

  const hasDiscount = product.compare_at_price_cents && 
    product.compare_at_price_cents > product.selling_price_cents;
  
  const handleAddToCart = () => {
    addItem(product as any, quantity);
    onClose();
  };

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-gray-100">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`w-2 h-2 rounded-full ${i === selectedImage ? 'bg-[#ff6b35]' : 'bg-white/60'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No image</div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col">
            <h2 className="text-xl font-bold mb-2">{product.name}</h2>
            
            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-[#ff6b35]">
                {formatCurrency(product.selling_price_cents)}
              </span>
              {hasDiscount && (
                <span className="text-gray-400 line-through">
                  {formatCurrency(product.compare_at_price_cents!)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.short_description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {product.short_description}
              </p>
            )}

            {/* Stock */}
            <div className="mb-4">
              {product.quantity > 10 ? (
                <span className="text-green-600 text-sm">✓ In Stock</span>
              ) : product.quantity > 0 ? (
                <span className="text-orange-600 text-sm">Only {product.quantity} left!</span>
              ) : (
                <span className="text-red-600 text-sm">Out of Stock</span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium">Qty:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >-</button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <Button
                onClick={handleAddToCart}
                disabled={product.quantity <= 0}
                className="flex-1"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Link href={`/products/${product.slug}`} onClick={onClose}>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage quick view state
import { create } from 'zustand';

interface QuickViewStore {
  product: Product | null;
  isOpen: boolean;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

export const useQuickView = create<QuickViewStore>((set) => ({
  product: null,
  isOpen: false,
  openQuickView: (product) => set({ product, isOpen: true }),
  closeQuickView: () => set({ isOpen: false, product: null }),
}));
