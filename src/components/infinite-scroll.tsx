'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface UseInfiniteScrollOptions<T> {
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; hasMore: boolean }>;
  pageSize?: number;
  initialData?: T[];
}

export function useInfiniteScroll<T>({ fetchFn, pageSize = 12, initialData = [] }: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn(page, pageSize);
      setItems(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError('Failed to load more items');
      console.error('Infinite scroll error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, pageSize, loading, hasMore]);

  const reset = useCallback(() => {
    setItems(initialData);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, [initialData]);

  return { items, loading, hasMore, error, loadMore, reset };
}

// Intersection Observer hook for triggering load
export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        callback();
      }
    }, { threshold: 0.1, ...options });

    observer.observe(target);
    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
}

// Load more trigger component
interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  loading: boolean;
  hasMore: boolean;
  error?: string | null;
}

export function InfiniteScrollTrigger({ onLoadMore, loading, hasMore, error }: InfiniteScrollTriggerProps) {
  const triggerRef = useIntersectionObserver(() => {
    if (!loading && hasMore) {
      onLoadMore();
    }
  });

  if (!hasMore && !loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        You've reached the end! 🎉
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">{error}</p>
        <button onClick={onLoadMore} className="text-[#ff6b35] hover:underline">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div ref={triggerRef} className="flex justify-center py-8">
      {loading && (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading more...</span>
        </div>
      )}
    </div>
  );
}

// Product grid with infinite scroll
interface Product {
  id: string;
  name: string;
  slug: string;
  selling_price_cents: number;
  primary_image_url?: string;
}

interface InfiniteProductGridProps {
  initialProducts: Product[];
  categoryId?: string;
  searchQuery?: string;
}

export function InfiniteProductGrid({ initialProducts, categoryId, searchQuery }: InfiniteProductGridProps) {
  const fetchProducts = useCallback(async (page: number, pageSize: number) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(pageSize),
    });
    if (categoryId) params.set('category', categoryId);
    if (searchQuery) params.set('q', searchQuery);

    const res = await fetch(`/api/products/search?${params}`);
    const data = await res.json();

    return {
      data: data.products || [],
      hasMore: data.hasMore ?? (data.products?.length === pageSize),
    };
  }, [categoryId, searchQuery]);

  const { items, loading, hasMore, error, loadMore, reset } = useInfiniteScroll({
    fetchFn: fetchProducts,
    initialData: initialProducts,
    pageSize: 12,
  });

  // Reset when filters change
  useEffect(() => {
    reset();
  }, [categoryId, searchQuery, reset]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <InfiniteScrollTrigger
        onLoadMore={loadMore}
        loading={loading}
        hasMore={hasMore}
        error={error}
      />
    </div>
  );
}

// Simple product card for the grid
function ProductCard({ product }: { product: Product }) {
  return (
    <a
      href={`/products/${product.slug}`}
      className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition group"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.primary_image_url ? (
          <img
            src={product.primary_image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition"
            loading="lazy"
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
  );
}
