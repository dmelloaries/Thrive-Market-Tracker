import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
  TextInput,
  Animated,
  Keyboard,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useWishlistStore } from '../store/wishlistStore';
import { useStocks } from '../hooks/useStocks';
import { fetchSymbolSearch } from '../api/stockApi';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { loadWishlists } = useWishlistStore();
  const { data, isLoading, error } = useStocks();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadWishlists();
  }, [loadWishlists]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        performSearch(searchQuery.toLowerCase()); // Convert to lowercase
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const performSearch = async query => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      // Convert query to lowercase before API call
      const results = await fetchSymbolSearch(query.toLowerCase());
      const matches = results.bestMatches || [];
      setSearchResults(matches);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleSearch = () => {
    const toValue = showSearch ? 0 : 1;
    setShowSearch(!showSearch);

    Animated.timing(searchAnimation, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start();

    if (showSearch) {
      setSearchQuery('');
      setSearchResults([]);
      Keyboard.dismiss();
    }
  };

  const topGainers = data?.top_gainers?.slice(0, 4) || [];
  const topLosers = data?.top_losers?.slice(0, 4) || [];

  const navigateToStock = stock => {
    navigation.navigate('Details', { stock });
  };

  const navigateToViewAll = type => {
    navigation.navigate('ViewAll', {
      type,
      data: type === 'gainers' ? data?.top_gainers : data?.top_losers,
      title: type === 'gainers' ? 'Top Gainers' : 'Top Losers',
    });
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => {
        const stockFromSearch = {
          ticker: item['1. symbol'],
          price: 'N/A',
          name: item['2. name'],
        };
        navigateToStock(stockFromSearch);
        toggleSearch();
      }}
    >
      <View style={styles.searchResultIcon}>
        <Text style={styles.searchResultIconText}>
          {item['1. symbol']?.substring(0, 2)}
        </Text>
      </View>
      <View style={styles.searchResultDetails}>
        <Text style={styles.searchResultSymbol}>{item['1. symbol']}</Text>
        <Text style={styles.searchResultName} numberOfLines={1}>
          {item['2. name']}
        </Text>
        <Text style={styles.searchResultType}>{item['3. type']}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#666" />
    </TouchableOpacity>
  );

  const renderStockCard = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.stockCard}
      onPress={() => navigateToStock(item)}
      activeOpacity={0.8}
    >
      <View style={styles.stockCardHeader}>
        <View style={styles.stockIcon}>
          <Text style={styles.stockIconText}>
            {item.ticker?.substring(0, 2)}
          </Text>
        </View>
        <View
          style={[
            styles.trendIndicator,
            parseFloat(item.change_percentage?.replace('%', '')) >= 0
              ? styles.trendUp
              : styles.trendDown,
          ]}
        >
          <Ionicons
            name={
              parseFloat(item.change_percentage?.replace('%', '')) >= 0
                ? 'trending-up'
                : 'trending-down'
            }
            size={14}
            color={
              parseFloat(item.change_percentage?.replace('%', '')) >= 0
                ? '#10b981'
                : '#ef4444'
            }
          />
        </View>
      </View>

      <View style={styles.stockInfo}>
        <Text style={styles.stockSymbol} numberOfLines={1}>
          {item.ticker}
        </Text>
        <Text style={styles.stockPrice}>
          ${parseFloat(item.price).toFixed(2)}
        </Text>
        <Text
          style={[
            styles.changePercentage,
            parseFloat(item.change_percentage?.replace('%', '')) >= 0
              ? styles.positiveChange
              : styles.negativeChange,
          ]}
        >
          {item.change_percentage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title, data, type) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigateToViewAll(type)}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={12} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.stockGrid}>
        {data.map((item, index) => renderStockCard(item, index))}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6b7280" />
          <Text style={styles.loadingText}>Loading market data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Failed to load market data</Text>
          <TouchableOpacity style={styles.retryButton} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.brandContainer}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
            <View>
              <Text style={styles.appName}>Thrive</Text>
              <Text style={styles.appTagline}>Stock Tracker</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.searchToggle,
              showSearch && styles.searchToggleActive,
            ]}
            onPress={toggleSearch}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showSearch ? 'close' : 'search-outline'}
              size={20}
              color={showSearch ? '#000' : '#9ca3af'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Animated Search Bar */}
      <Animated.View
        style={[
          styles.searchWrapper,
          {
            height: searchAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 70],
            }),
            opacity: searchAnimation,
          },
        ]}
      >
        {showSearch && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search-outline" size={18} color="#6b7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search stocks (e.g., AAPL, Tesla)"
                placeholderTextColor="#6b7280"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {isSearching && (
                <ActivityIndicator size="small" color="#6b7280" />
              )}
            </View>
          </View>
        )}
      </Animated.View>

      {/* Content */}
      {showSearch && searchQuery.length > 0 ? (
        <View style={styles.searchResults}>
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => `${item['1. symbol']}-${index}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.searchResultsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={40} color="#6b7280" />
              <Text style={styles.emptyStateText}>
                {isSearching
                  ? 'Searching...'
                  : searchQuery.length > 2
                  ? 'No results found'
                  : 'Enter at least 3 characters'}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Market Summary */}
          <View style={styles.marketSummary}>
            <Text style={styles.marketSummaryTitle}>Market Overview</Text>
            <View style={styles.marketStats}>
              <View style={styles.marketStat}>
                <Text style={styles.statValue}>
                  {data?.top_gainers?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Gainers</Text>
              </View>
              <View style={styles.marketStat}>
                <Text style={styles.statValue}>
                  {data?.top_losers?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Losers</Text>
              </View>
            </View>
          </View>

          {renderSection('Top Gainers', topGainers, 'gainers')}
          {renderSection('Top Losers', topLosers, 'losers')}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 12,
    borderRadius: 6,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#7983beff',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -2,
  },
  searchToggle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchToggleActive: {
    backgroundColor: '#f3f4f6',
  },
  searchWrapper: {
    backgroundColor: '#111111',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 46,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchResultsList: {
    paddingBottom: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  searchResultIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultIconText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  searchResultDetails: {
    flex: 1,
  },
  searchResultSymbol: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  searchResultName: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  searchResultType: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  marketSummary: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  marketSummaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  marketStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  marketStat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    gap: 4,
  },
  viewAllText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  stockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  stockCard: {
    width: '48%',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  stockCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockIconText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 11,
  },
  trendIndicator: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendUp: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  trendDown: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  stockInfo: {
    gap: 4,
  },
  stockSymbol: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  changePercentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  positiveChange: {
    color: '#10b981',
  },
  negativeChange: {
    color: '#ef4444',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyStateText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
});
