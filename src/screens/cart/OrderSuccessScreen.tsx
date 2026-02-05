/**
 * Order Success Screen
 * Celebration screen after successful order placement
 * Best practice: Clear confirmation, next actions, delightful experience
 * Industry-grade UX: Success animation, confetti, order details, quick actions
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Button, Card } from '../../components/common';
import { FadeIn } from '../../components/animations';
import { hapticFeedback } from '../../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderSuccess'>;
type RoutePropType = RouteProp<RootStackParamList, 'OrderSuccess'>;

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const translateY = useSharedValue(-100);
  const translateX = useSharedValue(Math.random() * SCREEN_WIDTH);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(SCREEN_HEIGHT + 100, {
      duration: 3000 + Math.random() * 2000,
    });
    rotate.value = withRepeat(
      withSequence(
        withSpring(360, { duration: 1000 }),
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.confettiParticle,
        { backgroundColor: color },
        animatedStyle,
      ]}
    />
  );
};

export const OrderSuccessScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  
  const orderId = route.params?.orderId || 'ORD123456';

  useEffect(() => {
    // Trigger success haptic
    hapticFeedback.success();
  }, []);

  const handleViewOrder = () => {
    hapticFeedback.light();
    // Navigate to order detail
    navigation.navigate('Main', {
      screen: 'ProfileTab',
      params: {
        screen: 'OrderDetail',
        params: { orderId },
      },
    } as any);
  };

  const handleContinueShopping = () => {
    hapticFeedback.light();
    navigation.navigate('Main', {
      screen: 'HomeTab',
      params: { screen: 'Home' },
    } as any);
  };

  const confettiColors = [
    theme.primary,
    theme.success,
    theme.warning,
    '#FF6B9D',
    '#C44569',
    '#4ECDC4',
    '#95E1D3',
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Confetti Animation */}
      <View style={styles.confettiContainer} pointerEvents="none">
        {Array.from({ length: 30 }).map((_, index) => (
          <ConfettiParticle
            key={index}
            delay={index * 100}
            color={confettiColors[index % confettiColors.length]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <Animated.View entering={ZoomIn.delay(200).springify()} style={styles.iconContainer}>
          <LinearGradient
            colors={[theme.success, theme.successLight]}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="check-circle" size={80} color={theme.textInverse} />
          </LinearGradient>
        </Animated.View>

        {/* Success Message */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.messageContainer}>
          <Text style={[typography.h1, { color: theme.text, textAlign: 'center' }]}>
            Order Placed Successfully!
          </Text>
          <Text style={[typography.body, { color: theme.textSecondary, textAlign: 'center', marginTop: 12 }]}>
            Thank you for your order. We'll send you a confirmation email shortly.
          </Text>
        </Animated.View>

        {/* Order Details Card */}
        <Animated.View entering={FadeInDown.delay(600)} style={{ width: '100%' }}>
          <Card style={[styles.orderCard, { backgroundColor: theme.surface }]}>
            <LinearGradient
              colors={[theme.primary + '10', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            />

            <View style={styles.orderHeader}>
              <MaterialCommunityIcons name="package-variant" size={32} color={theme.primary} />
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[typography.caption, { color: theme.textSecondary }]}>
                  Order Number
                </Text>
                <Text style={[typography.h3, { color: theme.text, marginTop: 4 }]}>
                  {orderId}
                </Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Delivery Info */}
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: theme.primaryLight }]}>
                <MaterialCommunityIcons name="truck-delivery" size={20} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { color: theme.textSecondary }]}>
                  Estimated Delivery
                </Text>
                <Text style={[typography.h4, { color: theme.text, marginTop: 4 }]}>
                  3-5 Business Days
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: theme.successLight }]}>
                <MaterialCommunityIcons name="email" size={20} color={theme.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { color: theme.textSecondary }]}>
                  Confirmation Sent To
                </Text>
                <Text style={[typography.h4, { color: theme.text, marginTop: 4 }]}>
                  your@email.com
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: theme.warningLight }]}>
                <MaterialCommunityIcons name="bell" size={20} color={theme.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { color: theme.textSecondary }]}>
                  Order Updates
                </Text>
                <Text style={[typography.h4, { color: theme.text, marginTop: 4 }]}>
                  We'll notify you at every step
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* What's Next Section */}
        <Animated.View entering={FadeInDown.delay(800)} style={{ width: '100%' }}>
          <Text style={[typography.h3, { color: theme.text, marginBottom: 16 }]}>
            What's Next?
          </Text>

          <Card style={[styles.nextCard, { backgroundColor: theme.surface }]}>
            <View style={styles.nextItem}>
              <View style={[styles.stepNumber, { backgroundColor: theme.primaryLight }]}>
                <Text style={[typography.h4, { color: theme.primary }]}>1</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[typography.h4, { color: theme.text }]}>
                  Order Confirmation
                </Text>
                <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
                  Check your email for order details
                </Text>
              </View>
            </View>

            <View style={styles.nextItem}>
              <View style={[styles.stepNumber, { backgroundColor: theme.primaryLight }]}>
                <Text style={[typography.h4, { color: theme.primary }]}>2</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[typography.h4, { color: theme.text }]}>
                  Processing
                </Text>
                <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
                  We'll prepare your items for shipping
                </Text>
              </View>
            </View>

            <View style={styles.nextItem}>
              <View style={[styles.stepNumber, { backgroundColor: theme.primaryLight }]}>
                <Text style={[typography.h4, { color: theme.primary }]}>3</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[typography.h4, { color: theme.text }]}>
                  Delivery
                </Text>
                <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
                  Track your order in real-time
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.delay(1000)} style={styles.actionsContainer}>
          <Button
            title="View Order Details"
            onPress={handleViewOrder}
            variant="primary"
            icon={<MaterialCommunityIcons name="receipt" size={20} color={theme.textInverse} />}
          />

          <Button
            title="Continue Shopping"
            onPress={handleContinueShopping}
            variant="secondary"
            style={{ marginTop: 12 }}
            icon={<MaterialCommunityIcons name="shopping" size={20} color={theme.primary} />}
          />
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  confettiParticle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    flex: 1,
    zIndex: 2,
  },
  contentContainer: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingTop: semanticSpacing.paddingXl * 2,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: semanticSpacing.marginXl,
  },
  iconGradient: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    marginBottom: semanticSpacing.marginXl,
    paddingHorizontal: semanticSpacing.paddingLg,
  },
  orderCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginLg,
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: semanticSpacing.marginMd,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: semanticSpacing.marginMd,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  nextCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginLg,
  },
  nextItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: semanticSpacing.marginMd,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsContainer: {
    width: '100%',
  },
});
