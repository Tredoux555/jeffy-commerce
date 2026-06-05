'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ProductCard } from '@/components/product-card';
import { Loader2, SlidersHorizontal, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

function ProductsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [sort, setSort] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 100000 });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, sort, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    const supabase = createClient();
    
    let query = supabase
      .from('products')
      .select('*, categories(name, slug), source_data')
      .eq('status', 'active');

    // Search filter
    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    // Category filter
    if (selectedCategory) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', selectedCategory)
        .single();

      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    // Price filter
    if (priceRange.min > 0) {
      query = query.gte('selling_price_cents', priceRange.min * 100);
    }
    if (priceRange.max < 100000) {
      query = query.lte('selling_price_cents', priceRange.max * 100);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query = query.order('selling_price_cents', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('selling_price_cents', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'name_asc':
        query = query.order('name', { ascending: true });
        break;
      default:
        query = query.order('total_sold', { ascending: false });
    }

    const { data } = await query.limit(48);
    
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const supabase = createClient();
    const [{ data }, { data: prodCats }] = await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),
      supabase
        .from('products')
        .select('category_id')
        .eq('status', 'active'),
    ]);

    // Only show categories that actually contain at least one live product
    const nonEmpty = new Set((prodCats || []).map((p: any) => p.category_id).filter(Boolean));
    if (data) {
      setCategories(data.filter((c: any) => nonEmpty.has(c.id)));
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSort('');
    setPriceRange({ min: 0, max: 100000 });
  };

  const hasActiveFilters = selectedCategory || sort || priceRange.min > 0 || priceRange.max < 100000;

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {hasActiveFilters && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Active Filters</span>
            <button onClick={clearFilters} className="text-sm text-[#ff6b35] hover:underline">
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                {categories.find(c => c.slug === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory('')}><X className="h-3 w-3" /></button>
              </span>
            )}
            {sort && (
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                {sort === 'price_asc' ? 'Price ↑' : sort === 'price_desc' ? 'Price ↓' : sort === 'newest' ? 'Newest' : 'A-Z'}
                <button onClick={() => setSort('')}><X className="h-3 w-3" /></button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3">Categories</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setSelectedCategory('')}
              className={`block py-1 text-left w-full text-sm ${!selectedCategory ? 'text-[#ff6b35] font-medium' : 'text-gray-600 hover:text-gray-900'}`}
            >
              All Products
            </button>
          </li>
          {categories?.map((category) => (
            <li key={category.id}>
              <button
                onClick={() => setSelectedCategory(category.slug)}
                className={`block py-1 text-left w-full text-sm ${selectedCategory === category.slug ? 'text-[#ff6b35] font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3">Price Range</h3>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Min</label>
              <input
                type="number"
                placeholder="0"
                value={priceRange.min || ''}
                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-500">Max</label>
              <input
                type="number"
                placeholder="10000"
                value={priceRange.max === 100000 ? '' : priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) || 100000 })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <button
            onClick={fetchProducts}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg transition"
          >
            Apply Price Filter
          </button>
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="font-semibold mb-3">Sort By</h3>
        <ul className="space-y-2">
          {[
            { value: '', label: 'Popular' },
            { value: 'newest', label: 'Newest First' },
            { value: 'price_asc', label: 'Price: Low → High' },
            { value: 'price_desc', label: 'Price: High → Low' },
            { value: 'name_asc', label: 'Name: A → Z' },
          ].map((option) => (
            <li key={option.value}>
              <button
                onClick={() => setSort(option.value)}
                className={`block py-1 text-left w-full text-sm ${sort === option.value ? 'text-[#ff6b35] font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Results Header */}
      {searchQuery && (
        <div className="mb-6 p-4 bg-orange-50 rounded-xl">
          <p className="text-gray-700">
            Search results for: <strong>"{searchQuery}"</strong>
            <span className="text-gray-500 ml-2">({products.length} found)</span>
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 bg-white border rounded-lg px-4 py-2 w-full justify-center"
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filters & Sort
            {hasActiveFilters && <span className="bg-[#ff6b35] text-white text-xs px-2 py-0.5 rounded-full">Active</span>}
          </button>
        </div>

        {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="h-6 w-6" />
                </button>
              </div>
              <FilterSidebar />
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border p-6 sticky top-20">
            <FilterSidebar />
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {selectedCategory 
                ? categories.find(c => c.slug === selectedCategory)?.name || 'Products'
                : 'All Products'}
            </h1>
            <p className="text-gray-500">{products?.length || 0} products</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff6b35]" />
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <p className="text-gray-500 text-lg">No products found</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters</p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="mt-4 text-[#ff6b35] hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#ff6b35]" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
