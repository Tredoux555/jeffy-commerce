'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface UseInfiniteScrollOptions<T> {
  initialData?: T[];
  fetchMore: (page: number) => Promise<{ data: T[]; hasMore: boolean }>;
  threshold?: number; // pixels from bottom to trigger load
}

export function useInfiniteScroll<T>({ initialData = [], fetchMore, threshold = 200 }: UseInfiniteScrollOptions<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchMore(page + 1);
      setData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load more');
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchMore]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, loading, threshold]);

  const reset = useCallback(() => {
    setData(initialData);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [initialData]);

  return { data, loading, hasMore, error, loadMoreRef, reset };
}

// Infinite scroll container component
interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  fetchMore: (page: number) => Promise<{ data: T[]; hasMore: boolean }>;
  loading?: boolean;
  hasMore?: boolean;
  className?: string;
  loadingComponent?: React.ReactNode;
  endMessage?: React.ReactNode;
  emptyMessage?: React.ReactNode;
}

export function InfiniteScroll<T>({
  items: initialItems,
  renderItem,
  fetchMore,
  className = '',
  loadingComponent,
  endMessage,
  emptyMessage,
}: InfiniteScrollProps<T>) {
  const { data, loading, hasMore, error, loadMoreRef } = useInfiniteScroll({
    initialData: initialItems,
    fetchMore,
  });

  if (data.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage || 'No items found'}
      </div>
    );
  }

  return (
    <div className={className}>
      {data.map((item, index) => renderItem(item, index))}
      
      {/* Load more trigger */}
      <div ref={loadMoreRef} className="py-4">
        {loading && (
          loadingComponent || (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#ff6b35]" />
            </div>
          )
        )}
        
        {error && (
          <div className="text-center py-4 text-red-500">
            {error}
          </div>
        )}
        
        {!hasMore && data.length > 0 && (
          endMessage || (
            <p className="text-center py-4 text-gray-400 text-sm">
              You've reached the end
            </p>
          )
        )}
      </div>
    </div>
  );
}

// Simple load more button alternative
interface LoadMoreButtonProps {
  onClick: () => void;
  loading: boolean;
  hasMore: boolean;
}

export function LoadMoreButton({ onClick, loading, hasMore }: LoadMoreButtonProps) {
  if (!hasMore) return null;
  
  return (
    <div className="flex justify-center py-8">
      <button
        onClick={onClick}
        disabled={loading}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-medium transition disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading...
          </>
        ) : (
          'Load More'
        )}
      </button>
    </div>
  );
}

// Products grid with infinite scroll
interface Product {
  id: string;
  name: string;
  slug: string;
  selling_price_cents: number;
  primary_image_url?: string;
}

export function InfiniteProductGrid({ 
  initialProducts,
  categoryId,
}: { 
  initialProducts: Product[];
  categoryId?: string;
}) {
  const fetchProducts = async (page: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '12',
      ...(categoryId && { category: categoryId }),
    });
    
    const res = await fetch(`/api/products/search?${params}`);
    const data = await res.json();
    
    return {
      data: data.products || [],
      hasMore: data.hasMore ?? false,
    };
  };

  return (
    <InfiniteScroll
      items={initialProducts}
      fetchMore={fetchProducts}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      renderItem={(product) => (
        <a
          key={product.id}
          href={`/products/${product.slug}`}
          className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition group"
        >
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
          </div>
          <div className="p-3">
            <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
            <p className="text-[#ff6b35] font-bold mt-1">
              R{(product.selling_price_cents / 100).toFixed(2)}
            </p>
          </div>
        </a>
      )}
      emptyMessage={
        <div className="text-center py-12">
          <p className="text-gray-500">No products found</p>
        </div>
      }
    />
  );
}
