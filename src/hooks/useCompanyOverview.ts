import { useQuery } from '@tanstack/react-query';
import { fetchCompanyOverview } from '../api/stockApi';

export function useCompanyOverview(symbol: string) {
  return useQuery({
    queryKey: ['companyOverview', symbol], // unique cache key
    queryFn: () => fetchCompanyOverview(symbol), // to fetch data
    enabled: !!symbol, // only run if symbol is truthy
    staleTime: 5 * 60 * 1000, // 5 minutes in ms
  });
}
