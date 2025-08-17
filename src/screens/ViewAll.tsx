import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

type Stock = {
  name: string;
  price: string | number;
  change: string | number;
};

export default function ViewAllScreen({ route, navigation }) {
  const { stocks, title } = route.params;

  const renderItem = ({ item }: { item: Stock }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('Details', { stock: item })}
    >
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>{item.price} ({item.change})</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{title}</Text>
      <FlatList
        data={stocks}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 20 },
  header: { color: 'white', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: { backgroundColor: '#16213e', padding: 16, borderRadius: 12, marginBottom: 12 },
  name: { color: 'white', fontWeight: '600', fontSize: 18 },
  price: { color: '#aaa', fontSize: 16 },
});
