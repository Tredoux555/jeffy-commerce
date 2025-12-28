'use client';

import { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface PriceRange {
  min: number;
  max: number;
}

interface FilterConfig {
  categories: FilterOption[];
  priceRange: { min: number; max: number };
  ratings: FilterOption[];
  availability: FilterOption[];
  brands?: FilterOption[];
  colors?: FilterOption[];
  sizes?: FilterOption[];
}

interface ActiveFilters {
  categories: string[];
  priceRange: PriceRange | null;
  ratings: string[];
  availability: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
}

interface ProductFiltersProps {
  config: FilterConfig;
  activeFilters: ActiveFilters;
  onChange: (filters: ActiveFilters) => void;
  resultCount?: number;
}

export function ProductFilters({ config, activeFilters, onChange, resultCount }: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['categories', 'priceRange']);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localPrice, setLocalPrice] = useState<PriceRange>({
    min: activeFilters.priceRange?.min || config.priceRange.min,
    max: activeFilters.priceRange?.max || config.priceRange.max
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleArrayFilter = (key: keyof ActiveFilters, value: string) => {
    const current = activeFilters[key] as string[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onChange({ ...activeFilters, [key]: updated });
  };

  const applyPriceFilter = () => {
    onChange({ ...activeFilters, priceRange: localPrice });
  };

  const clearAllFilters = () => {
    onChange({
      categories: [],
      priceRange: null,
      ratings: [],
      availability: [],
      brands: [],
      colors: [],
      sizes: []
    });
    setLocalPrice({ min: config.priceRange.min, max: config.priceRange.max });
  };

  const hasActiveFilters = 
    activeFilters.categories.length > 0 ||
    activeFilters.priceRange !== null ||
    activeFilters.ratings.length > 0 ||
    activeFilters.availability.length > 0 ||
    activeFilters.brands.length > 0 ||
    activeFilters.colors.length > 0 ||
    activeFilters.sizes.length > 0;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Clear All */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="text-sm text-[#ff6b35] hover:underline"
        >
          Clear All Filters
        </button>
      )}

      {/* Categories */}
      <FilterSection
        title="Categories"
        expanded={expandedSections.includes('categories')}
        onToggle={() => toggleSection('categories')}
      >
        <div className="space-y-2">
          {config.categories.map((cat) => (
            <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeFilters.categories.includes(cat.value)}
                onChange={() => toggleArrayFilter('categories', cat.value)}
                className="w-4 h-4 text-[#ff6b35] rounded"
              />
              <span className="flex-1">{cat.label}</span>
              {cat.count !== undefined && (
                <span className="text-sm text-gray-400">({cat.count})</span>
              )}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection
        title="Price"
        expanded={expandedSections.includes('priceRange')}
        onToggle={() => toggleSection('priceRange')}
      >
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <label className="text-xs text-gray-500">Min</label>
              <input
                type="number"
                value={localPrice.min / 100}
                onChange={(e) => setLocalPrice({ ...localPrice, min: parseFloat(e.target.value) * 100 })}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
            <span className="text-gray-400 mt-4">-</span>
            <div className="flex-1">
              <label className="text-xs text-gray-500">Max</label>
              <input
                type="number"
                value={localPrice.max / 100}
                onChange={(e) => setLocalPrice({ ...localPrice, max: parseFloat(e.target.value) * 100 })}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
          <Button onClick={applyPriceFilter} size="sm" className="w-full">
            Apply
          </Button>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection
        title="Rating"
        expanded={expandedSections.includes('ratings')}
        onToggle={() => toggleSection('ratings')}
      >
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeFilters.ratings.includes(rating.toString())}
                onChange={() => toggleArrayFilter('ratings', rating.toString())}
                className="w-4 h-4 text-[#ff6b35] rounded"
              />
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="text-sm text-gray-500 ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection
        title="Availability"
        expanded={expandedSections.includes('availability')}
        onToggle={() => toggleSection('availability')}
      >
        <div className="space-y-2">
          {config.availability.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={activeFilters.availability.includes(option.value)}
                onChange={() => toggleArrayFilter('availability', option.value)}
                className="w-4 h-4 text-[#ff6b35] rounded"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Colors */}
      {config.colors && config.colors.length > 0 && (
        <FilterSection
          title="Color"
          expanded={expandedSections.includes('colors')}
          onToggle={() => toggleSection('colors')}
        >
          <div className="flex flex-wrap gap-2">
            {config.colors.map((color) => (
              <button
                key={color.value}
                onClick={() => toggleArrayFilter('colors', color.value)}
                className={`w-8 h-8 rounded-full border-2 transition ${
                  activeFilters.colors.includes(color.value) 
                    ? 'border-[#ff6b35] ring-2 ring-offset-1 ring-[#ff6b35]' 
                    : 'border-gray-200'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Sizes */}
      {config.sizes && config.sizes.length > 0 && (
        <FilterSection
          title="Size"
          expanded={expandedSections.includes('sizes')}
          onToggle={() => toggleSection('sizes')}
        >
          <div className="flex flex-wrap gap-2">
            {config.sizes.map((size) => (
              <button
                key={size.value}
                onClick={() => toggleArrayFilter('sizes', size.value)}
                className={`px-3 py-1.5 border rounded text-sm transition ${
                  activeFilters.sizes.includes(size.value)
                    ? 'border-[#ff6b35] bg-orange-50 text-[#ff6b35]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-4">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </h2>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-24 left-4 z-40 bg-white border shadow-lg rounded-full px-4 py-2 flex items-center gap-2"
      >
        <SlidersHorizontal className="h-5 w-5" />
        Filters
        {hasActiveFilters && (
          <span className="w-5 h-5 bg-[#ff6b35] text-white text-xs rounded-full flex items-center justify-center">
            {activeFilters.categories.length + activeFilters.ratings.length + activeFilters.availability.length}
          </span>
        )}
      </button>

      {/* Mobile Filter Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <FilterContent />
            <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t">
              <Button onClick={() => setMobileOpen(false)} className="w-full">
                Show {resultCount !== undefined ? `${resultCount} Results` : 'Results'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Collapsible filter section
function FilterSection({ 
  title, 
  expanded, 
  onToggle, 
  children 
}: { 
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b pb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown className={`h-4 w-4 transition ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && <div className="pt-2">{children}</div>}
    </div>
  );
}

// Active filter pills
export function ActiveFilterPills({ 
  filters, 
  onRemove 
}: { 
  filters: Array<{ key: string; value: string; label: string }>;
  onRemove: (key: string, value: string) => void;
}) {
  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map((filter, i) => (
        <span
          key={`${filter.key}-${filter.value}-${i}`}
          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
        >
          {filter.label}
          <button
            onClick={() => onRemove(filter.key, filter.value)}
            className="hover:text-red-500"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
