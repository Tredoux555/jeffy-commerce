'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, X, Clock, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  category?: string;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const RECENT_SEARCHES_KEY = 'jeffy-recent-searches';

export function SearchAutocomplete({ placeholder = 'Search products...', onSearch }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) setRecentSearches(JSON.parse(stored));
  }, []);

  // Save recent search
  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Search function with debounce
  const searchProducts = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('id, name, slug, selling_price_cents, primary_image_url, category_id')
        .ilike('name', `%${searchQuery}%`)
        .eq('status', 'active')
        .limit(6);

      setResults(data?.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.selling_price_cents,
        image: p.primary_image_url,
        category: p.category_id
      })) || []);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProducts(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, searchProducts]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (term: string) => {
    saveRecentSearch(term);
    onSearch?.(term);
    setIsOpen(false);
  };

  const popularSearches = ['Stanley Cup', 'Water Bottle', 'Phone Case', 'LED Lights'];

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query) {
              handleSearch(query);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35] bg-white"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border z-50 max-h-[70vh] overflow-hidden">
          {/* Search Results */}
          {query.length >= 2 && results.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-gray-500 uppercase px-2 py-1">Products</p>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={() => { saveRecentSearch(product.name); setIsOpen(false); }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <Image src={product.image} alt="" width={48} height={48} className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-[#ff6b35] font-bold">{formatCurrency(product.price)}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
              
              <Link
                href={`/products?q=${encodeURIComponent(query)}`}
                onClick={() => handleSearch(query)}
                className="block text-center text-[#ff6b35] text-sm py-2 hover:underline"
              >
                View all results for "{query}"
              </Link>
            </div>
          )}

          {/* No Results */}
          {query.length >= 2 && !loading && results.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No products found for "{query}"</p>
            </div>
          )}

          {/* Recent & Popular (when no query) */}
          {query.length < 2 && (
            <div className="p-4 space-y-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Recent Searches
                    </p>
                    <button 
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => { setQuery(term); handleSearch(term); }}
                        className="px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <p className="text-xs text-gray-500 uppercase flex items-center gap-1 mb-2">
                  <TrendingUp className="h-3 w-3" />
                  Popular Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => { setQuery(term); searchProducts(term); }}
                      className="px-3 py-1.5 bg-orange-50 text-[#ff6b35] rounded-full text-sm hover:bg-orange-100"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Mobile Search Overlay
export function MobileSearchOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <SearchAutocomplete onSearch={onClose} />
          <button onClick={onClose} className="text-gray-500">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
