/**
 * Phone Authentication Screen
 * Beautiful phone number input with country code selector
 * Best practice: Make authentication smooth and trustworthy
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
import { Button, Input, LoadingSpinner } from '../../components/common';
import { FadeIn, SlideUp } from '../../components/animations';
import { useAuthStore } from '../../stores';
import { hapticFeedback } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'PhoneAuth'>;

export const PhoneAuthScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { sendOTP, isLoading, error, clearError } = useAuthStore();

  const [countryCode, setCountryCode] = useState('+91'); // Default India
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (phone: string): boolean => {
    // Basic validation - 10 digits for Indian numbers
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSendOTP = async () => {
    clearError();
    
    if (!validatePhone(phoneNumber)) {
      hapticFeedback.error();
      return;
    }

    try {
      hapticFeedback.light();
      const fullPhone = `${countryCode}${phoneNumber}`;
      const response = await sendOTP(fullPhone);
      
      hapticFeedback.success();
      navigation.navigate('OTPVerification', {
        sessionId: response.sessionId,
        phone: fullPhone,
      });
    } catch (err: any) {
      hapticFeedback.error();
      console.error('OTP send error:', err);
    }
  };

  const handleEmailLogin = () => {
    navigation.navigate('EmailAuth');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
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
                  name="cellphone"
                  size={48}
                  color={theme.primary}
                />
              </View>
              <Text style={[typography.h1, styles.title, { color: theme.text }]}>
                Welcome Back
              </Text>
              <Text style={[typography.body, styles.subtitle, { color: theme.textSecondary }]}>
                Enter your phone number to continue
              </Text>
            </View>
          </FadeIn>

          {/* Phone Input */}
          <SlideUp delay={200}>
            <View style={styles.inputContainer}>
              {/* Country Code Selector */}
              <TouchableOpacity
                style={[
                  styles.countryCodeButton,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => {
                  // TODO: Implement country code picker
                  hapticFeedback.light();
                }}
              >
                <Text style={[typography.body, { color: theme.text }]}>
                  🇮🇳 {countryCode}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>

              {/* Phone Number Input */}
              <View style={styles.phoneInputWrapper}>
                <Input
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text.replace(/[^0-9]/g, ''));
                    if (phoneError) setPhoneError('');
                  }}
                  keyboardType="phone-pad"
                  maxLength={10}
                  error={phoneError || error || undefined}
                  leftIcon={
                    <MaterialCommunityIcons
                      name="phone"
                      size={20}
                      color={theme.textSecondary}
                    />
                  }
                />
              </View>
            </View>
          </SlideUp>

          {/* Send OTP Button */}
          <SlideUp delay={400}>
            <View style={styles.buttonContainer}>
              <Button
                title="Send OTP"
                onPress={handleSendOTP}
                variant="primary"
                fullWidth
                loading={isLoading}
                disabled={phoneNumber.length !== 10}
              />
            </View>
          </SlideUp>

          {/* Divider */}
          <SlideUp delay={600}>
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                OR
              </Text>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
            </View>
          </SlideUp>

          {/* Email Login Option */}
          <SlideUp delay={800}>
            <TouchableOpacity
              style={styles.emailButton}
              onPress={handleEmailLogin}
              activeOpacity={0.7}
            >
              <Text style={[typography.label, { color: theme.primary }]}>
                Continue with Email
              </Text>
            </TouchableOpacity>
          </SlideUp>

          {/* Terms & Privacy */}
          <FadeIn delay={1000}>
            <Text style={[typography.caption, styles.terms, { color: theme.textTertiary }]}>
              By continuing, you agree to our{' '}
              <Text style={{ color: theme.primary }}>Terms of Service</Text> and{' '}
              <Text style={{ color: theme.primary }}>Privacy Policy</Text>
            </Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: semanticSpacing.marginLg,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.paddingMd,
    borderRadius: semanticSpacing.radiusMd,
    borderWidth: 1.5,
    marginRight: semanticSpacing.marginSm,
    height: semanticSpacing.inputMedium,
  },
  phoneInputWrapper: {
    flex: 1,
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
  emailButton: {
    alignItems: 'center',
    paddingVertical: semanticSpacing.paddingMd,
  },
  terms: {
    textAlign: 'center',
    marginTop: semanticSpacing.marginXl,
    lineHeight: 18,
  },
});
