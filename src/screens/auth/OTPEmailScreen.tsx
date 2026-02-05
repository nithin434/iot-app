/**
 * OTP Email Verification Screen
 * Send and verify OTP via email for authentication
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
  Keyboard,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Button, Input, LoadingSpinner } from '../../components/common';
import { FadeIn, SlideUp } from '../../components/animations';
import { useAuthStore } from '../../stores';
import { hapticFeedback } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OTPEmail'>;

export const OTPEmailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { sendOTP, verifyOTP, isLoading, error, clearError } = useAuthStore();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [otp, setOtp] = useState('');
  const [emailError, setEmailError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otpInputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    }
  }, [timeLeft]);

  const validateEmail = (emailText: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailText)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSendOTP = async () => {
    clearError();
    
    if (!validateEmail(email)) {
      return;
    }

    hapticFeedback.light();

    try {
      const response = await sendOTP(email);
      hapticFeedback.success();
      setSessionId(response.sessionId);
      setStep('otp');
      setTimeLeft(300); // 5 minutes
    } catch (err: any) {
      hapticFeedback.error();
    }
  };

  const handleVerifyOTP = async () => {
    clearError();

    if (!otp || otp.length !== 6) {
      hapticFeedback.warning();
      return;
    }

    hapticFeedback.light();

    try {
      await verifyOTP(sessionId, otp);
      hapticFeedback.success();
      // Navigation handled by store listener
    } catch (err: any) {
      hapticFeedback.error();
    }
  };

  const handleResendOTP = async () => {
    clearError();
    hapticFeedback.light();

    try {
      const response = await sendOTP(email);
      hapticFeedback.success();
      setSessionId(response.sessionId);
      setOtp('');
      setTimeLeft(300);
    } catch (err: any) {
      hapticFeedback.error();
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setTimeLeft(0);
  };

  const handleOTPBoxPress = () => {
    otpInputRef.current?.focus();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <FadeIn delay={200}>
            <View style={styles.header}>
              <MaterialCommunityIcons
                name="email-fast"
                size={64}
                color={theme.primary}
              />
              <Text
                style={[
                  styles.title,
                  typography.h2,
                  { color: theme.text },
                ]}
              >
                {step === 'email' ? 'Email Verification' : 'Enter OTP'}
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  typography.body2,
                  { color: theme.textSecondary },
                ]}
              >
                {step === 'email'
                  ? 'Enter your email to receive a one-time password'
                  : `We sent a code to ${email}`}
              </Text>
            </View>
          </FadeIn>

          {step === 'email' ? (
            <SlideUp delay={400}>
              <View style={styles.content}>
                <Input
                  label="Email Address"
                  placeholder="your.email@example.com"
                  value={email}
                  onChangeText={(text: string) => {
                    setEmail(text);
                    setEmailError('');
                  }}
                  keyboardType="email-address"
                  editable={!isLoading}
                  error={emailError || error || undefined}
                />

                {error && !emailError && (
                  <View
                    style={[
                      styles.errorBox,
                      { backgroundColor: theme.error + '10' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="alert-circle"
                      size={16}
                      color={theme.error}
                    />
                    <Text
                      style={[
                        styles.errorText,
                        typography.caption,
                        { color: theme.error },
                      ]}
                    >
                      {error}
                    </Text>
                  </View>
                )}

                <Button
                  title={isLoading ? 'Sending...' : 'Send OTP'}
                  onPress={handleSendOTP}
                  disabled={!email || !!emailError || isLoading}
                  loading={isLoading}
                  style={styles.button}
                />

                <TouchableOpacity
                  onPress={() => navigation.navigate('PhoneAuth')}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.switchText,
                      typography.body2,
                      { color: theme.primary },
                    ]}
                  >
                    Use phone number instead
                  </Text>
                </TouchableOpacity>
              </View>
            </SlideUp>
          ) : (
            <SlideUp delay={400}>
              <View style={styles.content}>
                <Text
                  style={[
                    styles.otpLabel,
                    typography.body2,
                    { color: theme.text },
                  ]}
                >
                  6-Digit Code
                </Text>
                <Pressable onPress={handleOTPBoxPress}>
                  <View style={styles.otpInputContainer}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <View
                        key={index}
                        style={[
                          styles.otpBox,
                          {
                            borderColor:
                              otp.length > index
                                ? theme.primary
                                : theme.border,
                            backgroundColor: theme.surface,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.otpText,
                            typography.h3,
                            { color: theme.text },
                          ]}
                        >
                          {otp[index] || ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Pressable>

                <RNTextInput
                  ref={otpInputRef}
                  style={styles.otpInputHidden}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  autoFocus={true}
                  editable={!isLoading}
                  selectTextOnFocus
                  caretHidden
                />

                {error && (
                  <View
                    style={[
                      styles.errorBox,
                      { backgroundColor: theme.error + '10' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="alert-circle"
                      size={16}
                      color={theme.error}
                    />
                    <Text
                      style={[
                        styles.errorText,
                        typography.caption,
                        { color: theme.error },
                      ]}
                    >
                      {error}
                    </Text>
                  </View>
                )}

                <View style={styles.timerContainer}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={16}
                    color={
                      timeLeft < 60 ? theme.error : theme.primary
                    }
                  />
                  <Text
                    style={[
                      styles.timerText,
                      typography.body2,
                      {
                        color:
                          timeLeft < 60
                            ? theme.error
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </Text>
                </View>

                <Button
                  title={isLoading ? 'Verifying...' : 'Verify OTP'}
                  onPress={handleVerifyOTP}
                  disabled={otp.length !== 6 || isLoading}
                  loading={isLoading}
                  style={styles.button}
                />

                {timeLeft === 0 ? (
                  <Button
                    title="Resend OTP"
                    onPress={handleResendOTP}
                    variant="outline"
                    disabled={isLoading}
                    style={styles.button}
                  />
                ) : null}

                <TouchableOpacity
                  onPress={handleBackToEmail}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      styles.switchText,
                      typography.body2,
                      { color: theme.primary },
                    ]}
                  >
                    ← Change email
                  </Text>
                </TouchableOpacity>
              </View>
            </SlideUp>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: semanticSpacing.paddingLg,
    paddingVertical: semanticSpacing.paddingLg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: semanticSpacing.marginXl,
  },
  title: {
    marginTop: semanticSpacing.marginLg,
    marginBottom: semanticSpacing.marginSm,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: semanticSpacing.marginMd,
  },
  content: {
    gap: semanticSpacing.marginLg,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.paddingMd,
    paddingVertical: semanticSpacing.paddingSm,
    borderRadius: 8,
    gap: semanticSpacing.marginSm,
  },
  errorText: {
    flex: 1,
  },
  button: {
    marginTop: semanticSpacing.marginMd,
  },
  switchText: {
    textAlign: 'center',
    marginTop: semanticSpacing.marginLg,
  },
  otpLabel: {
    marginBottom: semanticSpacing.marginSm,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: semanticSpacing.marginSm,
    marginBottom: semanticSpacing.marginLg,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpText: {
    fontWeight: '600',
  },
  otpInputHidden: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 1,
    height: 1,
    opacity: 0.01,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: semanticSpacing.marginSm,
    paddingVertical: semanticSpacing.paddingMd,
  },
  timerText: {
    fontWeight: '600',
  },
});
