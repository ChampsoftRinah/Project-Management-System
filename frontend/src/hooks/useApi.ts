import { useState, useCallback } from 'react';
import apiClient from '../services/api';

export function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(url);
      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error, fetch };
}
