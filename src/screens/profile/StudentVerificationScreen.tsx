/**
 * Student Verification Screen
 * Verify student status for discounts
 * Design Reference: Clean, step-by-step verification
 * Best practice: Clear benefits, multiple verification methods
 * Industry-grade UX: Upload progress, verification status, benefits list
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { Button, Card, Input } from '../../components/common';
import { FadeIn } from '../../components/animations';
import { hapticFeedback } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'StudentVerification'>;

type VerificationStatus = 'not_verified' | 'pending' | 'verified' | 'rejected';

const BENEFITS = [
  {
    id: '1',
    icon: 'tag-percent',
    title: 'Exclusive Discounts',
    description: 'Get up to 20% off on all products',
  },
  {
    id: '2',
    icon: 'lightning-bolt',
    title: 'Early Access',
    description: 'Be the first to try new products',
  },
  {
    id: '3',
    icon: 'gift',
    title: 'Special Offers',
    description: 'Student-only deals and bundles',
  },
  {
    id: '4',
    icon: 'truck-fast',
    title: 'Free Shipping',
    description: 'On orders above ₹499',
  },
];

export const StudentVerificationScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const [status, setStatus] = useState<VerificationStatus>('verified'); // Mock: already verified
  const [collegeEmail, setCollegeEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const handleEmailVerification = async () => {
    if (!collegeEmail.trim()) {
      Alert.alert('Error', 'Please enter your college email');
      return;
    }

    if (!collegeEmail.endsWith('.edu') && !collegeEmail.includes('.ac.')) {
      Alert.alert('Error', 'Please enter a valid college/university email');
      return;
    }

    hapticFeedback.medium();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus('pending');
      hapticFeedback.success();
      
      Alert.alert(
        'Verification Email Sent',
        'Please check your college email and click the verification link.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      hapticFeedback.error();
      Alert.alert('Error', 'Failed to send verification email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentUpload = () => {
    hapticFeedback.light();
    Alert.alert(
      'Upload Student ID',
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

  const renderStatusCard = () => {
    const statusConfig = {
      not_verified: {
        icon: 'alert-circle',
        color: theme.warning,
        bgColor: theme.warningLight,
        title: 'Not Verified',
        description: 'Verify your student status to unlock exclusive benefits',
      },
      pending: {
        icon: 'clock-outline',
        color: theme.primary,
        bgColor: theme.primaryLight,
        title: 'Verification Pending',
        description: 'We are reviewing your verification request',
      },
      verified: {
        icon: 'check-decagram',
        color: theme.success,
        bgColor: theme.successLight,
        title: 'Verified Student',
        description: 'You are enjoying all student benefits',
      },
      rejected: {
        icon: 'close-circle',
        color: theme.error,
        bgColor: theme.errorLight,
        title: 'Verification Failed',
        description: 'Please try again with valid documents',
      },
    };

    const config = statusConfig[status];

    return (
      <Card style={[styles.statusCard, { backgroundColor: config.bgColor }]}>
        <View style={styles.statusContent}>
          <View style={[styles.statusIcon, { backgroundColor: config.color }]}>
            <MaterialCommunityIcons name={config.icon as any} size={32} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[typography.h3, { color: config.color }]}>
              {config.title}
            </Text>
            <Text style={[typography.body, { color: theme.text, marginTop: 4 }]}>
              {config.description}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderBenefits = () => (
    <Card style={[styles.benefitsCard, { backgroundColor: theme.surface }]}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="star-circle" size={24} color={theme.primary} />
        <Text style={[typography.h3, { color: theme.text, marginLeft: 12 }]}>
          Student Benefits
        </Text>
      </View>

      {BENEFITS.map((benefit, index) => (
        <Animated.View
          key={benefit.id}
          entering={FadeInDown.delay(index * 100)}
          style={[
            styles.benefitItem,
            {
              borderBottomWidth: index < BENEFITS.length - 1 ? 1 : 0,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <View style={[styles.benefitIcon, { backgroundColor: theme.primaryLight }]}>
            <MaterialCommunityIcons
              name={benefit.icon as any}
              size={24}
              color={theme.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.h4, { color: theme.text }]}>
              {benefit.title}
            </Text>
            <Text style={[typography.body, { color: theme.textSecondary, marginTop: 4 }]}>
              {benefit.description}
            </Text>
          </View>
        </Animated.View>
      ))}
    </Card>
  );

  const renderVerificationMethods = () => {
    if (status === 'verified') return null;

    return (
      <>
        {/* Email Verification */}
        <Card style={[styles.methodCard, { backgroundColor: theme.surface }]}>
          <View style={styles.methodHeader}>
            <View style={[styles.methodIcon, { backgroundColor: theme.primaryLight }]}>
              <MaterialCommunityIcons name="email" size={24} color={theme.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[typography.h4, { color: theme.text }]}>
                College Email Verification
              </Text>
              <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
                Fastest way to verify
              </Text>
            </View>
          </View>

          <Input
            value={collegeEmail}
            onChangeText={setCollegeEmail}
            placeholder="your.name@college.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            style={{ marginTop: 12 }}
          />

          <Button
            title="Send Verification Email"
            onPress={handleEmailVerification}
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting || !collegeEmail.trim()}
            style={{ marginTop: 12 }}
            icon={<MaterialCommunityIcons name="send" size={20} color={theme.textInverse} />}
          />
        </Card>

        {/* Document Upload */}
        <Card style={[styles.methodCard, { backgroundColor: theme.surface }]}>
          <View style={styles.methodHeader}>
            <View style={[styles.methodIcon, { backgroundColor: theme.successLight }]}>
              <MaterialCommunityIcons name="file-document" size={24} color={theme.success} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[typography.h4, { color: theme.text }]}>
                Upload Student ID
              </Text>
              <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
                Takes 24-48 hours to verify
              </Text>
            </View>
          </View>

          <Button
            title="Upload Document"
            onPress={handleDocumentUpload}
            variant="secondary"
            style={{ marginTop: 12 }}
            icon={<MaterialCommunityIcons name="upload" size={20} color={theme.primary} />}
          />
        </Card>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: theme.text, flex: 1 }]}>
          Student Verification
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <FadeIn delay={50}>
          {renderStatusCard()}
        </FadeIn>

        {/* Benefits */}
        <FadeIn delay={100}>
          {renderBenefits()}
        </FadeIn>

        {/* Verification Methods */}
        <FadeIn delay={150}>
          {renderVerificationMethods()}
        </FadeIn>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: semanticSpacing.screenPaddingX,
  },
  statusCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginMd,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitsCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginMd,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: semanticSpacing.marginMd,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: semanticSpacing.paddingMd,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginMd,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
