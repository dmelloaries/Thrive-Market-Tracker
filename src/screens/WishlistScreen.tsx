import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useWishlistStore } from '../store/wishlistStore';

export default function WishlistScreen() {
  const navigation = useNavigation();
  const { wishlists, loadWishlists } = useWishlistStore();

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

  const renderWishlistItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.wishlistItem}
      onPress={() => navigateToWishlistDetail(item.id, item.name)}
    >
      <View style={styles.wishlistContent}>
        <Text style={styles.wishlistName}>{item.name}</Text>
        <Text style={styles.stockCount}>
          {item.stocks.length} stock{item.stocks.length !== 1 ? 's' : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Watchlist</Text>

      <FlatList
        data={wishlists}
        renderItem={renderWishlistItem}
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#666" />
            <Text style={styles.emptyText}>No watchlists yet</Text>
            <Text style={styles.emptySubtext}>
              Add stocks to your watchlist from the stock details page
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  wishlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2c2c54',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3a3a6b',
  },
  wishlistContent: {
    flex: 1,
  },
  wishlistName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  stockCount: {
    color: '#999',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
