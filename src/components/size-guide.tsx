'use client';

import { useState } from 'react';
import { Ruler, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SizeGuideProps {
  category?: 'clothing' | 'shoes' | 'accessories';
}

const clothingSizes = {
  headers: ['Size', 'Chest (cm)', 'Waist (cm)', 'Length (cm)'],
  rows: [
    ['XS', '86-91', '71-76', '66'],
    ['S', '91-96', '76-81', '69'],
    ['M', '96-101', '81-86', '72'],
    ['L', '101-106', '86-91', '74'],
    ['XL', '106-111', '91-96', '76'],
    ['XXL', '111-116', '96-101', '78'],
  ]
};

const shoeSizes = {
  headers: ['SA', 'US', 'UK', 'EU', 'CM'],
  rows: [
    ['4', '6', '5', '38', '24'],
    ['5', '7', '6', '39', '24.5'],
    ['6', '8', '7', '40', '25'],
    ['7', '9', '8', '41', '26'],
    ['8', '10', '9', '42', '27'],
    ['9', '11', '10', '43', '27.5'],
    ['10', '12', '11', '44', '28'],
    ['11', '13', '12', '45', '29'],
  ]
};

export function SizeGuide({ category = 'clothing' }: SizeGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sizeData = category === 'shoes' ? shoeSizes : clothingSizes;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-[#ff6b35] hover:underline"
      >
        <Ruler className="h-4 w-4" />
        Size Guide
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">Size Guide</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-auto max-h-[60vh]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {sizeData.headers.map((header) => (
                      <th key={header} className="p-3 text-left font-medium">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeData.rows.map((row, i) => (
                    <tr key={i} className="border-b">
                      {row.map((cell, j) => (
                        <td key={j} className={`p-3 ${j === 0 ? 'font-medium' : ''}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">How to Measure</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Chest:</strong> Measure around the fullest part</li>
                  <li>• <strong>Waist:</strong> Measure around your natural waistline</li>
                  <li>• <strong>Length:</strong> Measure from shoulder to hem</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 border-t">
              <Button onClick={() => setIsOpen(false)} className="w-full">
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Variant selector with images
interface VariantSelectorProps {
  variants: Array<{
    id: string;
    name: string;
    value: string;
    image?: string;
    available: boolean;
    priceAdjustment?: number;
  }>;
  selected: string;
  onSelect: (id: string) => void;
  type?: 'color' | 'size' | 'default';
}

export function VariantSelector({ variants, selected, onSelect, type = 'default' }: VariantSelectorProps) {
  if (type === 'color') {
    return (
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => variant.available && onSelect(variant.id)}
            disabled={!variant.available}
            className={`relative w-10 h-10 rounded-full border-2 transition ${
              selected === variant.id 
                ? 'border-[#ff6b35] ring-2 ring-[#ff6b35]/30' 
                : 'border-gray-200 hover:border-gray-300'
            } ${!variant.available ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={variant.name}
          >
            {variant.image ? (
              <img src={variant.image} alt={variant.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span 
                className="block w-full h-full rounded-full" 
                style={{ backgroundColor: variant.value }}
              />
            )}
            {!variant.available && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-full h-0.5 bg-gray-400 rotate-45 absolute" />
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((variant) => (
        <button
          key={variant.id}
          onClick={() => variant.available && onSelect(variant.id)}
          disabled={!variant.available}
          className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
            selected === variant.id 
              ? 'border-[#ff6b35] bg-orange-50 text-[#ff6b35]' 
              : 'border-gray-200 hover:border-gray-300'
          } ${!variant.available ? 'opacity-50 cursor-not-allowed line-through' : ''}`}
        >
          {variant.name}
        </button>
      ))}
    </div>
  );
}
