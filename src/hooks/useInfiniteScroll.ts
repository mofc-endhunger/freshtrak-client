import { useCallback, useRef, useEffect } from 'react';

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  rootMargin?: string;
}

/**
 * Custom hook for implementing infinite scroll using Intersection Observer
 * @param onLoadMore - Callback function to load more items
 * @param hasMore - Whether there are more items to load
 * @param isLoading - Whether items are currently being loaded
 * @param rootMargin - Margin around the root element (default: "100px")
 * @returns Object containing lastElementRef to attach to the last item
 */
export const useInfiniteScroll = ({
  onLoadMore,
  hasMore,
  isLoading,
  rootMargin = '100px',
}: UseInfiniteScrollOptions) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            onLoadMore();
          }
        },
        { rootMargin },
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [hasMore, isLoading, onLoadMore, rootMargin],
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { lastElementRef };
};

export default useInfiniteScroll;
