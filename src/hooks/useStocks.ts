import { useQuery } from '@tanstack/react-query';
import { fetchTopGainersLosers } from '../api/stockApi';

type StocksData = {
  top_gainers: any[];
  top_losers: any[];
};

export function useStocks() {
  const { data, isLoading, error, refetch } = useQuery<StocksData>({
    queryKey: ['stocks'], // unique cache key
    queryFn: async () => {
      const response = await fetchTopGainersLosers();
      return {
        top_gainers: response.top_gainers || [],
        top_losers: response.top_losers || [],
      };
    },
    staleTime: 5 * 60 * 1000, 
  });

  return {
    data,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}
