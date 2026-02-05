/**
 * Responsive Utilities
 * Handles responsive sizing for different screen sizes
 */

import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Device type detection
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414 && SCREEN_WIDTH < 768;
export const isTablet = SCREEN_WIDTH >= 768;
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Screen dimensions
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

/**
 * Scale size based on screen width
 */
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

/**
 * Scale size based on screen height
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

/**
 * Moderate scale - less aggressive scaling
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Responsive font size
 */
export const fontSize = (size: number): number => {
  const newSize = scale(size);
  if (isIOS) {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * Get number of columns for grid based on screen size
 */
export const getGridColumns = (minItemWidth: number = 150): number => {
  if (isTablet) {
    return Math.floor(SCREEN_WIDTH / minItemWidth);
  }
  return 2; // Default for mobile
};

/**
 * Get responsive padding
 */
export const getResponsivePadding = (): number => {
  if (isSmallDevice) return 12;
  if (isTablet) return 24;
  return 16;
};

/**
 * Get responsive margin
 */
export const getResponsiveMargin = (): number => {
  if (isSmallDevice) return 8;
  if (isTablet) return 16;
  return 12;
};

/**
 * Get card width for grid
 */
export const getCardWidth = (columns: number = 2, padding: number = 16): number => {
  const totalPadding = padding * 2; // Left and right padding
  const gap = padding; // Gap between cards
  return (SCREEN_WIDTH - totalPadding - gap * (columns - 1)) / columns;
};

/**
 * Get banner height based on screen size
 */
export const getBannerHeight = (): number => {
  if (isSmallDevice) return 160;
  if (isTablet) return 240;
  return 180;
};

/**
 * Get icon size based on screen size
 */
export const getIconSize = (baseSize: number): number => {
  if (isSmallDevice) return baseSize - 4;
  if (isTablet) return baseSize + 8;
  return baseSize;
};

/**
 * Responsive spacing object
 */
export const responsiveSpacing = {
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(24),
  xxl: moderateScale(32),
  xxxl: moderateScale(48),
};

/**
 * Responsive typography sizes
 */
export const responsiveTypography = {
  h1: fontSize(32),
  h2: fontSize(28),
  h3: fontSize(24),
  h4: fontSize(20),
  h5: fontSize(18),
  h6: fontSize(16),
  body: fontSize(16),
  bodySmall: fontSize(14),
  caption: fontSize(12),
  label: fontSize(14),
  labelSmall: fontSize(12),
};

export default {
  scale,
  verticalScale,
  moderateScale,
  fontSize,
  getGridColumns,
  getResponsivePadding,
  getResponsiveMargin,
  getCardWidth,
  getBannerHeight,
  getIconSize,
  responsiveSpacing,
  responsiveTypography,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  screenWidth,
  screenHeight,
};
