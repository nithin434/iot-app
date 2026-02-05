/**
 * Button Component
 * Beautiful, accessible button with multiple variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  // Size configurations
  const sizeConfig = {
    small: {
      height: semanticSpacing.buttonSmall,
      paddingHorizontal: semanticSpacing.paddingMd,
      typography: typography.buttonSmall,
      iconSize: semanticSpacing.iconSm,
    },
    medium: {
      height: semanticSpacing.buttonMedium,
      paddingHorizontal: semanticSpacing.paddingLg,
      typography: typography.button,
      iconSize: semanticSpacing.iconMd,
    },
    large: {
      height: semanticSpacing.buttonLarge,
      paddingHorizontal: semanticSpacing.paddingXl,
      typography: typography.buttonLarge,
      iconSize: semanticSpacing.iconLg,
    },
  };

  const config = sizeConfig[size];

  // Variant styles
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    const isDisabled = disabled || loading;

    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? theme.primary + '60' : theme.primary,
            ...shadows.button,
          },
          text: {
            color: theme.textInverse,
          },
        };

      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled ? theme.primaryLight : theme.primaryLight,
            ...shadows.button,
          },
          text: {
            color: isDisabled ? theme.primary + '60' : theme.primary,
          },
        };

      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: isDisabled ? theme.border : theme.primary,
          },
          text: {
            color: isDisabled ? theme.textDisabled : theme.primary,
          },
        };

      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: isDisabled ? theme.textDisabled : theme.primary,
          },
        };

      case 'danger':
        return {
          container: {
            backgroundColor: isDisabled ? theme.error + '60' : theme.error,
            ...shadows.button,
          },
          text: {
            color: theme.textInverse,
          },
        };

      default:
        return {
          container: {
            backgroundColor: theme.primary,
          },
          text: {
            color: theme.textInverse,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? theme.textInverse : theme.primary}
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <View style={[styles.iconContainer, { marginRight: semanticSpacing.gapSm }]}>
            {icon}
          </View>
        )}
        <Text
          style={[
            config.typography,
            variantStyles.text,
            textStyle,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {icon && iconPosition === 'right' && (
          <View style={[styles.iconContainer, { marginLeft: semanticSpacing.gapSm }]}>
            {icon}
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          height: config.height,
          paddingHorizontal: config.paddingHorizontal,
          borderRadius: semanticSpacing.radiusMd,
        },
        variantStyles.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
});
