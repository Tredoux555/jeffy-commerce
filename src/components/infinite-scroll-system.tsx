'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  initialPage?: number;
}

interface UseInfiniteScrollReturn<T> {
  items: T[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  sentinelRef: React.RefObject<HTMLDivElement>;
}

// Generic infinite scroll hook
export function useInfiniteScroll<T>(
  fetchFn: (page: number) => Promise<{ items: T[]; hasMore: boolean }>,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn<T> {
  const { threshold = 100, initialPage = 1 } = options;
  
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const result = await fetchFn(page);
      setItems(prev => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, loading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(initialPage);
    setHasMore(true);
  }, [initialPage]);

  // Intersection Observer for automatic loading
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { rootMargin: `${threshold}px` }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, threshold]);

  return { items, loading, hasMore, loadMore, reset, sentinelRef };
}

// Loading spinner component
export function InfiniteScrollLoader({ loading }: { loading: boolean }) {
  if (!loading) return null;
  
  return (
    <div className="flex justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-[#ff6b35]" />
    </div>
  );
}

// End of list indicator
export function EndOfList({ show }: { show: boolean }) {
  if (!show) return null;
  
  return (
    <div className="text-center py-8 text-gray-500">
      <p>You've seen all products! 🎉</p>
    </div>
  );
}

// Sentinel element (place at end of list)
export function ScrollSentinel({ 
  sentinelRef, 
  loading, 
  hasMore 
}: { 
  sentinelRef: React.RefObject<HTMLDivElement>;
  loading: boolean;
  hasMore: boolean;
}) {
  return (
    <>
      <div ref={sentinelRef} className="h-1" />
      <InfiniteScrollLoader loading={loading} />
      <EndOfList show={!hasMore && !loading} />
    </>
  );
}

// Example product grid with infinite scroll
interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
}

export function InfiniteProductGrid({ 
  fetchProducts,
  renderProduct,
  gridCols = 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
}: { 
  fetchProducts: (page: number) => Promise<{ items: Product[]; hasMore: boolean }>;
  renderProduct: (product: Product) => React.ReactNode;
  gridCols?: string;
}) {
  const { items, loading, hasMore, sentinelRef } = useInfiniteScroll(fetchProducts);

  return (
    <div>
      <div className={`grid ${gridCols} gap-4`}>
        {items.map((product) => (
          <div key={product.id}>
            {renderProduct(product)}
          </div>
        ))}
      </div>
      <ScrollSentinel sentinelRef={sentinelRef} loading={loading} hasMore={hasMore} />
    </div>
  );
}

// Load more button (alternative to auto-scroll)
export function LoadMoreButton({ 
  onClick, 
  loading, 
  hasMore 
}: { 
  onClick: () => void; 
  loading: boolean; 
  hasMore: boolean;
}) {
  if (!hasMore) {
    return <EndOfList show={true} />;
  }

  return (
    <div className="flex justify-center py-8">
      <button
        onClick={onClick}
        disabled={loading}
        className="px-8 py-3 bg-[#ff6b35] text-white rounded-xl font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading...
          </>
        ) : (
          'Load More Products'
        )}
      </button>
    </div>
  );
}
