/**
 * Input Component
 * Beautiful text input with validation states
 */

import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
  required?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  disabled = false,
  required = false,
  style,
  ...textInputProps
}, ref) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const hasError = !!error;

  const getBorderColor = () => {
    if (hasError) return theme.error;
    if (isFocused) return theme.primary;
    return theme.inputBorder;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[typography.label, { color: theme.text }, styles.label]}>
            {label}
            {required && <Text style={{ color: theme.error }}> *</Text>}
          </Text>
        </View>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: disabled ? theme.surfaceHover : theme.inputBackground,
            borderColor: getBorderColor(),
            borderWidth: 1.5,
            borderRadius: semanticSpacing.radiusMd,
          },
          isFocused && styles.inputFocused,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={[styles.iconContainer, styles.leftIcon]}>
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          ref={ref}
          {...textInputProps}
          style={[
            styles.input,
            typography.body,
            {
              color: theme.text,
              flex: 1,
            },
            style,
          ]}
          placeholderTextColor={theme.inputPlaceholder}
          editable={!disabled}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />

        {/* Right Icon */}
        {rightIcon && (
          <View style={[styles.iconContainer, styles.rightIcon]}>
            {rightIcon}
          </View>
        )}
      </View>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <Text
          style={[
            typography.caption,
            styles.helperText,
            {
              color: hasError ? theme.error : theme.textSecondary,
            },
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    marginBottom: semanticSpacing.marginSm,
  },
  label: {
    marginBottom: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: semanticSpacing.inputMedium,
    paddingHorizontal: semanticSpacing.paddingMd,
  },
  inputFocused: {
    // Additional focus styles can be added here
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    height: '100%',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftIcon: {
    marginRight: semanticSpacing.gapSm,
  },
  rightIcon: {
    marginLeft: semanticSpacing.gapSm,
  },
  helperText: {
    marginTop: semanticSpacing.marginXs,
    marginLeft: semanticSpacing.marginXs,
  },
});
