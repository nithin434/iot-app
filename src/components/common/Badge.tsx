/**
 * Badge Component
 * Small badge for status indicators
 */

import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';

export type BadgeVariant = 'primary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
export type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  // Size configurations
  const sizeConfig = {
    small: {
      paddingHorizontal: semanticSpacing.paddingSm,
      paddingVertical: semanticSpacing.paddingXs / 2,
      typography: typography.captionBold,
      borderRadius: semanticSpacing.radiusXs,
    },
    medium: {
      paddingHorizontal: semanticSpacing.paddingMd,
      paddingVertical: semanticSpacing.paddingXs,
      typography: typography.labelSmall,
      borderRadius: semanticSpacing.radiusSm,
    },
    large: {
      paddingHorizontal: semanticSpacing.paddingLg,
      paddingVertical: semanticSpacing.paddingSm,
      typography: typography.label,
      borderRadius: semanticSpacing.radiusMd,
    },
  };

  const config = sizeConfig[size];

  // Variant colors
  const getVariantColors = (): { backgroundColor: string; textColor: string } => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.primaryLight,
          textColor: theme.primary,
        };
      case 'success':
        return {
          backgroundColor: theme.successLight,
          textColor: theme.success,
        };
      case 'error':
        return {
          backgroundColor: theme.errorLight,
          textColor: theme.error,
        };
      case 'warning':
        return {
          backgroundColor: theme.warningLight,
          textColor: theme.warning,
        };
      case 'info':
        return {
          backgroundColor: theme.infoLight,
          textColor: theme.info,
        };
      case 'neutral':
        return {
          backgroundColor: theme.surfaceHover,
          textColor: theme.textSecondary,
        };
      default:
        return {
          backgroundColor: theme.primaryLight,
          textColor: theme.primary,
        };
    }
  };

  const colors = getVariantColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundColor,
          paddingHorizontal: config.paddingHorizontal,
          paddingVertical: config.paddingVertical,
          borderRadius: config.borderRadius,
        },
        style,
      ]}
    >
      <Text
        style={[
          config.typography,
          {
            color: colors.textColor,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
