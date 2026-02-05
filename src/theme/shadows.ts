/**
 * Shadow Styles
 * Platform-specific shadows for depth and elevation
 */

import { Platform, ViewStyle } from 'react-native';

// iOS Shadows
const iosShadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
  },
};

// Android Elevations
const androidElevations = {
  none: { elevation: 0 },
  xs: { elevation: 1 },
  sm: { elevation: 2 },
  md: { elevation: 4 },
  lg: { elevation: 8 },
  xl: { elevation: 12 },
  '2xl': { elevation: 16 },
};

// Combined shadows (works on both platforms)
export const shadows = {
  none: Platform.select({
    ios: iosShadows.none,
    android: androidElevations.none,
    default: iosShadows.none,
  }) as ViewStyle,

  xs: Platform.select({
    ios: iosShadows.xs,
    android: androidElevations.xs,
    default: iosShadows.xs,
  }) as ViewStyle,

  sm: Platform.select({
    ios: iosShadows.sm,
    android: androidElevations.sm,
    default: iosShadows.sm,
  }) as ViewStyle,

  md: Platform.select({
    ios: iosShadows.md,
    android: androidElevations.md,
    default: iosShadows.md,
  }) as ViewStyle,

  lg: Platform.select({
    ios: iosShadows.lg,
    android: androidElevations.lg,
    default: iosShadows.lg,
  }) as ViewStyle,

  xl: Platform.select({
    ios: iosShadows.xl,
    android: androidElevations.xl,
    default: iosShadows.xl,
  }) as ViewStyle,

  '2xl': Platform.select({
    ios: iosShadows['2xl'],
    android: androidElevations['2xl'],
    default: iosShadows['2xl'],
  }) as ViewStyle,
};

// Semantic shadow names for specific use cases
export const semanticShadows = {
  card: shadows.sm,
  cardHover: shadows.md,
  button: shadows.xs,
  buttonHover: shadows.sm,
  modal: shadows.xl,
  bottomSheet: shadows.lg,
  dropdown: shadows.md,
  fab: shadows.lg,
  header: shadows.xs,
  none: shadows.none,
};

export type ShadowSize = keyof typeof shadows;
export type SemanticShadow = keyof typeof semanticShadows;
