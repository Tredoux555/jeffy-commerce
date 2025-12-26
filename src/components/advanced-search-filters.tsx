'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Check, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface FilterState {
  search: string;
  categories: string[];
  priceRange: [number, number];
  rating: number | null;
  inStock: boolean;
  onSale: boolean;
  sortBy: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

// Main search with filters
export function AdvancedSearch({
  categories,
  maxPrice = 100000,
  onFilterChange,
}: {
  categories: Category[];
  maxPrice?: number;
  onFilterChange: (filters: FilterState) => void;
}) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    priceRange: [0, maxPrice],
    rating: null,
    inStock: false,
    onSale: false,
    sortBy: 'relevance',
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleCategory = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categories: [],
      priceRange: [0, maxPrice],
      rating: null,
      inStock: false,
      onSale: false,
      sortBy: 'relevance',
    });
  };

  const activeFilterCount = [
    filters.categories.length > 0,
    filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice,
    filters.rating !== null,
    filters.inStock,
    filters.onSale,
  ].filter(Boolean).length;

  return (
    <div>
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
          />
        </div>
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden flex items-center gap-2 px-4 py-3 border rounded-xl"
        >
          <SlidersHorizontal className="h-5 w-5" />
          {activeFilterCount > 0 && (
            <span className="bg-[#ff6b35] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <FilterSidebar
            filters={filters}
            categories={categories}
            maxPrice={maxPrice}
            onToggleCategory={toggleCategory}
            onUpdateFilter={updateFilter}
            onClear={clearFilters}
          />
        </div>

        {/* Results Header */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-sm text-[#ff6b35] hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Active Filters Pills */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.categories.map((catId) => {
                const cat = categories.find(c => c.id === catId);
                return cat ? (
                  <FilterPill key={catId} label={cat.name} onRemove={() => toggleCategory(catId)} />
                ) : null;
              })}
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) && (
                <FilterPill
                  label={`${formatCurrency(filters.priceRange[0])} - ${formatCurrency(filters.priceRange[1])}`}
                  onRemove={() => updateFilter('priceRange', [0, maxPrice])}
                />
              )}
              {filters.rating && (
                <FilterPill label={`${filters.rating}+ stars`} onRemove={() => updateFilter('rating', null)} />
              )}
              {filters.inStock && (
                <FilterPill label="In Stock" onRemove={() => updateFilter('inStock', false)} />
              )}
              {filters.onSale && (
                <FilterPill label="On Sale" onRemove={() => updateFilter('onSale', false)} />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar
                filters={filters}
                categories={categories}
                maxPrice={maxPrice}
                onToggleCategory={toggleCategory}
                onUpdateFilter={updateFilter}
                onClear={clearFilters}
              />
            </div>
            <div className="p-4 border-t sticky bottom-0 bg-white">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-[#ff6b35] text-white py-3 rounded-xl font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Filter sidebar content
function FilterSidebar({
  filters,
  categories,
  maxPrice,
  onToggleCategory,
  onUpdateFilter,
  onClear,
}: {
  filters: FilterState;
  categories: Category[];
  maxPrice: number;
  onToggleCategory: (id: string) => void;
  onUpdateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Categories */}
      <FilterSection title="Categories">
        <div className="space-y-2">
          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat.id)}
                onChange={() => onToggleCategory(cat.id)}
                className="rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
              />
              <span className="flex-1">{cat.name}</span>
              <span className="text-sm text-gray-400">({cat.count})</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              value={filters.priceRange[0] / 100}
              onChange={(e) => onUpdateFilter('priceRange', [parseInt(e.target.value) * 100 || 0, filters.priceRange[1]])}
              placeholder="Min"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
            <span className="text-gray-400 self-center">-</span>
            <input
              type="number"
              value={filters.priceRange[1] / 100}
              onChange={(e) => onUpdateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value) * 100 || maxPrice])}
              placeholder="Max"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Rating">
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => onUpdateFilter('rating', filters.rating === rating ? null : rating)}
              className={`flex items-center gap-2 w-full p-2 rounded-lg transition ${
                filters.rating === rating ? 'bg-orange-50 text-[#ff6b35]' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-sm">& up</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Toggles */}
      <FilterSection title="Availability">
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => onUpdateFilter('inStock', e.target.checked)}
              className="rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
            />
            <span>In Stock Only</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onSale}
              onChange={(e) => onUpdateFilter('onSale', e.target.checked)}
              className="rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
            />
            <span>On Sale</span>
          </label>
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="border-b pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full py-2 font-medium"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-[#ff6b35] rounded-full text-sm">
      {label}
      <button onClick={onRemove} className="hover:bg-orange-200 rounded-full p-0.5">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
