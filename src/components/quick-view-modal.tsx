'use client';

import { useState } from 'react';
import { X, Eye, ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Star, Minus, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  selling_price_cents: number;
  compare_at_price_cents?: number;
  primary_image_url?: string;
  images?: string[];
  rating?: number;
  review_count?: number;
  stock_quantity?: number;
  variants?: Array<{ name: string; options: string[] }>;
}

interface QuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product, quantity: number, variant?: string) => void;
}

export function QuickViewModal({ product, isOpen, onClose, onAddToCart }: QuickViewProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>();

  const images = product.images?.length ? product.images : [product.primary_image_url || ''];
  const discount = product.compare_at_price_cents 
    ? Math.round((1 - product.selling_price_cents / product.compare_at_price_cents) * 100) 
    : 0;

  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  const handleAddToCart = () => {
    onAddToCart?.(product, quantity, selectedVariant);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-white transition">
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative bg-gray-100 aspect-square md:aspect-auto">
            {images[currentImage] ? (
              <img
                src={images[currentImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
            )}

            {/* Image navigation */}
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`w-2 h-2 rounded-full transition ${idx === currentImage ? 'bg-[#ff6b35]' : 'bg-gray-400'}`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Discount badge */}
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{discount}%
              </span>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 flex flex-col max-h-[70vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(product.rating!) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({product.review_count} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-[#ff6b35]">{formatCurrency(product.selling_price_cents)}</span>
              {product.compare_at_price_cents && (
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.compare_at_price_cents)}</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 mb-6 line-clamp-3">{product.description}</p>
            )}

            {/* Variants */}
            {product.variants?.map((variant) => (
              <div key={variant.name} className="mb-4">
                <label className="block text-sm font-medium mb-2">{variant.name}</label>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedVariant(option)}
                      className={`px-4 py-2 border rounded-lg text-sm transition ${
                        selectedVariant === option ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-[#ff6b35]' : 'hover:border-gray-400'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center border rounded-lg w-fit">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-100">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 font-medium min-w-[60px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-gray-100">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Stock status */}
            {product.stock_quantity !== undefined && (
              <p className={`text-sm mb-4 ${product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-auto pt-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 bg-[#ff6b35] text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </button>
              <button className="p-3 border rounded-xl hover:bg-gray-50">
                <Heart className="h-5 w-5" />
              </button>
              <button className="p-3 border rounded-xl hover:bg-gray-50">
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* View full details link */}
            <a href={`/products/${product.slug}`} className="mt-4 text-center text-sm text-[#ff6b35] hover:underline">
              View Full Details →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick view button for product cards
export function QuickViewButton({ product, onOpen }: { product: Product; onOpen: (product: Product) => void }) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); onOpen(product); }}
      className="absolute top-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 hover:bg-white transition shadow-sm"
      title="Quick View"
    >
      <Eye className="h-4 w-4" />
    </button>
  );
}
