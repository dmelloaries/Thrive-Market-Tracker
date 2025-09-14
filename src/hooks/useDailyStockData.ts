import { useQuery } from '@tanstack/react-query';
import { fetchDailyStockData } from '../api/stockApi';

export type DailyStockEntry = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type DailyStockData = {
  metaData: {
    information: string;
    symbol: string;
    lastRefreshed: string;
    outputSize: string;
    timeZone: string;
  };
  timeSeries: DailyStockEntry[];
};

export const useDailyStockData = (symbol?: string) => {
  return useQuery<DailyStockData, Error>({
    queryKey: ['dailyStockData', symbol],
    queryFn: async () => {
      const response = await fetchDailyStockData(symbol!);

      if (response['Error Message']) {
        throw new Error(response['Error Message']);
      }

      if (response['Note']) {
        throw new Error(
          'API call frequency limit reached. Please try again later.',
        );
      }

      const metaData = response['Meta Data'];
      const timeSeriesRaw = response['Time Series (Daily)'];

      if (!metaData || !timeSeriesRaw) {
        throw new Error('Invalid response format');
      }

      const timeSeries = Object.entries(timeSeriesRaw)
        .map(([date, values]: [string, any]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 7);

      return {
        metaData: {
          information: metaData['1. Information'],
          symbol: metaData['2. Symbol'],
          lastRefreshed: metaData['3. Last Refreshed'],
          outputSize: metaData['4. Output Size'],
          timeZone: metaData['5. Time Zone'],
        },
        timeSeries,
      };
    },
    enabled: !!symbol, // Only run when symbol is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
