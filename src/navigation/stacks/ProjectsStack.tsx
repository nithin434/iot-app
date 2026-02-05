/**
 * Projects Stack Navigator
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProjectsStackParamList } from '../types';

// Import actual screens
import { ProjectsListScreen, ProjectDetailScreen } from '../../screens/projects';

// Placeholder screens
const ProductDetailScreen = () => null;

const Stack = createNativeStackNavigator<ProjectsStackParamList>();

export const ProjectsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProjectsList" component={ProjectsListScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
};
