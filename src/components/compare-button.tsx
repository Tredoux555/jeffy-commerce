'use client';

import { useState } from 'react';
import { Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompareStore } from '@/lib/compare-store';

interface CompareButtonProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
  };
}

export function CompareButton({ product }: CompareButtonProps) {
  const { items, addItem, removeItem, isInCompare } = useCompareStore();
  const inCompare = isInCompare(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inCompare) {
      removeItem(product.id);
    } else if (items.length < 4) {
      addItem(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition ${
        inCompare 
          ? 'bg-[#ff6b35] text-white' 
          : 'bg-white/90 text-gray-600 hover:bg-white hover:text-[#ff6b35]'
      }`}
      title={inCompare ? 'Remove from compare' : 'Add to compare'}
    >
      <Scale className="h-4 w-4" />
    </button>
  );
}

export function CompareFloatingBar() {
  const { items, clearAll } = useCompareStore();
  const [isVisible, setIsVisible] = useState(true);

  if (items.length === 0 || !isVisible) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-4 left-4 right-4 z-40 max-w-xl mx-auto">
      <div className="bg-[#0f172a] text-white rounded-xl shadow-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-[#ff6b35]" />
            <span className="font-medium">{items.length} items to compare</span>
          </div>
          <button onClick={() => setIsVisible(false)} className="p-1 hover:bg-white/10 rounded">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0"
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">📦</div>
              )}
            </div>
          ))}
          {Array(4 - items.length).fill(0).map((_, i) => (
            <div key={i} className="w-12 h-12 border border-dashed border-white/30 rounded-lg" />
          ))}
        </div>

        <div className="flex gap-2">
          <a href="/compare" className="flex-1">
            <Button size="sm" className="w-full">
              Compare Now
            </Button>
          </a>
          <Button size="sm" variant="outline" onClick={clearAll} className="text-white border-white/30">
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
