/**
 * App Navigator
 * Root navigator with authentication flow logic
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useTheme } from '../theme';
import { useAuthStore } from '../stores';

import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

// Import actual screens
import { 
  CartScreen, 
  CheckoutScreen, 
  AddressSelectionScreen, 
  AddEditAddressScreen,
  OrderSuccessScreen 
} from '../screens/cart';

// Placeholder screens

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { theme, isDark } = useTheme();
  const { isAuthenticated, loadUser } = useAuthStore();

  // Load user on app start
  useEffect(() => {
    loadUser();
  }, []);

  // Enable authentication (set to false to skip for testing)
  const skipAuth = false;

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: theme.primary,
          background: theme.background,
          card: theme.surface,
          text: theme.text,
          border: theme.border,
          notification: theme.error,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!skipAuth && !isAuthenticated ? (
          // Auth Stack (disabled for development)
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // Main App Stack
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            
            {/* Modal Screens */}
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="AddressSelection"
              component={AddressSelectionScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="AddEditAddress"
              component={AddEditAddressScreen}
              options={{
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="OrderSuccess"
              component={OrderSuccessScreen}
              options={{
                presentation: 'card',
                gestureEnabled: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
