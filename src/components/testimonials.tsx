'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  rating: number;
  text: string;
  date: string;
  productName?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Thabo M.',
    location: 'Johannesburg',
    rating: 5,
    text: 'Amazing quality products at unbeatable prices! Delivery was super fast and the packaging was excellent. Will definitely order again.',
    date: '2 weeks ago'
  },
  {
    id: '2',
    name: 'Naledi K.',
    location: 'Cape Town',
    rating: 5,
    text: 'I was skeptical at first, but Jeffy exceeded my expectations. The products are exactly as described and customer service is top-notch!',
    date: '1 month ago'
  },
  {
    id: '3',
    name: 'Sipho N.',
    location: 'Durban',
    rating: 4,
    text: 'Great value for money. The delivery took a bit longer than expected but the quality makes up for it. Highly recommend!',
    date: '3 weeks ago'
  },
  {
    id: '4',
    name: 'Lerato P.',
    location: 'Pretoria',
    rating: 5,
    text: 'Best online shopping experience in SA! Easy to navigate, great prices, and my order arrived perfectly. Thank you Jeffy!',
    date: '1 week ago'
  }
];

export function TestimonialCarousel({ testimonials = defaultTestimonials }: { testimonials?: Testimonial[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const next = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((i) => (i + 1) % testimonials.length);
  };

  const prev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-8 relative">
      <Quote className="absolute top-4 left-4 h-12 w-12 text-[#ff6b35]/20" />
      
      <div className="text-center max-w-2xl mx-auto">
        {/* Stars */}
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${i < current.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>

        {/* Quote */}
        <p className="text-lg text-gray-700 mb-6 italic">"{current.text}"</p>

        {/* Author */}
        <div className="flex items-center justify-center gap-3">
          {current.avatar ? (
            <Image src={current.avatar} alt={current.name} width={48} height={48} className="rounded-full" />
          ) : (
            <div className="w-12 h-12 bg-[#ff6b35] rounded-full flex items-center justify-center text-white font-bold">
              {current.name.charAt(0)}
            </div>
          )}
          <div className="text-left">
            <p className="font-medium">{current.name}</p>
            <p className="text-sm text-gray-500">{current.location} • {current.date}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-50"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow hover:bg-gray-50"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIsAutoPlaying(false); setCurrentIndex(i); }}
            className={`w-2 h-2 rounded-full transition ${
              i === currentIndex ? 'bg-[#ff6b35] w-6' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Testimonial grid
export function TestimonialGrid({ testimonials = defaultTestimonials }: { testimonials?: Testimonial[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <div key={testimonial.id} className="bg-white border rounded-xl p-6">
          <div className="flex gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              />
            ))}
          </div>
          
          <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
          
          <div className="flex items-center gap-3 pt-4 border-t">
            <div className="w-10 h-10 bg-[#ff6b35] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {testimonial.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-sm">{testimonial.name}</p>
              <p className="text-xs text-gray-500">{testimonial.location}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Trust stats
export function TrustStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
      <div className="text-center">
        <p className="text-3xl font-bold text-[#ff6b35]">10,000+</p>
        <p className="text-sm text-gray-600">Happy Customers</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-[#ff6b35]">4.8/5</p>
        <p className="text-sm text-gray-600">Average Rating</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-[#ff6b35]">50,000+</p>
        <p className="text-sm text-gray-600">Orders Delivered</p>
      </div>
      <div className="text-center">
        <p className="text-3xl font-bold text-[#ff6b35]">98%</p>
        <p className="text-sm text-gray-600">Satisfaction Rate</p>
      </div>
    </div>
  );
}
