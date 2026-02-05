/**
 * OTP Verification Screen
 * Beautiful OTP input with auto-advance and countdown timer
 * Best practice: Make verification smooth and error-tolerant
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Button, LoadingSpinner } from '../../components/common';
import { FadeIn, SlideUp, ScaleIn } from '../../components/animations';
import { useAuthStore } from '../../stores';
import { hapticFeedback } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OTPVerification'>;
type RoutePropType = RouteProp<AuthStackParamList, 'OTPVerification'>;

const OTP_LENGTH = 6;
const RESEND_TIMEOUT = 60; // seconds

export const OTPVerificationScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { sessionId, phone } = route.params;
  
  const { verifyOTP, sendOTP, isLoading, error, clearError } = useAuthStore();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(RESEND_TIMEOUT);
  const [canResend, setCanResend] = useState(false);
  const [showError, setShowError] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    const otpString = otp.join('');
    if (otpString.length === OTP_LENGTH) {
      handleVerifyOTP(otpString);
    }
  }, [otp]);

  const handleOTPChange = (value: string, index: number) => {
    clearError();
    setShowError(false);

    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpString: string) => {
    try {
      hapticFeedback.light();
      await verifyOTP(sessionId, otpString);
      hapticFeedback.success();
      // Navigation will be handled by AppNavigator based on auth state
    } catch (err) {
      hapticFeedback.error();
      setShowError(true);
      shakeInputs();
      // Clear OTP on error
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      hapticFeedback.light();
      await sendOTP(phone);
      hapticFeedback.success();
      setTimer(RESEND_TIMEOUT);
      setCanResend(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      hapticFeedback.error();
    }
  };

  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatPhone = (phoneNumber: string) => {
    // Format: +91 XXXXX XXXXX
    return phoneNumber.replace(/(\+\d{2})(\d{5})(\d{5})/, '$1 $2 $3');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={24}
          color={theme.text}
        />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Header */}
        <FadeIn>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
              <MaterialCommunityIcons
                name="message-text"
                size={48}
                color={theme.primary}
              />
            </View>
            <Text style={[typography.h1, styles.title, { color: theme.text }]}>
              Verify OTP
            </Text>
            <Text style={[typography.body, styles.subtitle, { color: theme.textSecondary }]}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={{ color: theme.text, fontWeight: '600' }}>
                {formatPhone(phone)}
              </Text>
            </Text>
          </View>
        </FadeIn>

        {/* OTP Input */}
        <SlideUp delay={200}>
          <Animated.View
            style={[
              styles.otpContainer,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            {otp.map((digit, index) => (
              <ScaleIn key={index} delay={index * 50}>
                <TextInput
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    {
                      backgroundColor: theme.surface,
                      borderColor: showError
                        ? theme.error
                        : digit
                        ? theme.primary
                        : theme.border,
                      color: theme.text,
                    },
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(value, index)}
                  onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(key, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  autoFocus={index === 0}
                />
              </ScaleIn>
            ))}
          </Animated.View>
        </SlideUp>

        {/* Error Message */}
        {showError && error && (
          <FadeIn>
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={16}
                color={theme.error}
              />
              <Text style={[typography.caption, { color: theme.error, marginLeft: 4 }]}>
                {error}
              </Text>
            </View>
          </FadeIn>
        )}

        {/* Timer & Resend */}
        <SlideUp delay={400}>
          <View style={styles.timerContainer}>
            {!canResend ? (
              <Text style={[typography.body, { color: theme.textSecondary }]}>
                Resend code in{' '}
                <Text style={{ color: theme.primary, fontWeight: '600' }}>
                  {timer}s
                </Text>
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP} activeOpacity={0.7}>
                <Text style={[typography.label, { color: theme.primary }]}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SlideUp>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="small" text="Verifying..." />
          </View>
        )}

        {/* Help Text */}
        <FadeIn delay={600}>
          <Text style={[typography.caption, styles.helpText, { color: theme.textTertiary }]}>
            Didn't receive the code? Check your phone number or try again
          </Text>
        </FadeIn>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingTop: semanticSpacing.paddingXl,
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
    lineHeight: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: semanticSpacing.marginLg,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: semanticSpacing.radiusMd,
    borderWidth: 2,
    marginHorizontal: 4,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: semanticSpacing.marginMd,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: semanticSpacing.marginXl,
  },
  loadingContainer: {
    marginVertical: semanticSpacing.marginLg,
  },
  helpText: {
    textAlign: 'center',
    marginTop: semanticSpacing.marginXl,
    lineHeight: 18,
  },
});
