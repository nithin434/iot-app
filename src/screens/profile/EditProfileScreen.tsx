/**
 * Edit Profile Screen
 * Edit user profile information
 * Design Reference: Apple Settings, clean forms
 * Best practice: Clear sections, inline validation, auto-save indication
 * Industry-grade UX: Photo picker, grouped fields, save feedback
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProfileStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Button, Input } from '../../components/common';
import { FadeIn } from '../../components/animations';
import { useAuthStore } from '../../stores';
import { hapticFeedback } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
}

export const EditProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();

  const emailRef = useRef<RNTextInput>(null);

  const [formData, setFormData] = useState<ProfileForm>({
    name: user?.name || 'Rahul Sharma',
    email: user?.email || 'rahul.sharma@example.com',
    phone: user?.phone || '+91 98765 43210',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to discard them?',
        [
          {
            text: 'Keep Editing',
            style: 'cancel',
            onPress: () => hapticFeedback.light(),
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              hapticFeedback.light();
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      hapticFeedback.light();
      navigation.goBack();
    }
  };

  const updateField = (field: keyof ProfileForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      hapticFeedback.error();
      return;
    }

    hapticFeedback.medium();
    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Update profile via API
      hapticFeedback.success();
      setHasChanges(false);
      
      Alert.alert(
        'Success',
        'Your profile has been updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      hapticFeedback.error();
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePhoto = () => {
    hapticFeedback.light();
    Alert.alert(
      'Change Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => {
            // Open camera
          },
        },
        {
          text: 'Choose from Library',
          onPress: () => {
            // Open photo library
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[typography.h3, { color: theme.text, flex: 1 }]}>
            Edit Profile
          </Text>
          {hasChanges && (
            <View style={[styles.changeIndicator, { backgroundColor: theme.warning }]} />
          )}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <FadeIn delay={50}>
            <View style={[styles.avatarSection, { backgroundColor: theme.surface }]}>
              <LinearGradient
                colors={[theme.primary + '20', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              />

              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[theme.primary, theme.primaryLight]}
                  style={styles.avatar}
                >
                  <Text style={[typography.h1, { color: theme.textInverse, fontSize: 36 }]}>
                    {formData.name.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
              </View>

              <TouchableOpacity
                style={[styles.changePhotoButton, { backgroundColor: theme.primaryLight }]}
                onPress={handleChangePhoto}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="camera" size={18} color={theme.primary} />
                <Text style={[typography.label, { color: theme.primary, marginLeft: 8 }]}>
                  Change Photo
                </Text>
              </TouchableOpacity>
            </View>
          </FadeIn>

          {/* Personal Information */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <View style={styles.section}>
              <Text
                style={[
                  typography.caption,
                  {
                    color: theme.textSecondary,
                    paddingHorizontal: semanticSpacing.screenPaddingX,
                    paddingVertical: semanticSpacing.paddingSm,
                    fontWeight: '600',
                  },
                ]}
              >
                PERSONAL INFORMATION
              </Text>

              <View style={[styles.formGroup, { backgroundColor: theme.surface }]}>
                <View style={[styles.formItem, { borderBottomColor: theme.border }]}>
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChangeText={(text) => updateField('name', text)}
                    placeholder="Enter your full name"
                    error={errors.name}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.formItem}>
                  <Input
                    ref={emailRef}
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(text) => updateField('email', text)}
                    placeholder="Enter your email"
                    error={errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Contact Information */}
          <Animated.View entering={FadeInDown.delay(150)}>
            <View style={styles.section}>
              <Text
                style={[
                  typography.caption,
                  {
                    color: theme.textSecondary,
                    paddingHorizontal: semanticSpacing.screenPaddingX,
                    paddingVertical: semanticSpacing.paddingSm,
                    fontWeight: '600',
                  },
                ]}
              >
                CONTACT INFORMATION
              </Text>

              <View style={[styles.formGroup, { backgroundColor: theme.surface }]}>
                <View style={styles.infoItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.caption, { color: theme.textSecondary }]}>
                      Phone Number
                    </Text>
                    <Text style={[typography.body, { color: theme.text, marginTop: 4 }]}>
                      {formData.phone}
                    </Text>
                  </View>
                  <View style={[styles.lockedBadge, { backgroundColor: theme.backgroundSecondary }]}>
                    <MaterialCommunityIcons name="lock" size={16} color={theme.textSecondary} />
                    <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 4 }]}>
                      Verified
                    </Text>
                  </View>
                </View>
              </View>

              <Text
                style={[
                  typography.caption,
                  {
                    color: theme.textSecondary,
                    paddingHorizontal: semanticSpacing.screenPaddingX,
                    marginTop: semanticSpacing.marginSm,
                  },
                ]}
              >
                Phone number cannot be changed as it's verified
              </Text>
            </View>
          </Animated.View>

          {/* Account Info */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <View style={styles.section}>
              <Text
                style={[
                  typography.caption,
                  {
                    color: theme.textSecondary,
                    paddingHorizontal: semanticSpacing.screenPaddingX,
                    paddingVertical: semanticSpacing.paddingSm,
                    fontWeight: '600',
                  },
                ]}
              >
                ACCOUNT
              </Text>

              <View style={[styles.formGroup, { backgroundColor: theme.surface }]}>
                <View style={styles.infoItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.caption, { color: theme.textSecondary }]}>
                      Member Since
                    </Text>
                    <Text style={[typography.body, { color: theme.text, marginTop: 4 }]}>
                      January 2024
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Bar */}
        {hasChanges && (
          <Animated.View
            entering={FadeInDown}
            style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}
          >
            <LinearGradient
              colors={[theme.surface, theme.surface + 'F0']}
              style={styles.bottomGradient}
            />
            <View style={styles.bottomContent}>
              <Button
                title="Save Changes"
                onPress={handleSave}
                variant="primary"
                loading={isSaving}
                disabled={isSaving}
                icon={<MaterialCommunityIcons name="check" size={20} color={theme.textInverse} />}
              />
            </View>
          </Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingVertical: semanticSpacing.paddingMd,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  changeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: semanticSpacing.paddingXl,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: semanticSpacing.paddingXl,
    marginBottom: semanticSpacing.marginLg,
    overflow: 'hidden',
  },
  avatarGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  avatarContainer: {
    marginBottom: semanticSpacing.marginMd,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: semanticSpacing.radiusLg,
  },
  section: {
    marginBottom: semanticSpacing.marginLg,
  },
  formGroup: {
    marginHorizontal: semanticSpacing.screenPaddingX,
    borderRadius: semanticSpacing.radiusLg,
    overflow: 'hidden',
  },
  formItem: {
    paddingHorizontal: semanticSpacing.paddingMd,
    paddingVertical: semanticSpacing.paddingSm,
    borderBottomWidth: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.paddingMd,
    paddingVertical: semanticSpacing.paddingMd,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: semanticSpacing.radiusMd,
  },
  bottomBar: {
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  bottomGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomContent: {
    padding: semanticSpacing.paddingMd,
  },
});
