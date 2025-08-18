import axios from 'axios';
import { API_KEY } from '@env';
const BASE_URL = 'https://www.alphavantage.co/query';

export const fetchTopGainersLosers = async () => {
  const { data } = await axios.get(BASE_URL, {
    params: {
      function: 'TOP_GAINERS_LOSERS',
      apikey: API_KEY,
    },
  });
  return data;
};

export const fetchCompanyOverview = async (symbol: string) => {
  try {
    const { data } = await axios.get(BASE_URL, {
      params: {
        function: 'OVERVIEW',
        symbol: symbol,
        apikey: API_KEY,
      },
    });
    return data;
  } catch (error) {
    console.error('Error fetching company overview:', error);
    throw error;
  }
};

export const fetchDailyStockData = async (symbol: string) => {
  try {
    const { data } = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: API_KEY,
        outputsize: 'compact', // Gets last 100 data points
      },
    });
    return data;
  } catch (error) {
    console.error('Error fetching daily stock data:', error);
    throw error;
  }
};

export const fetchSymbolSearch = async (keywords: string) => {
  try {
    console.log(
      'Making API call to:',
      `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${API_KEY}`,
    );

    const { data } = await axios.get(BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: keywords,
        apikey: API_KEY,
      },
    });

    console.log('Raw API response:', data);
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    if (!data.bestMatches) {
      console.warn('No bestMatches in response:', data);
      return { bestMatches: [] };
    }

    return data;
  } catch (error) {
    console.error('Error searching symbols:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};
