import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useWatchlistsStore } from '../store/wishlistStore';
import { useNavigation } from '@react-navigation/native';

export default function WatchlistScreen() {
  const navigation = useNavigation();
  const watchlists = useWatchlistsStore(s => Object.keys(s.watchlists));

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Watchlists</Text>
      <FlatList
        data={watchlists}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('WatchlistDetail', { watchlistName: item })
            }
          >
            <Text style={styles.text}>{item}</Text>
            <Text style={styles.arrow}>{'>'}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={k => k}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 20 },
  header: { color: '#fff', fontSize: 22, marginBottom: 16 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 10,
  },
  text: { color: '#fff', fontSize: 18 },
  arrow: { color: '#fff', fontSize: 18 },
});
