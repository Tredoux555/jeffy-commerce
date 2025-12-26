'use client';

import { useState } from 'react';
import { Ruler, X, HelpCircle } from 'lucide-react';

// Size chart data for different product types
const sizeCharts = {
  clothing: {
    title: 'Clothing Size Guide',
    headers: ['Size', 'Chest (cm)', 'Waist (cm)', 'Hips (cm)'],
    rows: [
      ['XS', '82-86', '66-70', '90-94'],
      ['S', '86-92', '70-76', '94-100'],
      ['M', '92-98', '76-82', '100-106'],
      ['L', '98-104', '82-88', '106-112'],
      ['XL', '104-112', '88-96', '112-120'],
      ['XXL', '112-120', '96-104', '120-128'],
    ],
  },
  shoes: {
    title: 'Shoe Size Guide',
    headers: ['SA', 'UK', 'US', 'EU', 'Foot Length (cm)'],
    rows: [
      ['3', '3', '5.5', '36', '22.5'],
      ['4', '4', '6.5', '37', '23.5'],
      ['5', '5', '7.5', '38', '24'],
      ['6', '6', '8.5', '39', '24.5'],
      ['7', '7', '9.5', '40', '25.5'],
      ['8', '8', '10.5', '41', '26'],
      ['9', '9', '11.5', '42', '27'],
      ['10', '10', '12.5', '43', '27.5'],
      ['11', '11', '13.5', '44', '28.5'],
      ['12', '12', '14.5', '45', '29'],
    ],
  },
  kids: {
    title: "Kids' Size Guide",
    headers: ['Age', 'Height (cm)', 'Chest (cm)', 'Waist (cm)'],
    rows: [
      ['2-3Y', '92-98', '52-54', '50-51'],
      ['3-4Y', '98-104', '54-56', '51-52'],
      ['4-5Y', '104-110', '56-58', '52-53'],
      ['5-6Y', '110-116', '58-60', '53-54'],
      ['6-7Y', '116-122', '60-62', '54-55'],
      ['7-8Y', '122-128', '62-64', '55-57'],
      ['8-9Y', '128-134', '64-67', '57-59'],
      ['9-10Y', '134-140', '67-70', '59-61'],
    ],
  },
  rings: {
    title: 'Ring Size Guide',
    headers: ['SA Size', 'Diameter (mm)', 'Circumference (mm)'],
    rows: [
      ['H', '15.3', '48'],
      ['I', '15.7', '49'],
      ['J', '16.1', '50'],
      ['K', '16.5', '52'],
      ['L', '16.9', '53'],
      ['M', '17.3', '54'],
      ['N', '17.7', '56'],
      ['O', '18.1', '57'],
      ['P', '18.5', '58'],
      ['Q', '18.9', '60'],
    ],
  },
};

type SizeChartType = keyof typeof sizeCharts;

interface SizeGuideProps {
  type?: SizeChartType;
  trigger?: React.ReactNode;
}

export function SizeGuide({ type = 'clothing', trigger }: SizeGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const chart = sizeCharts[type];

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1 text-sm text-[#ff6b35] hover:underline"
        >
          <Ruler className="h-4 w-4" />
          Size Guide
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Ruler className="h-5 w-5 text-[#ff6b35]" />
                {chart.title}
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Size Chart Table */}
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    {chart.headers.map((header, i) => (
                      <th key={i} className="px-4 py-3 text-left font-medium">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((row, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      {row.map((cell, j) => (
                        <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-medium' : ''}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* How to Measure */}
            <div className="p-4 bg-gray-50 border-t">
              <h3 className="font-medium mb-2 flex items-center gap-1">
                <HelpCircle className="h-4 w-4" />
                How to Measure
              </h3>
              <MeasuringTips type={type} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MeasuringTips({ type }: { type: SizeChartType }) {
  const tips: Record<SizeChartType, string[]> = {
    clothing: [
      'Chest: Measure around the fullest part of your chest',
      'Waist: Measure around your natural waistline',
      'Hips: Measure around the fullest part of your hips',
    ],
    shoes: [
      'Stand on paper and trace your foot',
      'Measure from heel to longest toe',
      'Measure both feet - sizes may differ',
    ],
    kids: [
      'Measure height without shoes',
      'Measure chest at the widest point',
      'Measure waist at the narrowest point',
    ],
    rings: [
      'Wrap string around your finger',
      'Mark where it meets and measure the length',
      'Compare with the circumference column',
    ],
  };

  return (
    <ul className="text-sm text-gray-600 space-y-1">
      {tips[type].map((tip, i) => (
        <li key={i}>• {tip}</li>
      ))}
    </ul>
  );
}

// Size selector component
interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string | null;
  onSelect: (size: string) => void;
  outOfStock?: string[];
  showGuide?: boolean;
  guideType?: SizeChartType;
}

export function SizeSelector({ 
  sizes, 
  selectedSize, 
  onSelect, 
  outOfStock = [],
  showGuide = true,
  guideType = 'clothing',
}: SizeSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="font-medium">Size</label>
        {showGuide && <SizeGuide type={guideType} />}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isOutOfStock = outOfStock.includes(size);
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              onClick={() => !isOutOfStock && onSelect(size)}
              disabled={isOutOfStock}
              className={`
                min-w-[48px] px-4 py-2 rounded-lg border text-sm font-medium transition
                ${isSelected 
                  ? 'bg-[#ff6b35] text-white border-[#ff6b35]' 
                  : isOutOfStock
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                    : 'bg-white hover:border-[#ff6b35] hover:text-[#ff6b35]'
                }
              `}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
