import { useState, useEffect } from 'react';
import { fetchTopGainersLosers } from '../api/stockApi';

type StocksData = {
  top_gainers: any[];
  top_losers: any[];
};

export function useStocks() {
  const [data, setData] = useState<StocksData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    fetchStocksData();
  }, []);

  const fetchStocksData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchTopGainersLosers();

      setData({
        top_gainers: response.top_gainers || [],
        top_losers: response.top_losers || [],
      });
    } catch (err) {
      console.error('Error fetching stocks data:', err);
      setError(err.message || 'Failed to fetch stocks data');
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchStocksData();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
