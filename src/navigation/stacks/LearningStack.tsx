/**
 * Learning Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LearningStackParamList } from '../types';
import { LearningHubScreen, TutorialDetailScreen } from '../../screens/learning';

const Stack = createNativeStackNavigator<LearningStackParamList>();

export const LearningStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="LearningHub" component={LearningHubScreen} />
      <Stack.Screen name="TutorialDetail" component={TutorialDetailScreen} />
    </Stack.Navigator>
  );
};
