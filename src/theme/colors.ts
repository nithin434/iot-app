/**
 * Color Palette - Blue Theme
 * Inspired by modern apps like Zomato and Swiggy
 */

export const colors = {
  // Primary Blue Palette
  primary: {
    50: '#EFF6FF',   // Lightest blue for backgrounds
    100: '#DBEAFE',  // Light blue for highlights
    200: '#BFDBFE',  // Soft blue
    300: '#93C5FD',  // Medium light blue
    400: '#60A5FA',  // Medium blue
    500: '#3B82F6',  // Main primary blue
    600: '#2563EB',  // Primary button blue (main CTA color)
    700: '#1D4ED8',  // Darker blue for hover states
    800: '#1E40AF',  // Dark blue for text/headers
    900: '#1E3A8A',  // Darkest blue
  },

  // Neutral Grays
  neutral: {
    50: '#F9FAFB',   // Background light
    100: '#F3F4F6',  // Card background
    200: '#E5E7EB',  // Border light
    300: '#D1D5DB',  // Border
    400: '#9CA3AF',  // Placeholder text
    500: '#6B7280',  // Secondary text
    600: '#4B5563',  // Body text
    700: '#374151',  // Heading text
    800: '#1F2937',  // Dark text
    900: '#111827',  // Darkest text / dark mode bg
  },

  // Semantic Colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',  // Success green
    600: '#059669',
    700: '#047857',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',  // Error red
    600: '#DC2626',
    700: '#B91C1C',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',  // Warning orange
    600: '#D97706',
    700: '#B45309',
  },

  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#3B82F6',  // Info blue
    600: '#2563EB',
    700: '#1D4ED8',
  },

  // Special Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  // Gradient Colors
  gradient: {
    primary: ['#3B82F6', '#2563EB'],
    secondary: ['#60A5FA', '#3B82F6'],
    success: ['#10B981', '#059669'],
    dark: ['#1F2937', '#111827'],
  },
};

// Light Theme
export const lightTheme = {
  // Backgrounds
  background: colors.neutral[50],
  backgroundSecondary: colors.white,
  backgroundTertiary: colors.neutral[100],

  // Cards & Surfaces
  surface: colors.white,
  surfaceSecondary: colors.neutral[50],
  surfaceHover: colors.neutral[100],

  // Text
  text: colors.neutral[800],
  textSecondary: colors.neutral[600],
  textTertiary: colors.neutral[500],
  textDisabled: colors.neutral[400],
  textInverse: colors.white,

  // Primary
  primary: colors.primary[600],
  primaryHover: colors.primary[700],
  primaryActive: colors.primary[800],
  primaryLight: colors.primary[100],
  primaryLighter: colors.primary[50],

  // Borders
  border: colors.neutral[200],
  borderLight: colors.neutral[100],
  borderDark: colors.neutral[300],

  // Status
  success: colors.success[500],
  successLight: colors.success[100],
  error: colors.error[500],
  errorLight: colors.error[100],
  warning: colors.warning[500],
  warningLight: colors.warning[100],
  info: colors.info[500],
  infoLight: colors.info[100],

  // Special
  overlay: colors.overlay,
  shadow: colors.black,
  divider: colors.neutral[200],

  // Tab Bar
  tabBarBackground: colors.white,
  tabBarActive: colors.primary[600],
  tabBarInactive: colors.neutral[500],

  // Input
  inputBackground: colors.white,
  inputBorder: colors.neutral[300],
  inputBorderFocus: colors.primary[600],
  inputPlaceholder: colors.neutral[400],

  // Badge
  badgePrimary: colors.primary[600],
  badgeSuccess: colors.success[500],
  badgeError: colors.error[500],
  badgeWarning: colors.warning[500],
  badgeInfo: colors.info[500],
  badgeNeutral: colors.neutral[500],
};

// Dark Theme
export const darkTheme = {
  // Backgrounds
  background: colors.neutral[900],
  backgroundSecondary: colors.neutral[800],
  backgroundTertiary: colors.neutral[700],

  // Cards & Surfaces
  surface: colors.neutral[800],
  surfaceSecondary: colors.neutral[700],
  surfaceHover: colors.neutral[600],

  // Text
  text: colors.neutral[50],
  textSecondary: colors.neutral[300],
  textTertiary: colors.neutral[400],
  textDisabled: colors.neutral[500],
  textInverse: colors.neutral[900],

  // Primary
  primary: colors.primary[500],
  primaryHover: colors.primary[400],
  primaryActive: colors.primary[300],
  primaryLight: colors.primary[900],
  primaryLighter: colors.primary[800],

  // Borders
  border: colors.neutral[700],
  borderLight: colors.neutral[800],
  borderDark: colors.neutral[600],

  // Status
  success: colors.success[500],
  successLight: colors.success[900],
  error: colors.error[500],
  errorLight: colors.error[900],
  warning: colors.warning[500],
  warningLight: colors.warning[900],
  info: colors.info[500],
  infoLight: colors.info[900],

  // Special
  overlay: colors.overlay,
  shadow: colors.black,
  divider: colors.neutral[700],

  // Tab Bar
  tabBarBackground: colors.neutral[800],
  tabBarActive: colors.primary[500],
  tabBarInactive: colors.neutral[400],

  // Input
  inputBackground: colors.neutral[800],
  inputBorder: colors.neutral[600],
  inputBorderFocus: colors.primary[500],
  inputPlaceholder: colors.neutral[500],

  // Badge
  badgePrimary: colors.primary[500],
  badgeSuccess: colors.success[500],
  badgeError: colors.error[500],
  badgeWarning: colors.warning[500],
  badgeInfo: colors.info[500],
  badgeNeutral: colors.neutral[400],
};

export type Theme = typeof lightTheme;
