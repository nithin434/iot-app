/**
 * Catalog Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CatalogStackParamList } from '../types';

// Import actual screens
import { CatalogScreen } from '../../screens/catalog';
import { ProductDetailScreen } from '../../screens/home/ProductDetailScreen';

const Stack = createNativeStackNavigator<CatalogStackParamList>();

export const CatalogStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Catalog" component={CatalogScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
};
