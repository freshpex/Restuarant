import React, { useEffect, useRef } from "react";
import { FaSpinner } from "react-icons/fa";

const InfiniteScroll = ({ loading, hasMore, onLoadMore, threshold = 300 }) => {
  const loaderRef = useRef(null);

  useEffect(() => {
    const currentLoader = loaderRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore();
        }
      },
      {
        rootMargin: `0px 0px ${threshold}px 0px`,
      },
    );

    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [loading, hasMore, onLoadMore, threshold]);

  return (
    <div className="w-full flex justify-center my-4" ref={loaderRef}>
      {loading ? (
        <div className="flex items-center">
          <FaSpinner className="animate-spin text-yellow-600 mr-2" />
          <span className="text-gray-600">Loading more...</span>
        </div>
      ) : hasMore ? (
        <span className="text-sm text-gray-500">Scroll for more</span>
      ) : (
        <span className="text-sm text-gray-500">
          No more activities to load
        </span>
      )}
    </div>
  );
};

export default InfiniteScroll;
