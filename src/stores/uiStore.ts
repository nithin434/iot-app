/**
 * UI Store
 * Manages global UI state (theme, offline status, notifications)
 */

import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'auto';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface UIState {
  // State
  themeMode: ThemeMode;
  isOffline: boolean;
  notifications: Notification[];
  isBottomSheetVisible: boolean;
  isModalVisible: boolean;

  // Actions
  setThemeMode: (mode: ThemeMode) => void;
  setOfflineStatus: (isOffline: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  showBottomSheet: () => void;
  hideBottomSheet: () => void;
  showModal: () => void;
  hideModal: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  themeMode: 'auto',
  isOffline: false,
  notifications: [],
  isBottomSheetVisible: false,
  isModalVisible: false,

  // Set theme mode
  setThemeMode: (mode: ThemeMode) => {
    set({ themeMode: mode });
  },

  // Set offline status
  setOfflineStatus: (isOffline: boolean) => {
    set({ isOffline });
    
    // Show notification when going offline
    if (isOffline) {
      get().addNotification({
        type: 'warning',
        title: 'No Internet Connection',
        message: 'You are currently offline. Some features may be limited.',
        duration: 5000,
      });
    }
  },

  // Add notification
  addNotification: (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
    };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration);
    }
  },

  // Remove notification
  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  // Clear all notifications
  clearNotifications: () => {
    set({ notifications: [] });
  },

  // Show bottom sheet
  showBottomSheet: () => {
    set({ isBottomSheetVisible: true });
  },

  // Hide bottom sheet
  hideBottomSheet: () => {
    set({ isBottomSheetVisible: false });
  },

  // Show modal
  showModal: () => {
    set({ isModalVisible: true });
  },

  // Hide modal
  hideModal: () => {
    set({ isModalVisible: false });
  },
}));
