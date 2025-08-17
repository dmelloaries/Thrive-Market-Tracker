import React, { useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
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
      headerStyle: { backgroundColor: '#1a1a2e' },
      headerTintColor: '#fff',
      headerTitleAlign: 'center',
    });
  }, [navigation, wishlistName]);

  const navigateToStock = (stock: Stock) => {
    navigation.navigate('Details' as never, { stock } as never);
  };

  const handleRemoveStock = (stockId: string, stockName: string) => {
    Alert.alert('Remove Stock', `Remove ${stockName} from ${wishlistName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeStockFromWishlist(wishlistId, stockId),
      },
    ]);
  };

  const renderStockItem = ({ item, index }: { item: Stock; index: number }) => {
    const isLeft = index % 2 === 0;

    return (
      <View
        style={[
          styles.stockItemContainer,
          isLeft ? styles.leftItem : styles.rightItem,
        ]}
      >
        <TouchableOpacity
          style={styles.stockItem}
          onPress={() => navigateToStock(item)}
        >
          <View style={styles.stockHeader}>
            <View style={styles.stockIcon}>
              <Text style={styles.stockIconText}>
                {item.name.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveStock(item.id, item.name)}
            >
              <Ionicons name="close" size={16} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={styles.stockName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.stockPrice}>{item.price}</Text>
          <Text
            style={[
              styles.stockChange,
              { color: item.change.startsWith('+') ? '#4CAF50' : '#F44336' },
            ]}
          >
            {item.change}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderData = () => {
    if (!wishlist?.stocks.length) return [];

    const data = [];
    for (let i = 0; i < wishlist.stocks.length; i += 2) {
      const row = [];
      row.push(wishlist.stocks[i]);
      if (i + 1 < wishlist.stocks.length) {
        row.push(wishlist.stocks[i + 1]);
      }
      data.push({ id: `row-${i}`, stocks: row });
    }
    return data;
  };

  const renderRow = ({ item }: { item: { id: string; stocks: Stock[] } }) => (
    <View style={styles.row}>
      {item.stocks.map((stock, index) =>
        renderStockItem({ item: stock, index }),
      )}
    </View>
  );

  if (!wishlist) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Watchlist not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {wishlist.stocks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#666" />
          <Text style={styles.emptyText}>No stocks in this watchlist</Text>
          <Text style={styles.emptySubtext}>
            Add stocks from the stock details page
          </Text>
        </View>
      ) : (
        <FlatList
          data={renderData()}
          renderItem={renderRow}
          keyExtractor={item => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          numColumns={1}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 16,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stockItemContainer: {
    flex: 1,
  },
  leftItem: {
    marginRight: 8,
  },
  rightItem: {
    marginLeft: 8,
  },
  stockItem: {
    backgroundColor: '#2c2c54',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3a3a6b',
    minHeight: 120,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stockIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 4,
  },
  stockName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  stockPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stockChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
