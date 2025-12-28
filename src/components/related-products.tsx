'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  selling_price_cents: number;
  compare_at_price_cents: number | null;
  primary_image_url: string | null;
}

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string | null;
}

export function RelatedProducts({ currentProductId, categoryId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      const supabase = createClient();
      
      let query = supabase
        .from('products')
        .select('id, name, slug, selling_price_cents, compare_at_price_cents, primary_image_url')
        .eq('status', 'active')
        .neq('id', currentProductId)
        .limit(4);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data } = await query.order('total_sold', { ascending: false });
      
      if (data && data.length > 0) {
        setProducts(data);
      } else {
        // Fallback to random products if no category matches
        const { data: fallback } = await supabase
          .from('products')
          .select('id, name, slug, selling_price_cents, compare_at_price_cents, primary_image_url')
          .eq('status', 'active')
          .neq('id', currentProductId)
          .order('created_at', { ascending: false })
          .limit(4);
        setProducts(fallback || []);
      }
      setLoading(false);
    }

    fetchRelated();
  }, [currentProductId, categoryId]);

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`}>
            <div className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition group">
              <div className="aspect-square bg-gray-100 relative overflow-hidden">
                {product.primary_image_url ? (
                  <img 
                    src={product.primary_image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>
                )}
                {product.compare_at_price_cents && product.compare_at_price_cents > product.selling_price_cents && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {Math.round((1 - product.selling_price_cents / product.compare_at_price_cents) * 100)}% OFF
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[#ff6b35] font-bold">{formatCurrency(product.selling_price_cents)}</span>
                  {product.compare_at_price_cents && (
                    <span className="text-gray-400 text-sm line-through">{formatCurrency(product.compare_at_price_cents)}</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
