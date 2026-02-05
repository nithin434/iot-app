/**
 * Email Authentication Screen
 * Email and password login with validation
 * Best practice: Provide alternative authentication method
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Button, Input } from '../../components/common';
import { FadeIn, SlideUp } from '../../components/animations';
import { useAuthStore } from '../../stores';
import { hapticFeedback } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'EmailAuth'>;

export const EmailAuthScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { loginWithEmail, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (emailText: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailText)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (passwordText: string): boolean => {
    if (passwordText.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async () => {
    clearError();

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      hapticFeedback.error();
      return;
    }

    try {
      hapticFeedback.light();
      await loginWithEmail(email, password);
      hapticFeedback.success();
      // Navigation will be handled by AppNavigator based on auth state
    } catch (err) {
      hapticFeedback.error();
      console.error('Login error:', err);
    }
  };

  const handleBackToPhone = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackToPhone}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={theme.text}
        />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <FadeIn>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                <MaterialCommunityIcons
                  name="email"
                  size={48}
                  color={theme.primary}
                />
              </View>
              <Text style={[typography.h1, styles.title, { color: theme.text }]}>
                Email Login
              </Text>
              <Text style={[typography.body, styles.subtitle, { color: theme.textSecondary }]}>
                Sign in with your email and password
              </Text>
            </View>
          </FadeIn>

          {/* Email Input */}
          <SlideUp delay={200}>
            <View style={styles.inputContainer}>
              <Input
                label="Email Address"
                placeholder="your.email@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text.toLowerCase().trim());
                  if (emailError) setEmailError('');
                  if (error) clearError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
                leftIcon={
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={20}
                    color={theme.textSecondary}
                  />
                }
              />
            </View>
          </SlideUp>

          {/* Password Input */}
          <SlideUp delay={400}>
            <View style={styles.inputContainer}>
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                  if (error) clearError();
                }}
                secureTextEntry={!showPassword}
                error={passwordError || error || undefined}
                leftIcon={
                  <MaterialCommunityIcons
                    name="lock-outline"
                    size={20}
                    color={theme.textSecondary}
                  />
                }
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color={theme.textSecondary}
                    />
                  </TouchableOpacity>
                }
              />
            </View>
          </SlideUp>

          {/* Forgot Password */}
          <SlideUp delay={600}>
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => {
                // TODO: Implement forgot password
                hapticFeedback.light();
              }}
              activeOpacity={0.7}
            >
              <Text style={[typography.label, { color: theme.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          </SlideUp>

          {/* Login Button */}
          <SlideUp delay={800}>
            <View style={styles.buttonContainer}>
              <Button
                title="Login"
                onPress={handleLogin}
                variant="primary"
                fullWidth
                loading={isLoading}
                disabled={!email || !password}
              />
            </View>
          </SlideUp>

          {/* Divider */}
          <SlideUp delay={1000}>
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                OR
              </Text>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>
          </SlideUp>

          {/* Back to Phone Login */}
          <SlideUp delay={1200}>
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={handleBackToPhone}
              activeOpacity={0.7}
            >
              <Text style={[typography.label, { color: theme.primary }]}>
                Login with Phone Number
              </Text>
            </TouchableOpacity>
          </SlideUp>

          {/* Sign Up Link */}
          <FadeIn delay={1400}>
            <View style={styles.signupContainer}>
              <Text style={[typography.body, { color: theme.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  // TODO: Navigate to sign up
                  hapticFeedback.light();
                }}
                activeOpacity={0.7}
              >
                <Text style={[typography.label, { color: theme.primary }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </FadeIn>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    padding: semanticSpacing.paddingMd,
    marginLeft: semanticSpacing.marginSm,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingTop: semanticSpacing.paddingLg,
  },
  header: {
    alignItems: 'center',
    marginBottom: semanticSpacing.marginXl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: semanticSpacing.radiusFull,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: semanticSpacing.marginLg,
  },
  title: {
    marginBottom: semanticSpacing.marginSm,
  },
  subtitle: {
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: semanticSpacing.marginLg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: semanticSpacing.marginLg,
  },
  buttonContainer: {
    marginBottom: semanticSpacing.marginXl,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: semanticSpacing.marginLg,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  phoneButton: {
    alignItems: 'center',
    paddingVertical: semanticSpacing.paddingMd,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: semanticSpacing.marginXl,
  },
});
