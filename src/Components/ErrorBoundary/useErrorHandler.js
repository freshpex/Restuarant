import { useState, useEffect } from "react";

/**
 * A hook to handle errors in functional components
 * @param {Error} [initialError]
 * @returns {Function}
 */
export default function useErrorHandler(initialError = null) {
  const [error, setError] = useState(initialError);

  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
