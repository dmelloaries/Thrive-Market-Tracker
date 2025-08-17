import React, { useRef, useCallback, useLayoutEffect, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet from '@gorhom/bottom-sheet';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import WishlistBottomSheet from '../components/WishlistBottomSheet';
import { useWishlistStore, Stock } from '../store/wishlistStore';

export default function DetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { stock } = route.params as { stock: Stock };

  const { loadWishlists } = useWishlistStore();
  const bottomSheetRef = useRef<BottomSheet>(null);

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
      headerTitle: stock.name,
      headerTitleAlign: 'center',
      headerStyle: { backgroundColor: '#1a1a2e' },
      headerTintColor: '#fff',
      headerRight: () => (
        <TouchableOpacity onPress={openBottomSheet} style={{ marginRight: 16 }}>
          <Ionicons name="heart-outline" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, stock?.name, openBottomSheet]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{stock.name}</Text>
        <Text style={styles.price}>{stock.price}</Text>
        <Text
          style={[
            styles.change,
            { color: stock.change.startsWith('+') ? '#4CAF50' : '#F44336' },
          ]}
        >
          {stock.change}
        </Text>

        
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>Stock Chart</Text>
          <Text style={styles.chartSubtext}>
            Chart visualization would go here
          </Text>
        </View>
      </View>

      <WishlistBottomSheet bottomSheetRef={bottomSheetRef} stock={stock} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  price: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
  },
  change: {
    fontSize: 20,
    marginTop: 10,
    fontWeight: '500',
  },
  chartPlaceholder: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#2c2c54',
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    minHeight: 200,
    justifyContent: 'center',
  },
  chartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chartSubtext: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
});
