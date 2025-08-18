import { useState, useEffect } from 'react';
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
  const [data, setData] = useState<DailyStockData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchDailyStockData(symbol);

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

        // Convert and sort data (most recent first)
        const timeSeries = Object.entries(timeSeriesRaw)
          .map(([date, values]: [string, any]) => ({
            date,
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
            volume: parseInt(values['5. volume']),
          }))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, 7); // Get last 7 days

        const processedData: DailyStockData = {
          metaData: {
            information: metaData['1. Information'],
            symbol: metaData['2. Symbol'],
            lastRefreshed: metaData['3. Last Refreshed'],
            outputSize: metaData['4. Output Size'],
            timeZone: metaData['5. Time Zone'],
          },
          timeSeries,
        };

        setData(processedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  return { data, isLoading, error };
};
