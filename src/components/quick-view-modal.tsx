'use client';

import { useState } from 'react';
import { X, ShoppingCart, Heart, ChevronLeft, ChevronRight, Eye, Check, Minus, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  selling_price_cents: number;
  compare_at_price_cents?: number;
  description?: string;
  images: string[];
  stock: number;
  category?: string;
}

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onAddToWishlist?: (productId: string) => void;
}

export function QuickViewModal({ product, onClose, onAddToCart, onAddToWishlist }: QuickViewModalProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToWishlist, setAddedToWishlist] = useState(false);

  const images = product.images.length > 0 ? product.images : ['/placeholder.jpg'];
  const discount = product.compare_at_price_cents 
    ? Math.round((1 - product.selling_price_cents / product.compare_at_price_cents) * 100)
    : 0;

  const handleAddToCart = () => {
    onAddToCart(product.id, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleAddToWishlist = () => {
    onAddToWishlist?.(product.id);
    setAddedToWishlist(true);
  };

  const nextImage = () => setCurrentImage((i) => (i + 1) % images.length);
  const prevImage = () => setCurrentImage((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-white shadow transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image Gallery */}
          <div className="relative bg-gray-100 aspect-square md:aspect-auto md:h-[500px]">
            <img
              src={images[currentImage]}
              alt={product.name}
              className="w-full h-full object-contain"
            />

            {/* Discount badge */}
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                -{discount}%
              </div>
            )}

            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white shadow"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white shadow"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition ${
                      i === currentImage ? 'border-[#ff6b35]' : 'border-white'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 flex flex-col">
            {/* Category */}
            {product.category && (
              <span className="text-sm text-[#ff6b35] font-medium mb-2">{product.category}</span>
            )}

            {/* Name */}
            <h2 className="text-2xl font-bold mb-3">{product.name}</h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-[#ff6b35]">
                {formatCurrency(product.selling_price_cents)}
              </span>
              {product.compare_at_price_cents && (
                <span className="text-lg text-gray-400 line-through">
                  {formatCurrency(product.compare_at_price_cents)}
                </span>
              )}
            </div>

            {/* Stock status */}
            <div className="mb-4">
              {product.stock > 0 ? (
                product.stock <= 5 ? (
                  <span className="text-amber-600 font-medium">Only {product.stock} left!</span>
                ) : (
                  <span className="text-green-600 font-medium">In Stock</span>
                )
              ) : (
                <span className="text-red-500 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 mb-6 line-clamp-4">{product.description}</p>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || addedToCart}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                  addedToCart 
                    ? 'bg-green-500 text-white' 
                    : 'bg-[#ff6b35] text-white hover:bg-orange-600'
                } disabled:opacity-50`}
              >
                {addedToCart ? (
                  <><Check className="h-5 w-5" /> Added!</>
                ) : (
                  <><ShoppingCart className="h-5 w-5" /> Add to Cart</>
                )}
              </button>
              
              <button
                onClick={handleAddToWishlist}
                className={`p-3 border rounded-xl transition ${
                  addedToWishlist ? 'bg-red-50 border-red-200 text-red-500' : 'hover:bg-gray-50'
                }`}
              >
                <Heart className={`h-5 w-5 ${addedToWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* View full details link */}
            <a
              href={`/products/${product.slug}`}
              className="mt-4 text-center text-[#ff6b35] hover:underline flex items-center justify-center gap-1"
            >
              <Eye className="h-4 w-4" /> View Full Details
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick view button to trigger the modal
interface QuickViewButtonProps {
  onClick: () => void;
  className?: string;
}

export function QuickViewButton({ onClick, className = '' }: QuickViewButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`p-2 bg-white/90 rounded-full shadow hover:bg-white transition ${className}`}
      title="Quick View"
    >
      <Eye className="h-4 w-4" />
    </button>
  );
}
