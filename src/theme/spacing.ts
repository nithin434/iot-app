/**
 * Spacing System - 8px Grid
 * Consistent spacing throughout the app
 */

export const spacing = {
  0: 0,
  1: 4,    // 0.5 * 8
  2: 8,    // 1 * 8
  3: 12,   // 1.5 * 8
  4: 16,   // 2 * 8
  5: 20,   // 2.5 * 8
  6: 24,   // 3 * 8
  7: 28,   // 3.5 * 8
  8: 32,   // 4 * 8
  10: 40,  // 5 * 8
  12: 48,  // 6 * 8
  16: 64,  // 8 * 8
  20: 80,  // 10 * 8
  24: 96,  // 12 * 8
  32: 128, // 16 * 8
  40: 160, // 20 * 8
  48: 192, // 24 * 8
  56: 224, // 28 * 8
  64: 256, // 32 * 8
};

// Semantic spacing names
export const semanticSpacing = {
  // Padding
  paddingXs: spacing[1],
  paddingSm: spacing[2],
  paddingMd: spacing[4],
  paddingLg: spacing[6],
  paddingXl: spacing[8],
  padding2xl: spacing[12],

  // Margin
  marginXs: spacing[1],
  marginSm: spacing[2],
  marginMd: spacing[4],
  marginLg: spacing[6],
  marginXl: spacing[8],
  margin2xl: spacing[12],

  // Gap (for flex/grid)
  gapXs: spacing[1],
  gapSm: spacing[2],
  gapMd: spacing[4],
  gapLg: spacing[6],
  gapXl: spacing[8],

  // Screen padding (horizontal)
  screenPaddingX: spacing[4],
  screenPaddingXLarge: spacing[6],

  // Screen padding (vertical)
  screenPaddingY: spacing[4],
  screenPaddingYLarge: spacing[6],

  // Component spacing
  componentSpacing: spacing[4],
  sectionSpacing: spacing[6],
  cardSpacing: spacing[4],

  // Icon sizes
  iconXs: 16,
  iconSm: 20,
  iconMd: 24,
  iconLg: 32,
  iconXl: 40,
  icon2xl: 48,

  // Avatar sizes
  avatarXs: 24,
  avatarSm: 32,
  avatarMd: 40,
  avatarLg: 48,
  avatarXl: 64,
  avatar2xl: 96,

  // Button heights
  buttonSmall: 32,
  buttonMedium: 40,
  buttonLarge: 48,
  buttonXLarge: 56,

  // Input heights
  inputSmall: 32,
  inputMedium: 40,
  inputLarge: 48,

  // Border radius
  radiusXs: 4,
  radiusSm: 6,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radius2xl: 24,
  radiusFull: 9999,

  // Card dimensions
  cardMinHeight: 120,
  cardImageHeight: 200,
  productCardHeight: 280,
  projectCardHeight: 320,

  // Header heights
  headerHeight: 56,
  tabBarHeight: 60,
  bottomSheetHandleHeight: 4,

  // Safe area
  safeAreaTop: 44,
  safeAreaBottom: 34,
};

export type Spacing = keyof typeof spacing;
export type SemanticSpacing = keyof typeof semanticSpacing;
