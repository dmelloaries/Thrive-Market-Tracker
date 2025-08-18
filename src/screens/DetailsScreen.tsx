import React, { useRef, useCallback, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Alert,
  SafeAreaView,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import WishlistBottomSheet from '../components/WishlistBottomSheet';
import StockChart from '../components/StockChart';
import { useWishlistStore, Stock } from '../store/wishlistStore';
import { useCompanyOverview } from '../hooks/useCompanyOverview';
import { useDailyStockData } from '../hooks/useDailyStockData';

type CompanyOverview = {
  Symbol: string;
  Name: string;
  Exchange: string;
  Sector: string;
  Industry: string;
  Country: string;
  Description?: string;
  MarketCapitalization?: string;
  PERatio?: string;
  DividendYield?: string;
  Beta?: string;
  OfficialSite?: string;
};

export default function DetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { stock } = route.params as { stock: Stock };

  const { loadWishlists } = useWishlistStore();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Fetch company overview data
  const {
    data: companyData,
    isLoading: isCompanyLoading,
    error: companyError,
  } = useCompanyOverview(stock?.ticker);

  // Fetch daily stock data for chart
  const {
    data: dailyData,
    isLoading: isDailyLoading,
    error: dailyError,
  } = useDailyStockData(stock?.ticker);

  // Loading wishlists when component mounts
  useEffect(() => {
    loadWishlists();
  }, [loadWishlists]);

  // Opening bottom sheet from header button
  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(1);
  }, []);

  // Header setup
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: companyData?.Name || stock?.ticker || 'Stock Details',
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: '#111111',
        borderBottomWidth: 1,
        borderBottomColor: '#1f1f1f',
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: 16,
      },
      headerRight: () => (
        <TouchableOpacity
          onPress={openBottomSheet}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="heart-outline" size={20} color="#ffffff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, companyData?.Name, stock?.ticker, openBottomSheet]);

  const handleWebsitePress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open website', [], {
          userInterfaceStyle: 'dark',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open website', [], {
        userInterfaceStyle: 'dark',
      });
    }
  };

  const formatMarketCap = (marketCap: string) => {
    const value = parseInt(marketCap);
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(2)}T`;
    } else if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const renderLoadingState = () => (
    <View style={styles.centerContainer}>
      <View style={styles.loadingCard}>
        <ActivityIndicator size="large" color="#6b7280" />
        <Text style={styles.loadingText}>Loading company details...</Text>
      </View>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.centerContainer}>
      <View style={styles.errorCard}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
        </View>
        <Text style={styles.errorTitle}>Unable to load details</Text>
        <Text style={styles.errorDescription}>
          {companyError || 'Please check your connection and try again'}
        </Text>
      </View>
    </View>
  );

  const renderCompanyInfo = () => {
    if (isCompanyLoading) return renderLoadingState();
    if (companyError || !companyData) return renderErrorState();

    return (
      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="business-outline" size={20} color="#9ca3af" />
            <Text style={styles.cardTitle}>Company Information</Text>
          </View>

          <View style={styles.infoGrid}>
            {[
              { label: 'Symbol', value: companyData.Symbol },
              { label: 'Exchange', value: companyData.Exchange },
              { label: 'Sector', value: companyData.Sector },
              { label: 'Industry', value: companyData.Industry },
              { label: 'Country', value: companyData.Country },
            ].map((item, index) => (
              <View key={index} style={styles.infoItem}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {item.value || 'N/A'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        {companyData.Description && (
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#9ca3af"
              />
              <Text style={styles.cardTitle}>About Company</Text>
            </View>
            <Text style={styles.description}>{companyData.Description}</Text>
          </View>
        )}

        {/* Financial Metrics */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="analytics-outline" size={20} color="#9ca3af" />
            <Text style={styles.cardTitle}>Financial Metrics</Text>
          </View>

          <View style={styles.metricsGrid}>
            {[
              {
                label: 'Market Cap',
                value: companyData.MarketCapitalization
                  ? formatMarketCap(companyData.MarketCapitalization)
                  : 'N/A',
                icon: 'trending-up',
              },
              {
                label: 'P/E Ratio',
                value: companyData.PERatio || 'N/A',
                icon: 'calculator',
              },
              {
                label: 'Dividend Yield',
                value: companyData.DividendYield
                  ? `${(parseFloat(companyData.DividendYield) * 100).toFixed(
                      2,
                    )}%`
                  : 'N/A',
                icon: 'cash',
              },
              {
                label: 'Beta',
                value: companyData.Beta || 'N/A',
                icon: 'stats-chart',
              },
            ].map((metric, index) => (
              <View key={index} style={styles.metricCard}>
                <View style={styles.metricIcon}>
                  <Ionicons
                    name={metric.icon as any}
                    size={16}
                    color="#6b7280"
                  />
                </View>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Website Link */}
        {companyData.OfficialSite && (
          <TouchableOpacity
            style={styles.websiteCard}
            onPress={() => handleWebsitePress(companyData.OfficialSite!)}
            activeOpacity={0.8}
          >
            <View style={styles.websiteContent}>
              <View style={styles.websiteIcon}>
                <Ionicons name="globe-outline" size={20} color="#6b7280" />
              </View>
              <View style={styles.websiteInfo}>
                <Text style={styles.websiteTitle}>Official Website</Text>
                <Text style={styles.websiteUrl} numberOfLines={1}>
                  {companyData.OfficialSite}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#6b7280" />
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  const isPositive = stock?.change_percentage?.startsWith('+');
  const isNegative = stock?.change_percentage?.startsWith('-');

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContainerContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Price Header */}
          <View style={styles.priceHeader}>
            <View style={styles.stockIcon}>
              <Text style={styles.stockIconText}>
                {stock?.ticker?.substring(0, 2) || 'ST'}
              </Text>
            </View>

            <View style={styles.priceInfo}>
              <Text style={styles.companyName} numberOfLines={2}>
                {companyData?.Name || stock?.ticker || 'Loading...'}
              </Text>
              <Text style={styles.stockSymbol}>{stock?.ticker}</Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>${stock?.price || 'N/A'}</Text>
              {stock?.change_percentage && (
                <View
                  style={[
                    styles.changeBadge,
                    isPositive ? styles.positiveBadge : styles.negativeBadge,
                  ]}
                >
                  <Ionicons
                    name={isPositive ? 'trending-up' : 'trending-down'}
                    size={12}
                    color={isPositive ? '#10b981' : '#ef4444'}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      isPositive ? styles.positiveText : styles.negativeText,
                    ]}
                  >
                    {stock.change_percentage}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Stock Chart */}
          <View style={styles.chartContainer}>
            <StockChart
              data={dailyData}
              isLoading={isDailyLoading}
              error={dailyError}
            />
          </View>

          {/* Company Details */}
          <View style={styles.contentContainer}>{renderCompanyInfo()}</View>
        </ScrollView>

        <WishlistBottomSheet bottomSheetRef={bottomSheetRef} stock={stock} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContainerContent: {
    paddingBottom: 40,
  },
  priceHeader: {
    backgroundColor: '#111111',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  stockIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stockIconText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  priceInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  stockSymbol: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  positiveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  negativeBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  positiveText: {
    color: '#10b981',
  },
  negativeText: {
    color: '#ef4444',
  },
  chartContainer: {
    backgroundColor: '#111111',
    marginBottom: 8,
  },
  contentContainer: {
    flex: 1,
  },
  contentScroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  loadingCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f1f1f',
    gap: 16,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  errorCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f1f1f',
    maxWidth: 300,
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    color: '#6b7280',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  infoCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  infoLabel: {
    fontSize: 14,
    color: '#9ca3af',
    flex: 1,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  websiteCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    marginBottom: 16,
  },
  websiteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  websiteIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  websiteInfo: {
    flex: 1,
  },
  websiteTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  websiteUrl: {
    fontSize: 13,
    color: '#6b7280',
  },
});
