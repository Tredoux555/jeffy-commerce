'use client';

import { useState } from 'react';
import { Ruler, X, Info } from 'lucide-react';

interface SizeChart {
  type: 'clothing' | 'shoes' | 'rings' | 'custom';
  name: string;
  headers: string[];
  rows: Array<{ size: string; measurements: string[] }>;
  tips?: string[];
}

const SIZE_CHARTS: Record<string, SizeChart> = {
  clothing_men: {
    type: 'clothing',
    name: "Men's Clothing",
    headers: ['Size', 'Chest (cm)', 'Waist (cm)', 'Hips (cm)'],
    rows: [
      { size: 'XS', measurements: ['86-91', '71-76', '86-91'] },
      { size: 'S', measurements: ['91-96', '76-81', '91-96'] },
      { size: 'M', measurements: ['96-101', '81-86', '96-101'] },
      { size: 'L', measurements: ['101-106', '86-91', '101-106'] },
      { size: 'XL', measurements: ['106-111', '91-96', '106-111'] },
      { size: 'XXL', measurements: ['111-116', '96-101', '111-116'] },
    ],
    tips: [
      'Measure around the fullest part of your chest',
      'Measure around your natural waistline',
      'Measure around the fullest part of your hips',
    ],
  },
  clothing_women: {
    type: 'clothing',
    name: "Women's Clothing",
    headers: ['Size', 'Bust (cm)', 'Waist (cm)', 'Hips (cm)'],
    rows: [
      { size: 'XS', measurements: ['81-84', '61-64', '86-89'] },
      { size: 'S', measurements: ['84-89', '64-69', '89-94'] },
      { size: 'M', measurements: ['89-94', '69-74', '94-99'] },
      { size: 'L', measurements: ['94-99', '74-79', '99-104'] },
      { size: 'XL', measurements: ['99-104', '79-84', '104-109'] },
      { size: 'XXL', measurements: ['104-109', '84-89', '109-114'] },
    ],
    tips: [
      'Measure around the fullest part of your bust',
      'Measure around your natural waistline',
      'Measure around the fullest part of your hips',
    ],
  },
  shoes_men: {
    type: 'shoes',
    name: "Men's Shoes",
    headers: ['SA', 'UK', 'US', 'EU', 'Foot Length (cm)'],
    rows: [
      { size: '6', measurements: ['6', '6.5', '39', '24.5'] },
      { size: '7', measurements: ['7', '7.5', '40', '25'] },
      { size: '8', measurements: ['8', '8.5', '42', '26'] },
      { size: '9', measurements: ['9', '9.5', '43', '27'] },
      { size: '10', measurements: ['10', '10.5', '44', '28'] },
      { size: '11', measurements: ['11', '11.5', '45', '29'] },
      { size: '12', measurements: ['12', '12.5', '46', '30'] },
    ],
  },
  shoes_women: {
    type: 'shoes',
    name: "Women's Shoes",
    headers: ['SA', 'UK', 'US', 'EU', 'Foot Length (cm)'],
    rows: [
      { size: '3', measurements: ['3', '5', '35', '22'] },
      { size: '4', measurements: ['4', '6', '36', '23'] },
      { size: '5', measurements: ['5', '7', '37', '23.5'] },
      { size: '6', measurements: ['6', '8', '38', '24'] },
      { size: '7', measurements: ['7', '9', '39', '25'] },
      { size: '8', measurements: ['8', '10', '40', '26'] },
    ],
  },
};

interface SizeGuideProps {
  chartType?: keyof typeof SIZE_CHARTS;
  customChart?: SizeChart;
  trigger?: React.ReactNode;
}

export function SizeGuide({ chartType = 'clothing_men', customChart, trigger }: SizeGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChart, setSelectedChart] = useState(chartType);
  
  const chart = customChart || SIZE_CHARTS[selectedChart];

  return (
    <>
      {/* Trigger */}
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

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">Size Guide</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Chart selector */}
            {!customChart && (
              <div className="flex gap-2 p-4 border-b overflow-x-auto">
                {Object.entries(SIZE_CHARTS).map(([key, c]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedChart(key)}
                    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition ${
                      selectedChart === key
                        ? 'bg-[#ff6b35] text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}

            {/* Table */}
            <div className="p-4 overflow-auto max-h-[50vh]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    {chart.headers.map((header, i) => (
                      <th key={i} className="px-4 py-3 text-left font-medium text-gray-600">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((row, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold">{row.size}</td>
                      {row.measurements.map((m, j) => (
                        <td key={j} className="px-4 py-3">{m}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tips */}
            {chart.tips && chart.tips.length > 0 && (
              <div className="p-4 bg-blue-50 border-t">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800 mb-2">How to Measure</p>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {chart.tips.map((tip, i) => (
                        <li key={i}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Inline size selector with guide link
export function SizeSelector({ 
  sizes, 
  selected, 
  onChange,
  chartType,
}: { 
  sizes: string[]; 
  selected?: string; 
  onChange: (size: string) => void;
  chartType?: keyof typeof SIZE_CHARTS;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Size</label>
        <SizeGuide chartType={chartType} />
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onChange(size)}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
              selected === size
                ? 'border-[#ff6b35] bg-[#ff6b35]/10 text-[#ff6b35]'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
