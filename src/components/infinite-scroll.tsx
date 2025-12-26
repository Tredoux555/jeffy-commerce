'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface UseInfiniteScrollOptions<T> {
  fetchFn: (page: number) => Promise<{ items: T[]; hasMore: boolean }>;
  initialPage?: number;
  threshold?: number; // How many pixels from bottom to trigger load
}

export function useInfiniteScroll<T>({ fetchFn, initialPage = 1, threshold = 200 }: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const { items: newItems, hasMore: more } = await fetchFn(page);
      setItems((prev) => [...prev, ...newItems]);
      setHasMore(more);
      setPage((p) => p + 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load more');
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, loading, hasMore]);

  // Intersection Observer for auto-loading
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      
      if (observerRef.current) observerRef.current.disconnect();
      
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      }, { rootMargin: `${threshold}px` });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, loadMore, threshold]
  );

  // Initial load
  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  }, [initialPage]);

  return { items, loading, hasMore, error, loadMoreRef, loadMore, reset };
}

// Loading trigger component
interface InfiniteScrollTriggerProps {
  loadMoreRef: (node: HTMLDivElement | null) => void;
  loading: boolean;
  hasMore: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function InfiniteScrollTrigger({ loadMoreRef, loading, hasMore, error, onRetry }: InfiniteScrollTriggerProps) {
  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500 mb-2">{error}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-[#ff6b35] hover:underline">
            Try again
          </button>
        )}
      </div>
    );
  }

  if (!hasMore) {
    return (
      <div className="py-8 text-center text-gray-400">
        You've seen it all! 🎉
      </div>
    );
  }

  return (
    <div ref={loadMoreRef} className="py-8 flex justify-center">
      {loading && (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading more...
        </div>
      )}
    </div>
  );
}

// Example usage component
interface InfiniteProductGridProps {
  fetchProducts: (page: number) => Promise<{ items: any[]; hasMore: boolean }>;
  renderProduct: (product: any) => React.ReactNode;
}

export function InfiniteProductGrid({ fetchProducts, renderProduct }: InfiniteProductGridProps) {
  const { items, loading, hasMore, error, loadMoreRef, loadMore } = useInfiniteScroll({
    fetchFn: fetchProducts,
  });

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((product, idx) => (
          <div key={product.id || idx}>{renderProduct(product)}</div>
        ))}
      </div>
      
      <InfiniteScrollTrigger
        loadMoreRef={loadMoreRef}
        loading={loading}
        hasMore={hasMore}
        error={error}
        onRetry={loadMore}
      />
    </div>
  );
}
