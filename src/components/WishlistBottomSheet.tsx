import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
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
  stock: any; // Accept any stock format from API
}

export default function WishlistBottomSheet({ bottomSheetRef, stock }: Props) {
  const { wishlists, createWishlist, addStockToWishlist, isStockInWishlist } =
    useWishlistStore();
  const [newWishlistName, setNewWishlistName] = useState('');
  const [selectedWishlists, setSelectedWishlists] = useState<Set<string>>(
    new Set(),
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const snapPoints = useMemo(() => ['25%', '80%'], []);

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
        opacity={0.8}
      />
    ),
    [],
  );

  const handleCreateWishlist = async () => {
    if (newWishlistName.trim()) {
      await createWishlist(newWishlistName.trim());
      setNewWishlistName('');
      setSuccessMessage('Wishlist created successfully!');
      setShowSuccessModal(true);
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
    // Convert API stock data to our Stock interface
    const stockToAdd: Stock = {
      id: stock.ticker || `${stock.ticker}-${Date.now()}`,
      ticker: stock.ticker,
      price: stock.price,
      change_percentage: stock.change_percentage,
      volume: stock.volume,
      symbol: stock.ticker,
    };

    const promises = Array.from(selectedWishlists).map(wishlistId =>
      addStockToWishlist(wishlistId, stockToAdd),
    );

    await Promise.all(promises);

    setSuccessMessage(
      `${stock.ticker} added to ${selectedWishlists.size} wishlist(s)!`,
    );
    setShowSuccessModal(true);

    // Clear selection
    setSelectedWishlists(new Set());
  };

  // Create a stock ID for checking if it's already in wishlist
  const stockId = stock?.ticker || stock?.id;

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    bottomSheetRef.current?.close();
  };

  const SuccessModal = () => (
    <Modal
      transparent
      visible={showSuccessModal}
      animationType="fade"
      onRequestClose={handleCloseSuccessModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.successModalContainer}>
          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#10b981" />
          </View>
          <Text style={styles.successTitle}>Success!</Text>
          <Text style={styles.successMessage}>{successMessage}</Text>
          <TouchableOpacity
            style={styles.successButton}
            onPress={handleCloseSuccessModal}
            activeOpacity={0.8}
          >
            <Text style={styles.successButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="heart-outline" size={20} color="#ef4444" />
            </View>
            <Text style={styles.title}>Add to Wishlist</Text>
          </View>

          {/* Stock Info */}
          <View style={styles.stockInfoCard}>
            <View style={styles.stockIcon}>
              <Text style={styles.stockIconText}>
                {stock?.ticker?.substring(0, 2) || 'ST'}
              </Text>
            </View>
            <View style={styles.stockDetails}>
              <Text style={styles.stockTicker}>{stock?.ticker}</Text>
              <Text style={styles.stockPrice}>${stock?.price}</Text>
            </View>
          </View>

          {/* Create Wishlist */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create New Wishlist</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter wishlist name"
                placeholderTextColor="#6b7280"
                value={newWishlistName}
                onChangeText={setNewWishlistName}
              />
              <TouchableOpacity
                style={[
                  styles.createButton,
                  !newWishlistName.trim() && styles.createButtonDisabled,
                ]}
                onPress={handleCreateWishlist}
                disabled={!newWishlistName.trim()}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Wishlists */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Select Wishlists ({wishlists.length})
            </Text>
            <ScrollView
              style={styles.wishlistContainer}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
            >
              {wishlists.length === 0 ? (
                <View style={styles.emptyWishlists}>
                  <Ionicons name="heart-outline" size={32} color="#374151" />
                  <Text style={styles.emptyText}>No wishlists yet</Text>
                  <Text style={styles.emptySubtext}>
                    Create your first wishlist above
                  </Text>
                </View>
              ) : (
                wishlists.map(wishlist => {
                  const isSelected = selectedWishlists.has(wishlist.id);
                  const stockAlreadyInWishlist = isStockInWishlist(
                    wishlist.id,
                    stockId,
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
                      activeOpacity={0.8}
                    >
                      <View style={styles.wishlistContent}>
                        <View
                          style={[
                            styles.checkbox,
                            isSelected && styles.checkedCheckbox,
                            stockAlreadyInWishlist && styles.disabledCheckbox,
                          ]}
                        >
                          {(isSelected || stockAlreadyInWishlist) && (
                            <Ionicons
                              name="checkmark"
                              size={12}
                              color={
                                stockAlreadyInWishlist ? '#6b7280' : '#fff'
                              }
                            />
                          )}
                        </View>
                        <View style={styles.wishlistInfo}>
                          <Text
                            style={[
                              styles.wishlistName,
                              stockAlreadyInWishlist && styles.disabledText,
                            ]}
                          >
                            {wishlist.name}
                          </Text>
                          <View style={styles.wishlistMeta}>
                            <Text style={styles.stockCount}>
                              {wishlist.stocks.length} stock
                              {wishlist.stocks.length !== 1 ? 's' : ''}
                            </Text>
                            {stockAlreadyInWishlist && (
                              <Text style={styles.alreadyAddedText}>
                                Already added
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.wishlistIcon}>
                          <Ionicons name="heart" size={16} color="#ef4444" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </BottomSheetView>

        {/* Confirm Button (always at bottom outside ScrollView) */}
        {selectedWishlists.size > 0 && (
          <View style={styles.confirmSection}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleAddToSelectedWishlists}
              activeOpacity={0.8}
            >
              <Ionicons name="heart" size={16} color="#fff" />
              <Text style={styles.confirmButtonText}>
                Add to {selectedWishlists.size} Wishlist
                {selectedWishlists.size > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </BottomSheet>
      <SuccessModal />
    </>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#374151',
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    marginBottom: 20,
    gap: 8,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  stockInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  stockIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stockIconText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  stockDetails: {
    flex: 1,
  },
  stockTicker: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  stockPrice: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 2,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#374151',
  },
  createButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  createButtonDisabled: {
    backgroundColor: '#1f1f1f',
    opacity: 0.5,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14,
  },
  wishlistContainer: {
    maxHeight: 300,
  },
  scrollContentContainer: {
    paddingBottom: 10,
  },
  emptyWishlists: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  emptySubtext: {
    color: '#6b7280',
    fontSize: 12,
  },
  wishlistItem: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectedWishlistItem: {
    backgroundColor: '#374151',
    borderColor: '#6b7280',
  },
  disabledWishlistItem: {
    opacity: 0.6,
  },
  wishlistContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkedCheckbox: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  disabledCheckbox: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  wishlistInfo: {
    flex: 1,
  },
  wishlistName: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  disabledText: {
    color: '#6b7280',
  },
  wishlistMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  stockCount: {
    color: '#9ca3af',
    fontSize: 12,
  },
  alreadyAddedText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '500',
  },
  wishlistIcon: {
    marginLeft: 8,
  },
  confirmSection: {
    borderTopWidth: 1,
    borderTopColor: '#1f1f1f',
    paddingTop: 16,
  },
  confirmButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModalContainer: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  successButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
  },
  successButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
