import { useState, useCallback, useEffect } from 'react';
import apiClient from '../services/api';
import { getFriendlyErrorMessage } from '../utils/errors';

export function useApi<T>(url?: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!url) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get(url);
      setData(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err));
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
