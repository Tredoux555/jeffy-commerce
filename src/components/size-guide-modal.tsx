'use client';

import { useState } from 'react';
import { X, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SizeGuideModalProps {
  category?: string;
}

export function SizeGuideModal({ category = 'clothing' }: SizeGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const clothingSizes = [
    { size: 'XS', chest: '81-86', waist: '61-66', hips: '86-91' },
    { size: 'S', chest: '86-91', waist: '66-71', hips: '91-96' },
    { size: 'M', chest: '91-96', waist: '71-76', hips: '96-101' },
    { size: 'L', chest: '96-101', waist: '76-81', hips: '101-106' },
    { size: 'XL', chest: '101-106', waist: '81-86', hips: '106-111' },
    { size: 'XXL', chest: '106-111', waist: '86-91', hips: '111-116' },
  ];

  const shoeSizes = [
    { eu: '36', uk: '3.5', us: '5.5', cm: '23' },
    { eu: '37', uk: '4', us: '6', cm: '23.5' },
    { eu: '38', uk: '5', us: '7', cm: '24' },
    { eu: '39', uk: '5.5', us: '7.5', cm: '24.5' },
    { eu: '40', uk: '6.5', us: '8.5', cm: '25.5' },
    { eu: '41', uk: '7', us: '9', cm: '26' },
    { eu: '42', uk: '8', us: '10', cm: '27' },
    { eu: '43', uk: '9', us: '11', cm: '28' },
    { eu: '44', uk: '10', us: '12', cm: '29' },
  ];

  if (!isOpen) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className="text-[#ff6b35]">
        <Ruler className="h-4 w-4 mr-1" />
        Size Guide
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
      
      <div className="relative bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Ruler className="h-5 w-5 text-[#ff6b35]" />
            Size Guide
          </h2>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Clothing Sizes */}
          <h3 className="font-semibold mb-3">Clothing (cm)</h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Size</th>
                  <th className="px-3 py-2 text-left">Chest</th>
                  <th className="px-3 py-2 text-left">Waist</th>
                  <th className="px-3 py-2 text-left">Hips</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {clothingSizes.map((row) => (
                  <tr key={row.size}>
                    <td className="px-3 py-2 font-medium">{row.size}</td>
                    <td className="px-3 py-2">{row.chest}</td>
                    <td className="px-3 py-2">{row.waist}</td>
                    <td className="px-3 py-2">{row.hips}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Shoe Sizes */}
          <h3 className="font-semibold mb-3">Shoes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">EU</th>
                  <th className="px-3 py-2 text-left">UK</th>
                  <th className="px-3 py-2 text-left">US</th>
                  <th className="px-3 py-2 text-left">CM</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {shoeSizes.map((row) => (
                  <tr key={row.eu}>
                    <td className="px-3 py-2 font-medium">{row.eu}</td>
                    <td className="px-3 py-2">{row.uk}</td>
                    <td className="px-3 py-2">{row.us}</td>
                    <td className="px-3 py-2">{row.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            * Measurements are approximate. When in doubt, size up.
          </p>
        </div>
      </div>
    </div>
  );
}
