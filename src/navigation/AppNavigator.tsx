import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Heart } from 'lucide-react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import WishlistScreen from '../screens/WishlistScreen';
import DetailsScreen from '../screens/DetailsScreen';
import WishlistDetailScreen from '../screens/WishlistDetailScreen';
import ViewAllScreen from '../screens/ViewAll';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Dark theme override
const DarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0d0d0d',
    card: '#1a1a1a',
    text: '#e0e0e0',
    border: '#2a2a2a',
    primary: '#4CAF50',
  },
};

// Home Stack Navigator
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0d0d0d' },
        headerTintColor: '#e0e0e0',
        headerTitleAlign: 'center',
        headerTitleStyle: { fontSize: 16, fontWeight: '600' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ViewAll"
        component={ViewAllScreen}
        options={{ headerShown: false, title: 'View All' }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
          title: 'Stock Details',
        }}
      />
    </Stack.Navigator>
  );
}
// Wishlist Stack Navigator
function WishlistStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0d0d0d' },
        headerTintColor: '#e0e0e0',
        headerTitleAlign: 'center',
        headerTitleStyle: { fontSize: 16, fontWeight: '600' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="WishlistMain"
        component={WishlistScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WishlistDetail"
        component={WishlistDetailScreen}
        options={{ title: 'My Wishlist' }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          presentation: 'modal',
          title: 'Stock Details',
        }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return (
              <Home size={size} color={color} fill={focused ? color : 'none'} />
            );
          } else if (route.name === 'Wishlist') {
            return (
              <Heart
                size={size}
                color={color}
                fill={focused ? color : 'none'}
              />
            );
          }
          return null;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#0d0d0d',
          borderTopColor: '#2a2a2a',
          borderTopWidth: 1,
          height: 58,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          letterSpacing: 0.3,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistStack}
        options={{ tabBarLabel: 'Wishlist' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <TabNavigator />
    </NavigationContainer>
  );
}

export type RootStackParamList = {
  Home: undefined;
  Wishlist: undefined;
  ViewAll: {
    type: 'gainers' | 'losers';
    data: any[];
    title: string;
  };
  Details: { stock: any };
  WishlistDetail: { wishlistId: string; wishlistName: string };
};
