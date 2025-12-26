'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingCart, Heart, Minus, Plus, Eye, Share2, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/cart-store';

interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  description?: string;
  images: string[];
  inStock: boolean;
  quantity?: number;
  variants?: Array<{ id: string; name: string; available: boolean }>;
}

interface QuickViewModalProps {
  product: QuickViewProduct;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const addItem = useCartStore((state) => state.addItem);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    addItem(product as any, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const discount = product.comparePrice 
    ? Math.round((1 - product.price / product.comparePrice) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Gallery */}
          <div className="bg-gray-100 p-6">
            {/* Main Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
              )}
              
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.slice(0, 5).map((image, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      selectedImage === i ? 'border-[#ff6b35]' : 'border-transparent'
                    }`}
                  >
                    <Image src={image} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
            
            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-[#ff6b35]">
                {formatCurrency(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatCurrency(product.comparePrice)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              {product.inStock ? (
                <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full" />
                  In Stock
                </span>
              ) : (
                <span className="text-red-600 text-sm font-medium">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 mb-6 line-clamp-3">{product.description}</p>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Select Option</label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                      disabled={!variant.available}
                      className={`px-4 py-2 border rounded-lg text-sm ${
                        selectedVariant === variant.id 
                          ? 'border-[#ff6b35] bg-orange-50 text-[#ff6b35]' 
                          : variant.available 
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-200 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center border rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-3 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-6 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-3 hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full"
                size="lg"
              >
                {addedToCart ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </>
                )}
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Heart className="h-5 w-5 mr-2" />
                  Wishlist
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>

              <Link
                href={`/products/${product.slug}`}
                className="block text-center text-[#ff6b35] hover:underline text-sm"
                onClick={onClose}
              >
                View Full Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick View Button for Product Cards
export function QuickViewButton({ 
  product, 
  className = '' 
}: { 
  product: QuickViewProduct;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
        className={`p-2 bg-white rounded-full shadow hover:bg-gray-100 transition ${className}`}
        title="Quick View"
      >
        <Eye className="h-4 w-4" />
      </button>

      <QuickViewModal 
        product={product}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
