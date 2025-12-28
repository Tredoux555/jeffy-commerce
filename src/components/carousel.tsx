'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Slide {
  id: string;
  image: string;
  mobileImage?: string;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  align?: 'left' | 'center' | 'right';
  textColor?: 'light' | 'dark';
}

const defaultSlides: Slide[] = [
  {
    id: '1',
    image: '/images/hero-1.jpg',
    title: 'Eish, These Prices!',
    subtitle: 'Up to 70% Off',
    description: 'Shop the best deals from China, delivered to your door in SA.',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    align: 'left',
    textColor: 'light'
  },
  {
    id: '2',
    image: '/images/hero-2.jpg',
    title: 'New Arrivals',
    subtitle: 'Fresh Stock Weekly',
    description: 'Discover trending products at unbeatable prices.',
    buttonText: 'View Collection',
    buttonLink: '/products?sort=newest',
    align: 'center',
    textColor: 'dark'
  },
  {
    id: '3',
    image: '/images/hero-3.jpg',
    title: 'Free Shipping',
    subtitle: 'On Orders Over R500',
    description: 'Fast, reliable delivery across South Africa.',
    buttonText: 'Learn More',
    buttonLink: '/shipping',
    align: 'right',
    textColor: 'light'
  }
];

interface HeroCarouselProps {
  slides?: Slide[];
  autoPlay?: boolean;
  interval?: number;
}

export function HeroCarousel({ 
  slides = defaultSlides, 
  autoPlay = true, 
  interval = 5000 
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length, interval]);

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const next = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((i) => (i + 1) % slides.length);
  };

  const prev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((i) => (i - 1 + slides.length) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  const alignClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right'
  };

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-900">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className={`absolute inset-0 ${
              slide.textColor === 'light' ? 'bg-black/40' : 'bg-white/20'
            }`} />
          </div>

          {/* Content */}
          <div className={`relative h-full container mx-auto px-4 flex flex-col justify-center ${alignClasses[slide.align || 'left']}`}>
            <div className="max-w-xl">
              {slide.subtitle && (
                <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 ${
                  slide.textColor === 'light' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-black/10 text-gray-900'
                }`}>
                  {slide.subtitle}
                </span>
              )}
              <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 ${
                slide.textColor === 'light' ? 'text-white' : 'text-gray-900'
              }`}>
                {slide.title}
              </h1>
              {slide.description && (
                <p className={`text-lg md:text-xl mb-6 ${
                  slide.textColor === 'light' ? 'text-white/90' : 'text-gray-700'
                }`}>
                  {slide.description}
                </p>
              )}
              {slide.buttonText && slide.buttonLink && (
                <Link href={slide.buttonLink}>
                  <Button size="lg" className="text-lg px-8">
                    {slide.buttonText}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition shadow-lg"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition shadow-lg"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Product Carousel
interface ProductCarouselProps {
  title: string;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    image: string | null;
  }>;
  viewAllLink?: string;
}

export function ProductCarousel({ title, products, viewAllLink }: ProductCarouselProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useState<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('product-carousel');
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-[#ff6b35] hover:underline flex items-center gap-1">
            View All
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Carousel */}
      <div className="relative group">
        <div
          id="product-carousel"
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="flex-shrink-0 w-56 group/card"
            >
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover/card:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}
                {product.comparePrice && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    -{Math.round((1 - product.price / product.comparePrice) * 100)}%
                  </span>
                )}
              </div>
              <h3 className="font-medium line-clamp-2 mb-1 group-hover/card:text-[#ff6b35]">
                {product.name}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-[#ff6b35]">{formatCurrency(product.price)}</span>
                {product.comparePrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatCurrency(product.comparePrice)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Scroll Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/3 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition -translate-x-4"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/3 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition translate-x-4"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
