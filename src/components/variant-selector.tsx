'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Variant {
  id: string;
  name: string;
  sku?: string;
  price_cents: number;
  compare_price_cents?: number;
  stock: number;
  options: Record<string, string>; // e.g. { color: 'Red', size: 'M' }
  image_url?: string;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelect: (variant: Variant) => void;
}

// Extract unique options from variants
function getOptionsFromVariants(variants: Variant[]): Record<string, string[]> {
  const options: Record<string, Set<string>> = {};
  
  variants.forEach(variant => {
    Object.entries(variant.options).forEach(([key, value]) => {
      if (!options[key]) options[key] = new Set();
      options[key].add(value);
    });
  });

  return Object.fromEntries(
    Object.entries(options).map(([key, values]) => [key, Array.from(values)])
  );
}

// Find variant matching selected options
function findVariant(variants: Variant[], selectedOptions: Record<string, string>): Variant | null {
  return variants.find(variant => 
    Object.entries(selectedOptions).every(([key, value]) => variant.options[key] === value)
  ) || null;
}

// Check if option is available given current selections
function isOptionAvailable(
  variants: Variant[], 
  optionName: string, 
  optionValue: string, 
  currentSelections: Record<string, string>
): boolean {
  return variants.some(variant => {
    if (variant.options[optionName] !== optionValue) return false;
    if (variant.stock <= 0) return false;
    
    // Check if other selections match
    return Object.entries(currentSelections)
      .filter(([key]) => key !== optionName)
      .every(([key, value]) => variant.options[key] === value);
  });
}

export function VariantSelector({ variants, selectedVariant, onSelect }: VariantSelectorProps) {
  const options = getOptionsFromVariants(variants);
  const optionNames = Object.keys(options);
  
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    // Initialize with first variant's options or empty
    if (selectedVariant) return { ...selectedVariant.options };
    if (variants.length > 0) return { ...variants[0].options };
    return {};
  });

  const handleOptionSelect = (optionName: string, value: string) => {
    const newSelections = { ...selectedOptions, [optionName]: value };
    setSelectedOptions(newSelections);
    
    const variant = findVariant(variants, newSelections);
    if (variant) onSelect(variant);
  };

  return (
    <div className="space-y-4">
      {optionNames.map(optionName => (
        <div key={optionName}>
          <label className="block font-medium mb-2 capitalize">{optionName}</label>
          
          {optionName.toLowerCase() === 'color' ? (
            <ColorSelector
              colors={options[optionName]}
              selected={selectedOptions[optionName]}
              onSelect={(value) => handleOptionSelect(optionName, value)}
              isAvailable={(value) => isOptionAvailable(variants, optionName, value, selectedOptions)}
              variants={variants}
            />
          ) : (
            <ButtonSelector
              options={options[optionName]}
              selected={selectedOptions[optionName]}
              onSelect={(value) => handleOptionSelect(optionName, value)}
              isAvailable={(value) => isOptionAvailable(variants, optionName, value, selectedOptions)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Color swatches selector
interface ColorSelectorProps {
  colors: string[];
  selected: string;
  onSelect: (color: string) => void;
  isAvailable: (color: string) => boolean;
  variants: Variant[];
}

const colorMap: Record<string, string> = {
  'Red': '#ef4444',
  'Blue': '#3b82f6',
  'Green': '#22c55e',
  'Yellow': '#eab308',
  'Purple': '#8b5cf6',
  'Pink': '#ec4899',
  'Orange': '#f97316',
  'Black': '#1f2937',
  'White': '#ffffff',
  'Gray': '#6b7280',
  'Grey': '#6b7280',
  'Navy': '#1e3a5f',
  'Brown': '#92400e',
  'Beige': '#d4b896',
};

function ColorSelector({ colors, selected, onSelect, isAvailable, variants }: ColorSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map(color => {
        const available = isAvailable(color);
        const isSelected = selected === color;
        const hexColor = colorMap[color] || '#6b7280';
        const variant = variants.find(v => v.options.color === color);

        return (
          <button
            key={color}
            onClick={() => available && onSelect(color)}
            disabled={!available}
            className={`relative group ${!available ? 'opacity-40 cursor-not-allowed' : ''}`}
            title={color}
          >
            <div
              className={`w-10 h-10 rounded-full border-2 transition ${
                isSelected ? 'border-[#ff6b35] ring-2 ring-[#ff6b35]/30' : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: hexColor }}
            >
              {isSelected && hexColor !== '#ffffff' && (
                <Check className="h-5 w-5 text-white absolute inset-0 m-auto" />
              )}
              {isSelected && hexColor === '#ffffff' && (
                <Check className="h-5 w-5 text-gray-800 absolute inset-0 m-auto" />
              )}
            </div>
            {!available && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-[2px] bg-gray-400 rotate-45" />
              </div>
            )}
            {/* Tooltip with image preview */}
            {variant?.image_url && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-white rounded-lg shadow-lg border p-1">
                  <img src={variant.image_url} alt={color} className="w-20 h-20 object-cover rounded" />
                  <p className="text-xs text-center mt-1">{color}</p>
                </div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Button selector for size, etc.
interface ButtonSelectorProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  isAvailable: (option: string) => boolean;
}

function ButtonSelector({ options, selected, onSelect, isAvailable }: ButtonSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const available = isAvailable(option);
        const isSelected = selected === option;

        return (
          <button
            key={option}
            onClick={() => available && onSelect(option)}
            disabled={!available}
            className={`
              min-w-[48px] px-4 py-2 rounded-lg border text-sm font-medium transition
              ${isSelected 
                ? 'bg-[#ff6b35] text-white border-[#ff6b35]' 
                : available
                  ? 'bg-white hover:border-[#ff6b35] hover:text-[#ff6b35]'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
              }
            `}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

// Variant price display
export function VariantPrice({ variant }: { variant: Variant | null }) {
  if (!variant) {
    return <p className="text-gray-500">Select options to see price</p>;
  }

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-[#ff6b35]">
        {formatCurrency(variant.price_cents)}
      </span>
      {variant.compare_price_cents && variant.compare_price_cents > variant.price_cents && (
        <>
          <span className="text-lg text-gray-400 line-through">
            {formatCurrency(variant.compare_price_cents)}
          </span>
          <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded">
            -{Math.round((1 - variant.price_cents / variant.compare_price_cents) * 100)}%
          </span>
        </>
      )}
    </div>
  );
}

// Stock indicator
export function VariantStock({ variant }: { variant: Variant | null }) {
  if (!variant) return null;

  if (variant.stock <= 0) {
    return <p className="text-red-500 font-medium">Out of Stock</p>;
  }

  if (variant.stock <= 5) {
    return <p className="text-amber-500">Only {variant.stock} left!</p>;
  }

  return <p className="text-green-500">In Stock</p>;
}
