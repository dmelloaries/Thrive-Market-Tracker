import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function ViewAllScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { type, data = [], title } = route.params || {};

  const [displayData, setDisplayData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    // Initialize with first page
    const initialData = data.slice(0, ITEMS_PER_PAGE);
    setDisplayData(initialData);
    setHasMoreData(data.length > ITEMS_PER_PAGE);
  }, [data]);

  const navigateToStock = stock => {
    navigation.navigate('Details', { stock });
  };

  const loadMoreData = () => {
    if (isLoadingMore || !hasMoreData) return;

    setIsLoadingMore(true);

    // Simulate API call delay
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newData = data.slice(startIndex, endIndex);

      if (newData.length > 0) {
        setDisplayData(prevData => [...prevData, ...newData]);
        setCurrentPage(nextPage);
        setHasMoreData(endIndex < data.length);
      } else {
        setHasMoreData(false);
      }

      setIsLoadingMore(false);
    }, 800);
  };

  const renderStockCard = ({ item, index }) => {
    const isPositive =
      parseFloat(item.change_percentage?.replace('%', '')) >= 0;

    return (
      <TouchableOpacity
        style={[styles.stockCard, { marginRight: index % 2 === 0 ? 6 : 0 }]}
        onPress={() => navigateToStock(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.stockIcon}>
            <Text style={styles.stockIconText}>
              {item.ticker?.substring(0, 2)}
            </Text>
          </View>
          <View
            style={[
              styles.trendIndicator,
              isPositive ? styles.trendUp : styles.trendDown,
            ]}
          >
            <Ionicons
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={12}
              color={isPositive ? '#10b981' : '#ef4444'}
            />
          </View>
        </View>

        <View style={styles.stockDetails}>
          <Text style={styles.stockSymbol} numberOfLines={1}>
            {item.ticker}
          </Text>
          <Text style={styles.stockPrice}>
            ${parseFloat(item.price).toFixed(2)}
          </Text>
          <Text
            style={[
              styles.changePercentage,
              isPositive ? styles.positiveChange : styles.negativeChange,
            ]}
          >
            {item.change_percentage}
          </Text>
          <Text style={styles.volumeText} numberOfLines={1}>
            Vol: {formatVolume(item.volume)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const formatVolume = volume => {
    if (!volume) return 'N/A';
    const num = parseInt(volume);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#6b7280" />
        <Text style={styles.loadingText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={
          type === 'gainers' ? 'trending-up-outline' : 'trending-down-outline'
        }
        size={48}
        color="#374151"
      />
      <Text style={styles.emptyText}>No {type} available</Text>
      <Text style={styles.emptySubtext}>Check back later for updates</Text>
    </View>
  );

  const getHeaderIcon = () => {
    return type === 'gainers' ? 'trending-up' : 'trending-down';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <View style={styles.titleContainer}>
            <Ionicons
              name={getHeaderIcon()}
              size={20}
              color={type === 'gainers' ? '#10b981' : '#ef4444'}
            />
            <Text style={styles.title}>{title || 'All Stocks'}</Text>
          </View>
          <Text style={styles.subtitle}>
            {displayData.length} of {data.length} stocks
          </Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* Stock Grid */}
      <FlatList
        data={displayData}
        renderItem={renderStockCard}
        numColumns={2}
        keyExtractor={(item, index) => `${item.ticker}-${index}`}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        columnWrapperStyle={styles.row}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stockCard: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    maxWidth: '48%',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockIconText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
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
  stockDetails: {
    gap: 4,
  },
  stockSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  stockPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  changePercentage: {
    fontSize: 13,
    fontWeight: '600',
  },
  positiveChange: {
    color: '#10b981',
  },
  negativeChange: {
    color: '#ef4444',
  },
  volumeText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#4b5563',
    textAlign: 'center',
  },
  paginationInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginationText: {
    color: '#6b7280',
    fontSize: 12,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  loadMoreText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '500',
  },
});
