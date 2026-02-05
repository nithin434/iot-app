/**
 * Haptic Feedback Utility
 * Provides tactile feedback for user interactions
 * Best practice: Use sparingly for important actions
 */

import * as Haptics from 'expo-haptics';

export const hapticFeedback = {
  /**
   * Light impact - for subtle interactions
   * Use for: Button presses, toggle switches
   */
  light: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not supported on this device
      console.log('Haptics not supported');
    }
  },

  /**
   * Medium impact - for standard interactions
   * Use for: Card taps, list item selection
   */
  medium: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('Haptics not supported');
    }
  },

  /**
   * Heavy impact - for important interactions
   * Use for: Confirmations, deletions, important actions
   */
  heavy: async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.log('Haptics not supported');
    }
  },

  /**
   * Success notification
   * Use for: Successful operations, completions
   */
  success: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('Haptics not supported');
    }
  },

  /**
   * Warning notification
   * Use for: Warnings, cautions
   */
  warning: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.log('Haptics not supported');
    }
  },

  /**
   * Error notification
   * Use for: Errors, failures
   */
  error: async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.log('Haptics not supported');
    }
  },

  /**
   * Selection changed
   * Use for: Picker changes, slider movements
   */
  selection: async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.log('Haptics not supported');
    }
  },
};
