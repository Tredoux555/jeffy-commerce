'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Variant {
  name: string;
  image?: string;
  in_stock: boolean;
  price_adjustment?: number;
  sku_suffix?: string;
  attributes?: Record<string, string>;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelectVariant: (variant: Variant) => void;
  basePrice: number;
}

export function VariantSelector({ variants, selectedVariant, onSelectVariant, basePrice }: VariantSelectorProps) {
  // Remove duplicates by name
  const uniqueVariants = variants.reduce((acc: Variant[], curr) => {
    if (!acc.find(v => v.name === curr.name)) {
      acc.push(curr);
    }
    return acc;
  }, []);

  if (uniqueVariants.length === 0) return null;

  // Check if variants have images
  const hasImages = uniqueVariants.some(v => v.image);

  return (
    <div className="mb-6">
      <label className="block font-medium mb-3">
        Select Option: <span className="text-[#ff6b35]">{selectedVariant?.name || 'Choose one'}</span>
      </label>

      {hasImages ? (
        // Image-based variant selector
        <div className="flex flex-wrap gap-3">
          {uniqueVariants.map((variant, idx) => (
            <button
              key={`${variant.name}-${idx}`}
              onClick={() => onSelectVariant(variant)}
              disabled={!variant.in_stock}
              className={`relative group ${!variant.in_stock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                selectedVariant?.name === variant.name 
                  ? 'border-[#ff6b35] ring-2 ring-[#ff6b35]/30' 
                  : 'border-gray-200 hover:border-gray-400'
              }`}>
                {variant.image ? (
                  <img
                    src={variant.image}
                    alt={variant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    {variant.name.slice(0, 3)}
                  </div>
                )}
              </div>
              {!variant.in_stock && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-medium rounded-lg">
                  Out
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
        // Text-based variant selector
        <div className="flex flex-wrap gap-2">
          {uniqueVariants.map((variant, idx) => (
            <button
              key={`${variant.name}-${idx}`}
              onClick={() => onSelectVariant(variant)}
              disabled={!variant.in_stock}
              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                selectedVariant?.name === variant.name
                  ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-[#ff6b35]'
                  : variant.in_stock
                    ? 'border-gray-200 hover:border-gray-400 text-gray-700'
                    : 'border-gray-100 text-gray-400 cursor-not-allowed line-through'
              }`}
            >
              {variant.name}
              {variant.price_adjustment && variant.price_adjustment !== 0 && (
                <span className="ml-1 text-xs">
                  ({variant.price_adjustment > 0 ? '+' : ''}R{(variant.price_adjustment / 100).toFixed(0)})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {uniqueVariants.length > 10 && (
        <p className="text-sm text-gray-500 mt-2">
          {uniqueVariants.length} options available
        </p>
      )}
    </div>
  );
}
