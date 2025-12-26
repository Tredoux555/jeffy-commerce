'use client';

import { useState, useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface VariantOption {
  name: string;
  value: string;
  available?: boolean;
  price_adjustment_cents?: number;
  image_url?: string;
}

interface VariantGroup {
  name: string; // e.g., "Color", "Size"
  type: 'button' | 'color' | 'image' | 'dropdown';
  options: VariantOption[];
}

interface ProductVariantSelectorProps {
  variants: VariantGroup[];
  basePrice: number;
  onSelectionChange: (selection: Record<string, string>, adjustedPrice: number) => void;
  initialSelection?: Record<string, string>;
}

export function ProductVariantSelector({ 
  variants, 
  basePrice, 
  onSelectionChange,
  initialSelection = {},
}: ProductVariantSelectorProps) {
  const [selection, setSelection] = useState<Record<string, string>>(initialSelection);
  const [adjustedPrice, setAdjustedPrice] = useState(basePrice);

  useEffect(() => {
    // Calculate price adjustment
    let adjustment = 0;
    variants.forEach(group => {
      const selected = selection[group.name];
      const option = group.options.find(o => o.value === selected);
      if (option?.price_adjustment_cents) {
        adjustment += option.price_adjustment_cents;
      }
    });
    
    const newPrice = basePrice + adjustment;
    setAdjustedPrice(newPrice);
    onSelectionChange(selection, newPrice);
  }, [selection, basePrice, variants, onSelectionChange]);

  const handleSelect = (groupName: string, value: string) => {
    setSelection(prev => ({ ...prev, [groupName]: value }));
  };

  const isComplete = variants.every(group => selection[group.name]);

  return (
    <div className="space-y-6">
      {variants.map((group) => (
        <div key={group.name}>
          <label className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{group.name}</span>
            {selection[group.name] && (
              <span className="text-sm text-gray-500">{selection[group.name]}</span>
            )}
          </label>

          {group.type === 'color' ? (
            <ColorSelector
              options={group.options}
              selected={selection[group.name]}
              onSelect={(value) => handleSelect(group.name, value)}
            />
          ) : group.type === 'image' ? (
            <ImageSelector
              options={group.options}
              selected={selection[group.name]}
              onSelect={(value) => handleSelect(group.name, value)}
            />
          ) : group.type === 'dropdown' ? (
            <DropdownSelector
              options={group.options}
              selected={selection[group.name]}
              onSelect={(value) => handleSelect(group.name, value)}
              placeholder={`Select ${group.name}`}
            />
          ) : (
            <ButtonSelector
              options={group.options}
              selected={selection[group.name]}
              onSelect={(value) => handleSelect(group.name, value)}
            />
          )}
        </div>
      ))}

      {!isComplete && variants.length > 0 && (
        <p className="text-sm text-amber-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          Please select all options
        </p>
      )}
    </div>
  );
}

// Button-style selector (for sizes, etc.)
function ButtonSelector({ options, selected, onSelect }: { 
  options: VariantOption[]; 
  selected?: string; 
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => option.available !== false && onSelect(option.value)}
          disabled={option.available === false}
          className={`px-4 py-2 border rounded-lg text-sm font-medium transition relative ${
            selected === option.value
              ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-[#ff6b35]'
              : option.available === false
                ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {option.value}
          {option.price_adjustment_cents && option.price_adjustment_cents > 0 && (
            <span className="text-xs ml-1">(+{formatCurrency(option.price_adjustment_cents)})</span>
          )}
        </button>
      ))}
    </div>
  );
}

// Color swatch selector
function ColorSelector({ options, selected, onSelect }: {
  options: VariantOption[];
  selected?: string;
  onSelect: (value: string) => void;
}) {
  // Map color names to hex codes
  const colorMap: Record<string, string> = {
    black: '#000000', white: '#ffffff', red: '#ef4444', blue: '#3b82f6',
    green: '#22c55e', yellow: '#eab308', orange: '#f97316', purple: '#8b5cf6',
    pink: '#ec4899', gray: '#6b7280', brown: '#92400e', navy: '#1e3a5a',
    beige: '#f5f5dc', cream: '#fffdd0', gold: '#ffd700', silver: '#c0c0c0',
  };

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const color = colorMap[option.value.toLowerCase()] || option.value;
        const isLight = ['white', 'cream', 'beige', 'yellow'].includes(option.value.toLowerCase());
        
        return (
          <button
            key={option.value}
            onClick={() => option.available !== false && onSelect(option.value)}
            disabled={option.available === false}
            className={`relative w-10 h-10 rounded-full transition ${
              option.available === false ? 'opacity-30 cursor-not-allowed' : ''
            } ${selected === option.value ? 'ring-2 ring-offset-2 ring-[#ff6b35]' : ''}`}
            style={{ backgroundColor: color, border: isLight ? '1px solid #e5e7eb' : 'none' }}
            title={option.value}
          >
            {selected === option.value && (
              <Check className={`h-5 w-5 absolute inset-0 m-auto ${isLight ? 'text-gray-800' : 'text-white'}`} />
            )}
            {option.available === false && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-gray-400 rotate-45" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Image selector (for patterns, styles, etc.)
function ImageSelector({ options, selected, onSelect }: {
  options: VariantOption[];
  selected?: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => option.available !== false && onSelect(option.value)}
          disabled={option.available === false}
          className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
            selected === option.value ? 'border-[#ff6b35]' : 'border-transparent hover:border-gray-300'
          } ${option.available === false ? 'opacity-30 cursor-not-allowed' : ''}`}
        >
          {option.image_url ? (
            <img src={option.image_url} alt={option.value} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs">{option.value}</div>
          )}
          {selected === option.value && (
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#ff6b35] rounded-full flex items-center justify-center">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// Dropdown selector
function DropdownSelector({ options, selected, onSelect, placeholder }: {
  options: VariantOption[];
  selected?: string;
  onSelect: (value: string) => void;
  placeholder: string;
}) {
  return (
    <select
      value={selected || ''}
      onChange={(e) => onSelect(e.target.value)}
      className="w-full border rounded-lg px-4 py-2.5 text-sm"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.available === false}>
          {option.value}
          {option.available === false && ' (Out of Stock)'}
          {option.price_adjustment_cents && option.price_adjustment_cents > 0 && ` (+${formatCurrency(option.price_adjustment_cents)})`}
        </option>
      ))}
    </select>
  );
}
