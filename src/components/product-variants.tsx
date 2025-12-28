'use client';

import { useState, useMemo } from 'react';
import { Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Variant {
  id: string;
  name: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  options: Record<string, string>; // e.g., { color: 'Red', size: 'M' }
  image?: string;
}

interface VariantOption {
  name: string;
  values: Array<{
    value: string;
    available: boolean;
    swatch?: string; // color hex or image url
  }>;
}

interface ProductVariantSelectorProps {
  variants: Variant[];
  options: VariantOption[];
  onVariantChange: (variant: Variant | null) => void;
  selectedVariant: Variant | null;
}

export function ProductVariantSelector({
  variants,
  options,
  onVariantChange,
  selectedVariant,
}: ProductVariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    if (selectedVariant) return { ...selectedVariant.options };
    // Default to first available option for each
    const defaults: Record<string, string> = {};
    options.forEach(opt => {
      const available = opt.values.find(v => v.available);
      if (available) defaults[opt.name] = available.value;
    });
    return defaults;
  });

  // Find variant matching selected options
  const matchingVariant = useMemo(() => {
    return variants.find(v => 
      Object.entries(selectedOptions).every(([key, value]) => v.options[key] === value)
    ) || null;
  }, [variants, selectedOptions]);

  // Update parent when variant changes
  const handleOptionChange = (optionName: string, value: string) => {
    const newOptions = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newOptions);
    
    const variant = variants.find(v => 
      Object.entries(newOptions).every(([key, val]) => v.options[key] === val)
    );
    onVariantChange(variant || null);
  };

  // Check if a specific option value is available given current selections
  const isOptionAvailable = (optionName: string, value: string) => {
    const testOptions = { ...selectedOptions, [optionName]: value };
    return variants.some(v => 
      Object.entries(testOptions).every(([key, val]) => 
        key === optionName ? v.options[key] === val : !selectedOptions[key] || v.options[key] === val
      ) && v.stock > 0
    );
  };

  return (
    <div className="space-y-6">
      {options.map((option) => (
        <div key={option.name}>
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium">{option.name}</label>
            {selectedOptions[option.name] && (
              <span className="text-sm text-gray-500">{selectedOptions[option.name]}</span>
            )}
          </div>
          
          {/* Color swatches */}
          {option.name.toLowerCase() === 'color' || option.name.toLowerCase() === 'colour' ? (
            <div className="flex flex-wrap gap-2">
              {option.values.map((val) => {
                const isSelected = selectedOptions[option.name] === val.value;
                const isAvailable = isOptionAvailable(option.name, val.value);
                
                return (
                  <button
                    key={val.value}
                    onClick={() => isAvailable && handleOptionChange(option.name, val.value)}
                    disabled={!isAvailable}
                    className={`relative w-10 h-10 rounded-full border-2 transition ${
                      isSelected ? 'border-[#ff6b35] ring-2 ring-[#ff6b35] ring-offset-2' : 'border-gray-200'
                    } ${!isAvailable ? 'opacity-30 cursor-not-allowed' : 'hover:border-gray-400'}`}
                    style={{ backgroundColor: val.swatch || '#ccc' }}
                    title={val.value}
                  >
                    {isSelected && (
                      <Check className={`absolute inset-0 m-auto h-5 w-5 ${
                        isLightColor(val.swatch) ? 'text-gray-800' : 'text-white'
                      }`} />
                    )}
                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-gray-400 rotate-45" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Size/other buttons */
            <div className="flex flex-wrap gap-2">
              {option.values.map((val) => {
                const isSelected = selectedOptions[option.name] === val.value;
                const isAvailable = isOptionAvailable(option.name, val.value);
                
                return (
                  <button
                    key={val.value}
                    onClick={() => isAvailable && handleOptionChange(option.name, val.value)}
                    disabled={!isAvailable}
                    className={`px-4 py-2 border rounded-lg font-medium transition ${
                      isSelected
                        ? 'border-[#ff6b35] bg-orange-50 text-[#ff6b35]'
                        : isAvailable
                        ? 'border-gray-300 hover:border-gray-400'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                    }`}
                  >
                    {val.value}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Selected variant info */}
      {matchingVariant ? (
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">SKU: {matchingVariant.sku}</p>
              {matchingVariant.stock <= 5 && matchingVariant.stock > 0 && (
                <p className="text-sm text-amber-600">Only {matchingVariant.stock} left!</p>
              )}
              {matchingVariant.stock === 0 && (
                <p className="text-sm text-red-600">Out of stock</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatCurrency(matchingVariant.price)}</p>
              {matchingVariant.comparePrice && (
                <p className="text-sm text-gray-400 line-through">{formatCurrency(matchingVariant.comparePrice)}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 rounded-xl text-amber-700 text-sm">
          This combination is not available. Please select different options.
        </div>
      )}
    </div>
  );
}

// Helper to determine if a color is light
function isLightColor(hex?: string): boolean {
  if (!hex) return true;
  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
}

// Quick variant selector (compact version)
export function QuickVariantSelect({ 
  options,
  selected,
  onChange 
}: { 
  options: VariantOption[];
  selected: Record<string, string>;
  onChange: (options: Record<string, string>) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <select
          key={opt.name}
          value={selected[opt.name] || ''}
          onChange={(e) => onChange({ ...selected, [opt.name]: e.target.value })}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">{opt.name}</option>
          {opt.values.filter(v => v.available).map((val) => (
            <option key={val.value} value={val.value}>{val.value}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
