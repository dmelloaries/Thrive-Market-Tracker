import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useWishlistStore, Stock } from '../store/wishlistStore';

// Sample stock data - in a real app, this would come from an API
const sampleStocks: Stock[] = [
  {
    id: '1',
    name: 'APPLE INC',
    symbol: 'AAPL',
    price: '$227.55',
    change: '+2.24%',
  },
  {
    id: '2',
    name: 'MICROSOFT CORP',
    symbol: 'MSFT',
    price: '$415.26',
    change: '+1.87%',
  },
  {
    id: '3',
    name: 'TESLA INC',
    symbol: 'TSLA',
    price: '$248.42',
    change: '-0.95%',
  },
  {
    id: '4',
    name: 'AMAZON.COM INC',
    symbol: 'AMZN',
    price: '$181.05',
    change: '+0.67%',
  },
  {
    id: '5',
    name: 'ALPHABET INC',
    symbol: 'GOOGL',
    price: '$175.85',
    change: '+1.23%',
  },
  {
    id: '6',
    name: 'META PLATFORMS',
    symbol: 'META',
    price: '$558.36',
    change: '+2.15%',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { loadWishlists } = useWishlistStore();

  useEffect(() => {
    loadWishlists();
  }, [loadWishlists]);

  const navigateToStock = (stock: Stock) => {
    navigation.navigate('Details' as never, { stock } as never);
  };

  const renderStockItem = ({ item }: { item: Stock }) => (
    <TouchableOpacity
      style={styles.stockItem}
      onPress={() => navigateToStock(item)}
    >
      <View style={styles.stockHeader}>
        <View style={styles.stockIcon}>
          <Text style={styles.stockIconText}>
            {item.symbol?.substring(0, 2) || item.name.substring(0, 2)}
          </Text>
        </View>
        <View style={styles.stockInfo}>
          <Text style={styles.stockName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.stockSymbol}>{item.symbol}</Text>
        </View>
      </View>

      <View style={styles.stockPricing}>
        <Text style={styles.stockPrice}>{item.price}</Text>
        <Text
          style={[
            styles.stockChange,
            { color: item.change.startsWith('+') ? '#4CAF50' : '#F44336' },
          ]}
        >
          {item.change}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Market Overview</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Wishlist' as never)}
          style={styles.wishlistButton}
        >
          <Ionicons name="heart" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sampleStocks}
        renderItem={renderStockItem}
        keyExtractor={item => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  wishlistButton: {
    padding: 8,
    backgroundColor: '#2c2c54',
    borderRadius: 8,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c2c54',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a6b',
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stockIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  stockSymbol: {
    color: '#999',
    fontSize: 14,
  },
  stockPricing: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  stockChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  separator: {
    height: 12,
  },
});
