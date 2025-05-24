import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache
      const cachedData = cache.get(url);
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        setData(cachedData.data);
        setLoading(false);
        return;
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Update cache
      cache.set(url, {
        data: result,
        timestamp: Date.now(),
      });

      setData(result);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    cache.delete(url);
    fetchData();
  }, [url, fetchData]);

  return { data, loading, error, refetch };
}; 