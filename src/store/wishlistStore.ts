import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Stock {
  id: string;
  name: string;
  price: string;
  change: string;
  symbol?: string;
}

export interface Wishlist {
  id: string;
  name: string;
  stocks: Stock[];
}

interface WishlistState {
  wishlists: Wishlist[];
  isLoading: boolean;

  // Actions
  loadWishlists: () => Promise<void>;
  createWishlist: (name: string) => Promise<void>;
  deleteWishlist: (wishlistId: string) => Promise<void>;
  addStockToWishlist: (wishlistId: string, stock: Stock) => Promise<void>;
  removeStockFromWishlist: (
    wishlistId: string,
    stockId: string,
  ) => Promise<void>;
  isStockInWishlist: (wishlistId: string, stockId: string) => boolean;
  getWishlistById: (wishlistId: string) => Wishlist | undefined;
}

const STORAGE_KEY = 'wishlists';

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlists: [],
  isLoading: false,

  loadWishlists: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const wishlists = JSON.parse(stored);
        set({ wishlists, isLoading: false });
      } else {
        // Create default wishlists
        const defaultWishlists: Wishlist[] = [
          { id: '1', name: 'Wishlist 1', stocks: [] },
          { id: '2', name: 'Wishlist 2', stocks: [] },
        ];
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(defaultWishlists),
        );
        set({ wishlists: defaultWishlists, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading wishlists:', error);
      set({ isLoading: false });
    }
  },

  createWishlist: async (name: string) => {
    const newWishlist: Wishlist = {
      id: Date.now().toString(),
      name,
      stocks: [],
    };

    const updatedWishlists = [...get().wishlists, newWishlist];
    set({ wishlists: updatedWishlists });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWishlists));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  },

  deleteWishlist: async (wishlistId: string) => {
    const updatedWishlists = get().wishlists.filter(w => w.id !== wishlistId);
    set({ wishlists: updatedWishlists });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWishlists));
    } catch (error) {
      console.error('Error deleting wishlist:', error);
    }
  },

  addStockToWishlist: async (wishlistId: string, stock: Stock) => {
    const updatedWishlists = get().wishlists.map(wishlist => {
      if (wishlist.id === wishlistId) {
        // Check if stock already exists
        const stockExists = wishlist.stocks.some(s => s.id === stock.id);
        if (!stockExists) {
          return {
            ...wishlist,
            stocks: [...wishlist.stocks, stock],
          };
        }
      }
      return wishlist;
    });

    set({ wishlists: updatedWishlists });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWishlists));
    } catch (error) {
      console.error('Error adding stock to wishlist:', error);
    }
  },

  removeStockFromWishlist: async (wishlistId: string, stockId: string) => {
    const updatedWishlists = get().wishlists.map(wishlist => {
      if (wishlist.id === wishlistId) {
        return {
          ...wishlist,
          stocks: wishlist.stocks.filter(stock => stock.id !== stockId),
        };
      }
      return wishlist;
    });

    set({ wishlists: updatedWishlists });

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWishlists));
    } catch (error) {
      console.error('Error removing stock from wishlist:', error);
    }
  },

  isStockInWishlist: (wishlistId: string, stockId: string) => {
    const wishlist = get().wishlists.find(w => w.id === wishlistId);
    return wishlist?.stocks.some(stock => stock.id === stockId) || false;
  },

  getWishlistById: (wishlistId: string) => {
    return get().wishlists.find(w => w.id === wishlistId);
  },
}));
