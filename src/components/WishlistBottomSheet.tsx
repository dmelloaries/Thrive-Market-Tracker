import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { BottomSheetDefaultBackdropProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types';
import { useWishlistStore, Stock } from '../store/wishlistStore';

interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
  stock: Stock;
}

export default function WishlistBottomSheet({ bottomSheetRef, stock }: Props) {
  const { wishlists, createWishlist, addStockToWishlist, isStockInWishlist } =
    useWishlistStore();
  const [newWishlistName, setNewWishlistName] = useState('');
  const [selectedWishlists, setSelectedWishlists] = useState<Set<string>>(
    new Set(),
  );

  const snapPoints = useMemo(() => ['25%', '75%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setSelectedWishlists(new Set());
      setNewWishlistName('');
    }
  }, []);

  const renderBackdrop = useCallback(
    (
      props: React.JSX.IntrinsicAttributes & BottomSheetDefaultBackdropProps,
    ) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleCreateWishlist = async () => {
    if (newWishlistName.trim()) {
      await createWishlist(newWishlistName.trim());
      setNewWishlistName('');
      Alert.alert('Success', 'Wishlist created successfully!');
    }
  };

  const toggleWishlistSelection = (wishlistId: string) => {
    const newSelected = new Set(selectedWishlists);
    if (newSelected.has(wishlistId)) {
      newSelected.delete(wishlistId);
    } else {
      newSelected.add(wishlistId);
    }
    setSelectedWishlists(newSelected);
  };

  const handleAddToSelectedWishlists = async () => {
    const promises = Array.from(selectedWishlists).map(wishlistId =>
      addStockToWishlist(wishlistId, stock),
    );

    await Promise.all(promises);

    Alert.alert(
      'Success',
      `${stock.name} added to ${selectedWishlists.size} wishlist(s)!`,
      [
        {
          text: 'OK',
          onPress: () => bottomSheetRef.current?.close(),
        },
      ],
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#2c2c54' }}
      handleIndicatorStyle={{ backgroundColor: '#fff' }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>Add to Watchlist</Text>

        {/* Create New Wishlist */}
        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="New Watchlist Name"
              placeholderTextColor="#999"
              value={newWishlistName}
              onChangeText={setNewWishlistName}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleCreateWishlist}
              disabled={!newWishlistName.trim()}
            >
              <Text
                style={[
                  styles.addButtonText,
                  !newWishlistName.trim() && styles.disabledText,
                ]}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Existing Wishlists */}
        <ScrollView
          style={styles.wishlistContainer}
          showsVerticalScrollIndicator={false}
        >
          {wishlists.map(wishlist => {
            const isSelected = selectedWishlists.has(wishlist.id);
            const stockAlreadyInWishlist = isStockInWishlist(
              wishlist.id,
              stock.id,
            );

            return (
              <TouchableOpacity
                key={wishlist.id}
                style={[
                  styles.wishlistItem,
                  isSelected && styles.selectedWishlistItem,
                  stockAlreadyInWishlist && styles.disabledWishlistItem,
                ]}
                onPress={() =>
                  !stockAlreadyInWishlist &&
                  toggleWishlistSelection(wishlist.id)
                }
                disabled={stockAlreadyInWishlist}
              >
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkedCheckbox,
                      stockAlreadyInWishlist && styles.disabledCheckbox,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                    {stockAlreadyInWishlist && (
                      <Ionicons name="checkmark" size={16} color="#999" />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.wishlistName,
                      stockAlreadyInWishlist && styles.disabledText,
                    ]}
                  >
                    {wishlist.name}{' '}
                    {stockAlreadyInWishlist && '(Already added)'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Add Button */}
        {selectedWishlists.size > 0 && (
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleAddToSelectedWishlists}
          >
            <Text style={styles.confirmButtonText}>
              Add to {selectedWishlists.size} Watchlist
              {selectedWishlists.size > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 24,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  wishlistContainer: {
    flex: 1,
    maxHeight: 300,
  },
  wishlistItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  selectedWishlistItem: {
    borderColor: '#4CAF50',
    backgroundColor: '#2d4a2d',
  },
  disabledWishlistItem: {
    opacity: 0.5,
    backgroundColor: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#666',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedCheckbox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  disabledCheckbox: {
    backgroundColor: '#666',
    borderColor: '#666',
  },
  wishlistName: {
    color: '#fff',
    fontSize: 16,
  },
  disabledText: {
    color: '#999',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
