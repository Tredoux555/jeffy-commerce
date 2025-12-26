'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Check, Eye, Heart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  image: string | null;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  badge?: 'new' | 'sale' | 'bestseller';
}

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export function ProductCarousel({ 
  title, 
  subtitle, 
  products, 
  viewAllLink,
  autoPlay = false,
  autoPlayInterval = 5000
}: ProductCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const itemsPerView = 4; // Can be made responsive
  const maxIndex = Math.max(0, products.length - itemsPerView);

  useEffect(() => {
    if (!autoPlay || isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(i => i >= maxIndex ? 0 : i + 1);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, isHovered, maxIndex]);

  const next = () => setCurrentIndex(i => Math.min(maxIndex, i + 1));
  const prev = () => setCurrentIndex(i => Math.max(0, i - 1));

  if (products.length === 0) return null;

  return (
    <section 
      className="py-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {viewAllLink && (
            <Link href={viewAllLink} className="text-[#ff6b35] font-medium hover:underline mr-4">
              View All →
            </Link>
          )}
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="p-2 rounded-full border hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            disabled={currentIndex >= maxIndex}
            className="p-2 rounded-full border hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Products */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 gap-4"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView + 1)}%)` }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      {/* Dots for mobile */}
      <div className="flex justify-center gap-2 mt-4 md:hidden">
        {Array.from({ length: Math.ceil(products.length / 2) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i * 2)}
            className={`w-2 h-2 rounded-full transition ${
              Math.floor(currentIndex / 2) === i ? 'bg-[#ff6b35] w-6' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product as any, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product.comparePrice 
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  const getBadgeColor = () => {
    switch (product.badge) {
      case 'new': return 'bg-green-500';
      case 'sale': return 'bg-red-500';
      case 'bestseller': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div 
      className="flex-shrink-0 w-[calc(25%-12px)] min-w-[200px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="block group">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">📦</div>
          )}

          {/* Badge */}
          {product.badge && (
            <span className={`absolute top-2 left-2 ${getBadgeColor()} text-white text-xs font-bold px-2 py-1 rounded`}>
              {product.badge.toUpperCase()}
            </span>
          )}

          {/* Discount Badge */}
          {discount > 0 && !product.badge && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}

          {/* Quick Actions */}
          <div className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-2 rounded-lg font-medium text-sm transition ${
                  added 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white text-gray-900 hover:bg-gray-100'
                }`}
              >
                {added ? (
                  <span className="flex items-center justify-center gap-1">
                    <Check className="h-4 w-4" /> Added
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <ShoppingCart className="h-4 w-4" /> Add
                  </span>
                )}
              </button>
              <button className="p-2 bg-white rounded-lg hover:bg-gray-100">
                <Heart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-[#ff6b35] transition mb-1">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600">
                {product.rating.toFixed(1)}
                {product.reviewCount && ` (${product.reviewCount})`}
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-[#ff6b35]">{formatCurrency(product.price)}</span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatCurrency(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {product.inStock === false && (
            <span className="text-xs text-red-600">Out of Stock</span>
          )}
        </div>
      </Link>
    </div>
  );
}

// Featured Products Grid
export function FeaturedProductsGrid({ products, title }: { products: Product[]; title: string }) {
  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

// Hero Product (larger featured product)
export function HeroProduct({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  
  const discount = product.comparePrice 
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
      <div className="grid md:grid-cols-2 gap-6 p-6 md:p-12">
        <div className="flex flex-col justify-center">
          {discount > 0 && (
            <span className="inline-block bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-4 w-fit">
              Save {discount}%
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h2>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-[#ff6b35]">{formatCurrency(product.price)}</span>
            {product.comparePrice && (
              <span className="text-xl text-gray-400 line-through">{formatCurrency(product.comparePrice)}</span>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center gap-2 bg-[#ff6b35] text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition"
            >
              <ShoppingCart className="h-5 w-5" />
              Buy Now
            </Link>
            <button
              onClick={() => addItem(product as any, 1)}
              className="px-6 py-3 border-2 border-[#ff6b35] text-[#ff6b35] rounded-xl font-medium hover:bg-orange-50 transition"
            >
              Add to Cart
            </button>
          </div>
        </div>
        <div className="relative aspect-square md:aspect-auto">
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}
