/**
 * Checkout Screen
 * Complete order placement with address and payment selection
 * Best practice: Clear progress indication, easy address management
 * Industry-grade UX: Step-by-step flow, expandable summary, smooth animations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeOutUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Button, Card } from '../../components/common';
import { FadeIn, SlideUp } from '../../components/animations';
import { useCartStore, useAuthStore, useOrderStore } from '../../stores';
import { hapticFeedback } from '../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checkout'>;

// Mock data
const MOCK_ADDRESS = {
  id: '1',
  name: 'Rahul Sharma',
  phone: '+91 98765 43210',
  addressLine1: '123, Tech Park, Sector 5',
  addressLine2: 'Near Metro Station',
  city: 'Bangalore',
  state: 'Karnataka',
  pincode: '560001',
  isDefault: true,
};

const PAYMENT_METHODS = [
  {
    id: 'upi',
    name: 'UPI',
    icon: 'qrcode-scan',
    description: 'Pay using any UPI app',
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: 'credit-card',
    description: 'Visa, Mastercard, Rupay',
  },
  {
    id: 'netbanking',
    name: 'Net Banking',
    icon: 'bank',
    description: 'All major banks supported',
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: 'cash',
    description: 'Pay when you receive',
  },
];

const CHECKOUT_STEPS = [
  { id: 1, label: 'Address', icon: 'map-marker' },
  { id: 2, label: 'Payment', icon: 'credit-card' },
  { id: 3, label: 'Review', icon: 'check-circle' },
];

export const CheckoutScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const { user } = useAuthStore();
  const { getTotalPrice, getItemsCount, items: cartItems } = useCartStore();
  const { createOrder, isLoading: isPlacingOrder } = useOrderStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState(MOCK_ADDRESS);
  const [selectedPayment, setSelectedPayment] = useState<string>('upi');
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const summaryHeight = useSharedValue(0);

  const handleBack = () => {
    hapticFeedback.light();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleChangeAddress = () => {
    hapticFeedback.light();
    navigation.navigate('AddressSelection' as any);
  };

  const handleAddNewAddress = () => {
    hapticFeedback.light();
    navigation.navigate('AddEditAddress' as any, { addressId: undefined } as any);
  };

  const handlePaymentSelect = (paymentId: string) => {
    hapticFeedback.light();
    setSelectedPayment(paymentId);
  };

  const toggleSummary = () => {
    hapticFeedback.light();
    setIsSummaryExpanded(!isSummaryExpanded);
    summaryHeight.value = withSpring(isSummaryExpanded ? 0 : 1);
  };

  const handlePlaceOrder = async () => {
    hapticFeedback.medium();
    setIsProcessing(true);

    try {
      // Simulate order placement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order
      const order = await createOrder({
        addressId: selectedAddress.id,
        paymentMethod: selectedPayment,
      });

      hapticFeedback.success();
      
      // Navigate to success screen
      navigation.replace('OrderSuccess', { orderId: 'ORD' + Date.now() });
    } catch (error) {
      hapticFeedback.error();
      console.error('Order placement failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    hapticFeedback.medium();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handlePlaceOrder();
    }
  };

  // Mock cart data
  const subtotal = 1897;
  const discount = 200;
  const deliveryCharge = 0;
  const total = subtotal - discount + deliveryCharge;
  const itemCount = 3;

  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      {CHECKOUT_STEPS.map((step, index) => (
        <View key={step.id} style={styles.stepWrapper}>
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor:
                    currentStep >= step.id ? theme.primary : theme.backgroundSecondary,
                  borderColor: currentStep >= step.id ? theme.primary : theme.border,
                },
              ]}
            >
              {currentStep > step.id ? (
                <MaterialCommunityIcons name="check" size={16} color={theme.textInverse} />
              ) : (
                <MaterialCommunityIcons
                  name={step.icon as any}
                  size={16}
                  color={currentStep >= step.id ? theme.textInverse : theme.textSecondary}
                />
              )}
            </View>
            <Text
              style={[
                typography.caption,
                {
                  color: currentStep >= step.id ? theme.text : theme.textSecondary,
                  marginTop: 4,
                },
              ]}
            >
              {step.label}
            </Text>
          </View>
          {index < CHECKOUT_STEPS.length - 1 && (
            <View
              style={[
                styles.stepLine,
                {
                  backgroundColor:
                    currentStep > step.id ? theme.primary : theme.border,
                },
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderAddressSection = () => (
    <SlideUp delay={100}>
      <Card style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="map-marker" size={24} color={theme.primary} />
          <Text style={[typography.h3, { color: theme.text, marginLeft: 12 }]}>
            Delivery Address
          </Text>
        </View>

        {selectedAddress ? (
          <View style={[styles.addressCard, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.addressHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.h4, { color: theme.text }]}>
                  {selectedAddress.name}
                </Text>
                <Text style={[typography.body, { color: theme.textSecondary, marginTop: 4 }]}>
                  {selectedAddress.phone}
                </Text>
              </View>
              {selectedAddress.isDefault && (
                <View style={[styles.defaultBadge, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[typography.caption, { color: theme.primary }]}>
                    Default
                  </Text>
                </View>
              )}
            </View>

            <Text style={[typography.body, { color: theme.text, marginTop: 12 }]}>
              {selectedAddress.addressLine1}
            </Text>
            {selectedAddress.addressLine2 && (
              <Text style={[typography.body, { color: theme.text }]}>
                {selectedAddress.addressLine2}
              </Text>
            )}
            <Text style={[typography.body, { color: theme.text }]}>
              {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
            </Text>
          </View>
        ) : (
          <View style={[styles.noAddressCard, { backgroundColor: theme.warningLight }]}>
            <MaterialCommunityIcons name="alert-circle" size={24} color={theme.warning} />
            <Text style={[typography.body, { color: theme.warning, marginLeft: 12 }]}>
              No address selected
            </Text>
          </View>
        )}

        <View style={styles.addressActions}>
          <Button
            title="Change Address"
            onPress={handleChangeAddress}
            variant="secondary"
            size="small"
            style={{ flex: 1, marginRight: 8 }}
            icon={<MaterialCommunityIcons name="swap-horizontal" size={18} color={theme.primary} />}
          />
          <Button
            title="Add New"
            onPress={handleAddNewAddress}
            variant="secondary"
            size="small"
            style={{ flex: 1, marginLeft: 8 }}
            icon={<MaterialCommunityIcons name="plus" size={18} color={theme.primary} />}
          />
        </View>
      </Card>
    </SlideUp>
  );

  const renderPaymentSection = () => (
    <SlideUp delay={200}>
      <Card style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="credit-card" size={24} color={theme.primary} />
          <Text style={[typography.h3, { color: theme.text, marginLeft: 12 }]}>
            Payment Method
          </Text>
        </View>

        {PAYMENT_METHODS.map((method, index) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentOption,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: selectedPayment === method.id ? theme.primary : 'transparent',
                borderWidth: selectedPayment === method.id ? 2 : 0,
              },
            ]}
            onPress={() => handlePaymentSelect(method.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.radioOuter, { borderColor: theme.border }]}>
              {selectedPayment === method.id && (
                <View style={[styles.radioInner, { backgroundColor: theme.primary }]} />
              )}
            </View>

            <View style={[styles.paymentIcon, { backgroundColor: theme.primaryLight }]}>
              <MaterialCommunityIcons name={method.icon as any} size={24} color={theme.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[typography.h4, { color: theme.text }]}>
                {method.name}
              </Text>
              <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 2 }]}>
                {method.description}
              </Text>
            </View>

            {selectedPayment === method.id && (
              <MaterialCommunityIcons name="check-circle" size={24} color={theme.primary} />
            )}
          </TouchableOpacity>
        ))}
      </Card>
    </SlideUp>
  );

  const renderOrderSummary = () => (
    <SlideUp delay={300}>
      <Card style={[styles.sectionCard, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={styles.summaryHeader}
          onPress={toggleSummary}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <MaterialCommunityIcons name="receipt" size={24} color={theme.primary} />
            <Text style={[typography.h3, { color: theme.text, marginLeft: 12 }]}>
              Order Summary
            </Text>
          </View>
          <MaterialCommunityIcons
            name={isSummaryExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.summaryQuick}>
          <Text style={[typography.body, { color: theme.textSecondary }]}>
            {itemCount} items
          </Text>
          <Text style={[typography.h3, { color: theme.primary }]}>
            ₹{total}
          </Text>
        </View>

        {isSummaryExpanded && (
          <Animated.View entering={FadeInDown} exiting={FadeOutUp}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.priceRow}>
              <Text style={[typography.body, { color: theme.textSecondary }]}>
                Subtotal ({itemCount} items)
              </Text>
              <Text style={[typography.body, { color: theme.text }]}>
                ₹{subtotal}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={[typography.body, { color: theme.success }]}>
                Discount
              </Text>
              <Text style={[typography.body, { color: theme.success }]}>
                -₹{discount}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={[typography.body, { color: theme.textSecondary }]}>
                Delivery Charges
              </Text>
              <Text style={[typography.body, { color: theme.success }]}>
                FREE
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.totalRow}>
              <Text style={[typography.h3, { color: theme.text }]}>
                Total Amount
              </Text>
              <Text style={[typography.h2, { color: theme.primary }]}>
                ₹{total}
              </Text>
            </View>
          </Animated.View>
        )}
      </Card>
    </SlideUp>
  );

  const canProceed = () => {
    if (currentStep === 1) return !!selectedAddress;
    if (currentStep === 2) return !!selectedPayment;
    return true;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: theme.text, flex: 1, textAlign: 'center' }]}>
          Checkout
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Indicator */}
      <FadeIn delay={50}>
        {renderProgressIndicator()}
      </FadeIn>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Address Section */}
        {renderAddressSection()}

        {/* Payment Section */}
        {currentStep >= 2 && renderPaymentSection()}

        {/* Order Summary */}
        {currentStep >= 3 && renderOrderSummary()}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <LinearGradient
          colors={[theme.surface, theme.surface + 'F0']}
          style={styles.bottomGradient}
        />
        <View style={styles.bottomContent}>
          <View>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              Total Amount
            </Text>
            <Text style={[typography.h2, { color: theme.primary }]}>
              ₹{total}
            </Text>
          </View>
          
          <Button
            title={currentStep === 3 ? 'Place Order' : 'Continue'}
            onPress={handleContinue}
            variant="primary"
            style={styles.continueButton}
            loading={isProcessing}
            disabled={!canProceed() || isProcessing}
            icon={
              <MaterialCommunityIcons
                name={currentStep === 3 ? 'check' : 'arrow-right'}
                size={20}
                color={theme.textInverse}
              />
            }
          />
        </View>
      </View>
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
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingVertical: semanticSpacing.paddingLg,
  },
  stepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
  },
  sectionCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginMd,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: semanticSpacing.marginMd,
  },
  addressCard: {
    padding: semanticSpacing.paddingMd,
    borderRadius: semanticSpacing.radiusMd,
    marginBottom: semanticSpacing.marginMd,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: semanticSpacing.radiusSm,
  },
  noAddressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: semanticSpacing.paddingMd,
    borderRadius: semanticSpacing.radiusMd,
    marginBottom: semanticSpacing.marginMd,
  },
  addressActions: {
    flexDirection: 'row',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: semanticSpacing.paddingMd,
    borderRadius: semanticSpacing.radiusMd,
    marginBottom: semanticSpacing.marginSm,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: semanticSpacing.marginSm,
  },
  summaryQuick: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: semanticSpacing.paddingMd,
  },
  continueButton: {
    flex: 1,
    marginLeft: semanticSpacing.marginMd,
  },
});
