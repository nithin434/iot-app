/**
 * Auth Navigator
 * Stack navigator for authentication flow
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';

// Import actual screens
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { PhoneAuthScreen } from '../screens/auth/PhoneAuthScreen';
import { OTPVerificationScreen } from '../screens/auth/OTPVerificationScreen';
import { EmailAuthScreen } from '../screens/auth/EmailAuthScreen';
import { OTPEmailScreen } from '../screens/auth/OTPEmailScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="EmailAuth" component={EmailAuthScreen} />
      <Stack.Screen name="OTPEmail" component={OTPEmailScreen} />
    </Stack.Navigator>
  );
};
