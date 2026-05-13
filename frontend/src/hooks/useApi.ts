import { useState, useCallback, useEffect } from 'react';
import apiClient from '../services/api';

export function useApi<T>(url?: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const refetch = useCallback(async () => {
    if (!url) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get(url);
      setData(response.data.data);
      setError(null);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (!url) {
      return;
    }
    refetch();
  }, [url, refetch]);

  return { data, loading, error, refetch };
}
