'use client';

import { useState } from 'react';
import { Ruler, X, ChevronDown } from 'lucide-react';

// Size chart data types
interface SizeChart {
  category: string;
  sizes: string[];
  measurements: { label: string; values: Record<string, string> }[];
  tips?: string[];
}

// Common size charts
export const SIZE_CHARTS: Record<string, SizeChart> = {
  'mens-tops': {
    category: "Men's Tops",
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    measurements: [
      { label: 'Chest (cm)', values: { XS: '86-91', S: '91-96', M: '96-101', L: '101-106', XL: '106-111', '2XL': '111-116', '3XL': '116-121' } },
      { label: 'Length (cm)', values: { XS: '66', S: '68', M: '70', L: '72', XL: '74', '2XL': '76', '3XL': '78' } },
      { label: 'Sleeve (cm)', values: { XS: '60', S: '61', M: '62', L: '63', XL: '64', '2XL': '65', '3XL': '66' } },
    ],
    tips: ['Measure your chest at the widest point', 'For a relaxed fit, size up'],
  },
  'womens-tops': {
    category: "Women's Tops",
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    measurements: [
      { label: 'Bust (cm)', values: { XS: '80-84', S: '84-88', M: '88-92', L: '92-96', XL: '96-100', '2XL': '100-104' } },
      { label: 'Waist (cm)', values: { XS: '60-64', S: '64-68', M: '68-72', L: '72-76', XL: '76-80', '2XL': '80-84' } },
      { label: 'Length (cm)', values: { XS: '58', S: '60', M: '62', L: '64', XL: '66', '2XL': '68' } },
    ],
    tips: ['Measure your bust at the fullest point', 'Consider your preferred fit style'],
  },
  'mens-pants': {
    category: "Men's Pants",
    sizes: ['28', '30', '32', '34', '36', '38', '40'],
    measurements: [
      { label: 'Waist (cm)', values: { '28': '71', '30': '76', '32': '81', '34': '86', '36': '91', '38': '96', '40': '101' } },
      { label: 'Hip (cm)', values: { '28': '89', '30': '94', '32': '99', '34': '104', '36': '109', '38': '114', '40': '119' } },
      { label: 'Inseam (cm)', values: { '28': '76', '30': '76', '32': '78', '34': '78', '36': '80', '38': '80', '40': '80' } },
    ],
    tips: ['Measure at your natural waistline', 'Inseam measured from crotch to ankle'],
  },
  'shoes': {
    category: 'Shoes',
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'],
    measurements: [
      { label: 'EU Size', values: { 'UK 6': '39', 'UK 7': '40', 'UK 8': '42', 'UK 9': '43', 'UK 10': '44', 'UK 11': '45', 'UK 12': '46' } },
      { label: 'US Men', values: { 'UK 6': '7', 'UK 7': '8', 'UK 8': '9', 'UK 9': '10', 'UK 10': '11', 'UK 11': '12', 'UK 12': '13' } },
      { label: 'Foot Length (cm)', values: { 'UK 6': '24.5', 'UK 7': '25.4', 'UK 8': '26.2', 'UK 9': '27.1', 'UK 10': '27.9', 'UK 11': '28.8', 'UK 12': '29.6' } },
    ],
    tips: ['Measure your foot in the evening when feet are largest', 'Leave 1cm room at the toe'],
  },
};

// Size Guide Modal
export function SizeGuideModal({ 
  isOpen, 
  onClose, 
  chartType = 'mens-tops' 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  chartType?: keyof typeof SIZE_CHARTS;
}) {
  const [selectedChart, setSelectedChart] = useState<keyof typeof SIZE_CHARTS>(chartType);
  const chart = SIZE_CHARTS[selectedChart];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Ruler className="h-5 w-5 text-[#ff6b35]" />
            Size Guide
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Category Selector */}
        <div className="p-4 border-b bg-gray-50">
          <select
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value as keyof typeof SIZE_CHARTS)}
            className="w-full md:w-auto px-4 py-2 border rounded-lg bg-white"
          >
            {Object.entries(SIZE_CHARTS).map(([key, chart]) => (
              <option key={key} value={key}>{chart.category}</option>
            ))}
          </select>
        </div>

        {/* Size Chart Table */}
        <div className="p-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left font-medium text-gray-600 border">Size</th>
                {chart.sizes.map((size) => (
                  <th key={size} className="px-4 py-3 text-center font-bold border">{size}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chart.measurements.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-medium text-gray-700 border">{row.label}</td>
                  {chart.sizes.map((size) => (
                    <td key={size} className="px-4 py-3 text-center border">{row.values[size]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tips */}
        {chart.tips && chart.tips.length > 0 && (
          <div className="p-4 border-t bg-amber-50">
            <h3 className="font-medium text-amber-800 mb-2">💡 Measuring Tips</h3>
            <ul className="text-sm text-amber-700 space-y-1">
              {chart.tips.map((tip, idx) => (
                <li key={idx}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Size Guide Button
export function SizeGuideButton({ 
  chartType = 'mens-tops',
  className = ''
}: { 
  chartType?: keyof typeof SIZE_CHARTS;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1 text-sm text-[#ff6b35] hover:underline ${className}`}
      >
        <Ruler className="h-4 w-4" />
        Size Guide
      </button>
      <SizeGuideModal isOpen={isOpen} onClose={() => setIsOpen(false)} chartType={chartType} />
    </>
  );
}

// Inline size selector with guide
export function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
  chartType,
  outOfStock = [],
}: {
  sizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
  chartType?: keyof typeof SIZE_CHARTS;
  outOfStock?: string[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="font-medium">Size</label>
        {chartType && <SizeGuideButton chartType={chartType} />}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isOOS = outOfStock.includes(size);
          return (
            <button
              key={size}
              onClick={() => !isOOS && onSelect(size)}
              disabled={isOOS}
              className={`px-4 py-2 border rounded-lg font-medium transition ${
                selectedSize === size
                  ? 'border-[#ff6b35] bg-orange-50 text-[#ff6b35]'
                  : isOOS
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
