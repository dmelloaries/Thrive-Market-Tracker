import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { DailyStockData } from '../hooks/useDailyStockData';

type StockChartProps = {
  data: DailyStockData | null;
  isLoading: boolean;
  error: string | null;
};

const { width: screenWidth } = Dimensions.get('window');

const StockChart: React.FC<StockChartProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="analytics-outline" size={18} color="#9ca3af" />
            <Text style={styles.title}>7-Day Price Chart</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#6b7280" />
            <Text style={styles.loadingText}>Loading chart data...</Text>
          </View>
        </View>
      </View>
    );
  }

  if (error || !data || data.timeSeries.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="analytics-outline" size={18} color="#9ca3af" />
            <Text style={styles.title}>7-Day Price Chart</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="trending-up-outline" size={32} color="#374151" />
            </View>
            <Text style={styles.errorTitle}>Chart unavailable</Text>
            <Text style={styles.errorDescription}>
              {error || 'No chart data to display at the moment'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  //to Prepare chart data (reverse to show chronologically)
  const reversedData = [...data.timeSeries].reverse();
  const chartData = reversedData.map((item, index) => ({
    value: item.close,
    label: `${new Date(item.date).getMonth() + 1}/${new Date(
      item.date,
    ).getDate()}`,
    labelTextStyle: { color: '#6b7280', fontSize: 10 },
  }));

  //to Calculate price change
  const latestPrice = data.timeSeries[0]?.close;
  const previousPrice = data.timeSeries[1]?.close; 
  const priceChange =
    latestPrice && previousPrice ? latestPrice - previousPrice : 0;
  const priceChangePercent = previousPrice
    ? (priceChange / previousPrice) * 100
    : 0;
  const isPositive = priceChange >= 0;

  // Calculate stats
  const highPrice = Math.max(...reversedData.map(item => item.high));
  const lowPrice = Math.min(...reversedData.map(item => item.low));
  const volume = data.timeSeries[0]?.volume;

  const formatVolume = (vol: number) => {
    if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(1)}B`;
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol.toString();
  };

  // Calculate chart width based on screen width minus margins and padding
  const chartWidth = screenWidth - 72; 

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="analytics-outline" size={18} color="#9ca3af" />
          <Text style={styles.title}>7-Day Price Chart</Text>
        </View>
        {latestPrice && (
          <View style={styles.priceInfo}>
            <Text style={styles.currentPrice}>${latestPrice.toFixed(2)}</Text>
            <View
              style={[
                styles.changeBadge,
                isPositive ? styles.positiveBadge : styles.negativeBadge,
              ]}
            >
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={10}
                color={isPositive ? '#10b981' : '#ef4444'}
              />
              <Text
                style={[
                  styles.changeText,
                  isPositive ? styles.positiveText : styles.negativeText,
                ]}
              >
                {isPositive ? '+' : ''}${priceChange.toFixed(2)} (
                {isPositive ? '+' : ''}
                {priceChangePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Chart */}
      <View style={styles.chartWrapper}>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            height={180}
            width={chartWidth - 32} // Subtract chart container padding
            color={isPositive ? '#10b981' : '#ef4444'}
            thickness={2.5}
            curved
            isAnimated
            animateOnDataChange
            areaChart
            startFillColor={
              isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'
            }
            endFillColor={
              isPositive
                ? 'rgba(16, 185, 129, 0.01)'
                : 'rgba(239, 68, 68, 0.01)'
            }
            startOpacity={0.8}
            endOpacity={0.1}
            backgroundColor="transparent"
            rulesType="solid"
            rulesColor="#1f1f1f"
            yAxisColor="#1f1f1f"
            xAxisColor="#1f1f1f"
            yAxisTextStyle={{ color: '#6b7280', fontSize: 10 }}
            xAxisLabelTextStyle={{ color: '#6b7280', fontSize: 9 }}
            dataPointsColor={isPositive ? '#10b981' : '#ef4444'}
            dataPointsRadius={3}
            dataPointsWidth={2}
            textShiftY={-8}
            textShiftX={-10}
            textColor="#6b7280"
            textFontSize={9}
            hideYAxisText={false}
            yAxisLabelPrefix="$"
            showVerticalLines
            verticalLinesColor="#1f1f1f"
            showDataPointOnPress
            showStripOnPress
            stripColor={isPositive ? '#10b981' : '#ef4444'}
            stripOpacity={0.3}
            stripWidth={1}
            noOfSections={4}
            spacing={
              chartData.length > 1
                ? Math.max(20, (chartWidth - 100) / chartData.length)
                : 40
            }
            initialSpacing={10}
            endSpacing={10}
          />
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        {[
          {
            label: '7D High',
            value: `$${highPrice.toFixed(2)}`,
            icon: 'trending-up',
            color: '#10b981',
          },
          {
            label: '7D Low',
            value: `$${lowPrice.toFixed(2)}`,
            icon: 'trending-down',
            color: '#ef4444',
          },
          {
            label: 'Volume',
            value: formatVolume(volume || 0),
            icon: 'bar-chart',
            color: '#6b7280',
          },
        ].map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View
              style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}
            >
              <Ionicons name={stat.icon as any} size={14} color={stat.color} />
            </View>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111111',
    borderRadius: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  priceInfo: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  positiveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  negativeBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  positiveText: {
    color: '#10b981',
  },
  negativeText: {
    color: '#ef4444',
  },
  loadingContainer: {
    padding: 20,
  },
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    gap: 12,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    padding: 20,
  },
  errorCard: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 20,
  },
  errorIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  errorDescription: {
    color: '#6b7280',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  chartWrapper: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  chartContainer: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    overflow: 'hidden', //so chart don't overflow
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 11,
    marginBottom: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StockChart;
