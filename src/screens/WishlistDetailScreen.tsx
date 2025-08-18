import React, { useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useWishlistStore, Stock } from '../store/wishlistStore';

export default function WishlistDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { wishlistId, wishlistName } = route.params;

  const { wishlists, loadWishlists, removeStockFromWishlist, getWishlistById } =
    useWishlistStore();
  const wishlist = getWishlistById(wishlistId);

  useEffect(() => {
    loadWishlists();
  }, [loadWishlists]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: wishlistName,
      headerStyle: { backgroundColor: '#111111' },
      headerTintColor: '#ffffff',
      headerTitleAlign: 'center',
      headerTitleStyle: {
        fontWeight: '600',
        fontSize: 18,
      },
    });
  }, [navigation, wishlistName]);

  const navigateToStock = (stock: Stock) => {
    navigation.navigate('Details' as never, { stock } as never);
  };

  const handleRemoveStock = (stockId: string, stockTicker: string) => {
    Alert.alert(
      'Remove Stock',
      `Remove ${stockTicker} from ${wishlistName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeStockFromWishlist(wishlistId, stockId),
        },
      ],
      {
        cancelable: true,
        userInterfaceStyle: 'dark',
      },
    );
  };

  const renderStockCard = ({ item, index }: { item: Stock; index: number }) => {
    const isPositive = item.change_percentage?.startsWith('+');
    const isNegative = item.change_percentage?.startsWith('-');

    return (
      <TouchableOpacity
        style={[styles.stockCard, { marginRight: index % 2 === 0 ? 6 : 0 }]}
        onPress={() => navigateToStock(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.stockIcon}>
            <Text style={styles.stockIconText}>
              {item.ticker?.substring(0, 2)?.toUpperCase() || 'ST'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveStock(item.id, item.ticker)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color="#ef4444" />
          </TouchableOpacity>
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
              isPositive
                ? styles.positiveChange
                : isNegative
                ? styles.negativeChange
                : styles.neutralChange,
            ]}
          >
            {item.change_percentage || 'N/A'}
          </Text>
        </View>

        <View
          style={[
            styles.trendIndicator,
            isPositive
              ? styles.trendUp
              : isNegative
              ? styles.trendDown
              : styles.trendNeutral,
          ]}
        >
          <Ionicons
            name={
              isPositive
                ? 'trending-up'
                : isNegative
                ? 'trending-down'
                : 'remove'
            }
            size={12}
            color={isPositive ? '#10b981' : isNegative ? '#ef4444' : '#6b7280'}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={48} color="#374151" />
      </View>
      <Text style={styles.emptyTitle}>No stocks in this wishlist</Text>
      <Text style={styles.emptyDescription}>
        Start building your wishlist by adding stocks from the stock details
        page
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => navigation.navigate('Home' as never)}
        activeOpacity={0.8}
      >
        <Ionicons name="search-outline" size={16} color="#6b7280" />
        <Text style={styles.browseButtonText}>Browse Stocks</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
      </View>
      <Text style={styles.emptyTitle}>Wishlist not found</Text>
      <Text style={styles.emptyDescription}>
        This wishlist may have been deleted or doesn't exist
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => loadWishlists()}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh-outline" size={16} color="#6b7280" />
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (!wishlist) {
    return (
      <SafeAreaView style={styles.container}>{renderErrorState()}</SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {wishlist.stocks.length === 0 ? (
        renderEmptyState()
      ) : (
        <View style={styles.content}>
          {/* Stats Header */}
          <View style={styles.statsContainer}>
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{wishlist.stocks.length}</Text>
                <Text style={styles.statLabel}>
                  Stock{wishlist.stocks.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{wishlistName}</Text>
                <Text style={styles.statLabel}>Wishlist</Text>
              </View>
            </View>
          </View>

          {/* Stock Grid */}
          <FlatList
            data={wishlist.stocks}
            renderItem={renderStockCard}
            numColumns={2}
            keyExtractor={item => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={styles.row}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  statsCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#1f1f1f',
    marginHorizontal: 20,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 40,
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
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockInfo: {
    gap: 4,
    marginBottom: 8,
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
  neutralChange: {
    color: '#6b7280',
  },
  trendIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendUp: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  trendDown: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  trendNeutral: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 280,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  browseButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  retryButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
});
