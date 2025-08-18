import { useState, useEffect } from 'react';
import { fetchCompanyOverview } from '../api/stockApi';

export function useCompanyOverview(symbol: string) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) {
      setIsLoading(false);
      return;
    }

    fetchCompanyData();
  }, [symbol]);

  const fetchCompanyData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchCompanyOverview(symbol);

      if (response && response.Symbol) {
        setData(response);
      } else {
        setError('Company data not found');
      }
    } catch (err) {
      console.error('Error fetching company overview:', err);
      setError(err.message || 'Failed to fetch company data');
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    if (symbol) {
      fetchCompanyData();
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
