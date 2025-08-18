import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useWishlistStore } from '../store/wishlistStore';

export default function WishlistScreen() {
  const navigation = useNavigation();
  const { wishlists, loadWishlists, isLoading } = useWishlistStore();

  useEffect(() => {
    loadWishlists();
  }, [loadWishlists]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadWishlists();
    });

    return unsubscribe;
  }, [navigation, loadWishlists]);

  const navigateToWishlistDetail = (
    wishlistId: string,
    wishlistName: string,
  ) => {
    navigation.navigate(
      'WishlistDetail' as never,
      {
        wishlistId,
        wishlistName,
      } as never,
    );
  };

  const onRefresh = () => {
    loadWishlists();
  };

  const renderWishlistItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.wishlistCard}
      onPress={() => navigateToWishlistDetail(item.id, item.name)}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View style={styles.wishlistHeader}>
          <View style={styles.wishlistInfo}>
            <Text style={styles.wishlistName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.stockCount}>
              {item.stocks.length} stock{item.stocks.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.actionArea}>
          <View style={styles.chevronContainer}>
            <Ionicons name="chevron-forward" size={16} color="#6b7280" />
          </View>
        </View>
      </View>

      {/* Stock Preview */}
      {item.stocks.length > 0 && (
        <View style={styles.stockPreview}>
          <Text style={styles.previewLabel}>Recent stocks:</Text>
          <View style={styles.stockTags}>
            {item.stocks.slice(0, 3).map((stock: any, index: number) => (
              <View key={index} style={styles.stockTag}>
                <Text style={styles.stockTagText}>{stock.ticker}</Text>
              </View>
            ))}
            {item.stocks.length > 3 && (
              <View style={styles.moreTag}>
                <Text style={styles.moreTagText}>
                  +{item.stocks.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="heart-outline" size={48} color="#374151" />
      </View>
      <Text style={styles.emptyTitle}>No wishlists yet</Text>
      <Text style={styles.emptyDescription}>
        Create your first wishlist by adding stocks from the stock details page
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Home' as never)}
        activeOpacity={0.8}
      >
        <Ionicons name="search-outline" size={16} color="#6b7280" />
        <Text style={styles.exploreButtonText}>Explore Stocks</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Ionicons name="heart" size={24} color="#ef4444" />
            <Text style={styles.title}>Wishlists</Text>
          </View>
          <Text style={styles.subtitle}>
            {wishlists.length} wishlist{wishlists.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Wishlist Content */}
      <FlatList
        data={wishlists}
        renderItem={renderWishlistItem}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            colors={['#6b7280']}
            tintColor="#6b7280"
            progressBackgroundColor="#111111"
          />
        }
        ListEmptyComponent={renderEmptyState}
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
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  wishlistCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f1f1f',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  wishlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wishlistIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  wishlistInfo: {
    flex: 1,
  },
  wishlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  stockCount: {
    fontSize: 13,
    color: '#6b7280',
  },
  actionArea: {
    marginLeft: 12,
  },
  chevronContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockPreview: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
    paddingTop: 12,
  },
  previewLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  stockTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stockTag: {
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#374151',
  },
  stockTagText: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
  },
  moreTag: {
    backgroundColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  moreTagText: {
    fontSize: 11,
    color: '#d1d5db',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
    minHeight: 400,
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
  exploreButton: {
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
  exploreButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
});
