/**
 * Navigation Types
 * TypeScript types for React Navigation
 */

import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Onboarding: undefined;
  PhoneAuth: undefined;
  OTPVerification: { sessionId: string; phone: string };
  EmailAuth: undefined;
  OTPEmail: undefined;
};

// Home Stack
export type HomeStackParamList = {
  Home: undefined;
  ProductDetail: { productId: string };
  Search: undefined;
};

// Catalog Stack
export type CatalogStackParamList = {
  Catalog: undefined;
  ProductDetail: { productId: string };
};

// Projects Stack
export type ProjectsStackParamList = {
  ProjectsList: undefined;
  ProjectDetail: { projectId: string };
  ProductDetail: { productId: string };
};

// Learning Stack
export type LearningStackParamList = {
  LearningHub: undefined;
  TutorialDetail: { tutorialId: string };
};

// Profile Stack
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  OrdersList: undefined;
  OrderDetail: { orderId: string };
  SavedAddresses: undefined;
  AddEditAddress: { addressId?: string };
  StudentVerification: undefined;
  Settings: undefined;
  Notifications: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  CatalogTab: NavigatorScreenParams<CatalogStackParamList>;
  ProjectsTab: NavigatorScreenParams<ProjectsStackParamList>;
  LearningTab: NavigatorScreenParams<LearningStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Root Navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Cart: undefined;
  Checkout: undefined;
  AddressSelection: undefined;
  AddEditAddress: { addressId?: string };
  OrderSuccess: { orderId: string };
};

// Navigation prop types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
