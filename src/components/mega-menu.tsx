'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface MegaMenuCategory {
  name: string;
  slug: string;
  image?: string;
  subcategories?: Array<{ name: string; slug: string }>;
  featured?: Array<{ name: string; slug: string; image: string; price?: number }>;
}

interface MegaMenuProps {
  categories: MegaMenuCategory[];
}

export function MegaMenu({ categories }: MegaMenuProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <nav className="hidden lg:block bg-white border-b relative">
      <div className="container mx-auto px-4">
        <ul className="flex items-center gap-1">
          {categories.map((category) => (
            <li
              key={category.slug}
              className="relative"
              onMouseEnter={() => setActiveCategory(category.slug)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <Link
                href={`/products?category=${category.slug}`}
                className={`flex items-center gap-1 px-4 py-3 font-medium transition ${
                  activeCategory === category.slug ? 'text-[#ff6b35]' : 'text-gray-700 hover:text-[#ff6b35]'
                }`}
              >
                {category.name}
                {category.subcategories && category.subcategories.length > 0 && (
                  <ChevronDown className={`h-4 w-4 transition ${activeCategory === category.slug ? 'rotate-180' : ''}`} />
                )}
              </Link>

              {/* Mega Dropdown */}
              {activeCategory === category.slug && category.subcategories && (
                <div className="absolute top-full left-0 w-[800px] bg-white shadow-2xl rounded-b-xl border-t z-50">
                  <div className="grid grid-cols-4 gap-6 p-6">
                    {/* Subcategories */}
                    <div className="col-span-2">
                      <h3 className="font-bold text-gray-900 mb-3">{category.name}</h3>
                      <ul className="grid grid-cols-2 gap-2">
                        {category.subcategories.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={`/products?category=${sub.slug}`}
                              className="flex items-center gap-2 py-1.5 text-gray-600 hover:text-[#ff6b35] transition"
                            >
                              <ChevronRight className="h-3 w-3" />
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={`/products?category=${category.slug}`}
                        className="inline-block mt-4 text-[#ff6b35] font-medium hover:underline"
                      >
                        View All {category.name} →
                      </Link>
                    </div>

                    {/* Featured Products */}
                    {category.featured && category.featured.length > 0 && (
                      <div className="col-span-2">
                        <h3 className="font-bold text-gray-900 mb-3">Featured</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {category.featured.slice(0, 4).map((product) => (
                            <Link
                              key={product.slug}
                              href={`/products/${product.slug}`}
                              className="group"
                            >
                              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={150}
                                  height={150}
                                  className="w-full h-full object-cover group-hover:scale-105 transition"
                                />
                              </div>
                              <p className="text-sm font-medium line-clamp-1 group-hover:text-[#ff6b35]">
                                {product.name}
                              </p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Category Image */}
                    {category.image && !category.featured && (
                      <div className="col-span-2">
                        <Link href={`/products?category=${category.slug}`}>
                          <div className="relative h-full rounded-xl overflow-hidden">
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-4 left-4 text-white">
                              <p className="font-bold text-lg">{category.name}</p>
                              <p className="text-sm opacity-90">Shop Now →</p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}

          {/* Special Links */}
          <li className="ml-auto">
            <Link href="/products?sale=true" className="px-4 py-3 text-red-600 font-bold hover:underline">
              🔥 Sale
            </Link>
          </li>
          <li>
            <Link href="/products?new=true" className="px-4 py-3 text-green-600 font-medium hover:underline">
              ✨ New Arrivals
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

// Simple horizontal category nav for mobile/tablet
export function CategoryBar({ categories }: { categories: Array<{ name: string; slug: string }> }) {
  return (
    <div className="overflow-x-auto scrollbar-hide border-b">
      <div className="flex gap-1 p-2 min-w-max">
        <Link
          href="/products"
          className="px-4 py-2 rounded-full bg-[#ff6b35] text-white text-sm font-medium whitespace-nowrap"
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium whitespace-nowrap hover:bg-gray-200"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
