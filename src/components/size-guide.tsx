'use client';

import { useState } from 'react';
import { Ruler, X } from 'lucide-react';

interface SizeGuideData {
  title: string;
  description?: string;
  headers: string[];
  rows: Array<{ size: string; values: string[] }>;
  tips?: string[];
}

const defaultClothingSizes: SizeGuideData = {
  title: 'Clothing Size Guide',
  headers: ['Size', 'Chest (cm)', 'Waist (cm)', 'Hips (cm)'],
  rows: [
    { size: 'XS', values: ['82-87', '63-68', '87-92'] },
    { size: 'S', values: ['87-92', '68-73', '92-97'] },
    { size: 'M', values: ['92-97', '73-78', '97-102'] },
    { size: 'L', values: ['97-102', '78-83', '102-107'] },
    { size: 'XL', values: ['102-107', '83-88', '107-112'] },
    { size: 'XXL', values: ['107-112', '88-93', '112-117'] },
  ],
  tips: [
    'Measure yourself wearing light clothing',
    'Use a soft measuring tape',
    'If between sizes, order the larger size',
  ],
};

const defaultShoesSizes: SizeGuideData = {
  title: 'Shoe Size Guide',
  headers: ['SA', 'EU', 'UK', 'US', 'CM'],
  rows: [
    { size: '4', values: ['37', '4', '6', '23.5'] },
    { size: '5', values: ['38', '5', '7', '24'] },
    { size: '6', values: ['39', '6', '8', '24.5'] },
    { size: '7', values: ['40', '6.5', '8.5', '25'] },
    { size: '8', values: ['41', '7', '9', '26'] },
    { size: '9', values: ['42', '8', '10', '26.5'] },
    { size: '10', values: ['43', '9', '11', '27'] },
    { size: '11', values: ['44', '10', '12', '28'] },
  ],
};

interface SizeGuideProps {
  type?: 'clothing' | 'shoes' | 'custom';
  customData?: SizeGuideData;
}

export function SizeGuideButton({ type = 'clothing', customData }: SizeGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const data = customData || (type === 'shoes' ? defaultShoesSizes : defaultClothingSizes);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline">
        <Ruler className="h-4 w-4" />
        Size Guide
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-blue-500" />
                <h2 className="text-xl font-bold">{data.title}</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {data.description && <p className="text-gray-600 mb-4">{data.description}</p>}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {data.headers.map((header, i) => (
                        <th key={i} className="px-4 py-3 text-left font-medium">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.rows.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-bold">{row.size}</td>
                        {row.values.map((val, j) => (
                          <td key={j} className="px-4 py-3">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.tips && data.tips.length > 0 && (
                <div className="mt-6 bg-blue-50 rounded-xl p-4">
                  <h4 className="font-bold text-blue-800 mb-2">Measuring Tips</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {data.tips.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { defaultClothingSizes, defaultShoesSizes };
export type { SizeGuideData };
