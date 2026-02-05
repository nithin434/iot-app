/**
 * Cart Screen - IoT Marketplace
 * Manage cart items, apply coupons, proceed to checkout
 * Production-ready with real API integration
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { Card, Button } from '../../components/common';
import { useCartStore, useAuthStore } from '../../stores';
import { hapticFeedback } from '../../utils/haptics';
import { cartService } from '../../services/api/cart';
import { moderateScale, getResponsivePadding, getResponsiveMargin } from '../../utils/responsive';

const PADDING = getResponsivePadding();
const MARGIN = getResponsiveMargin();

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Cart'>;

interface CouponInfo {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  applicable: boolean;
  message: string;
}

export const CartScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { cart, removeItem, updateQuantity, clearCart } = useCartStore();

  const items = cart?.items || [];

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponInfo | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate totals
  const getTotal = () => items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
  const subtotal = getTotal();
  const discount = appliedCoupon ? 
    appliedCoupon.discountType === 'percentage' 
      ? (subtotal * appliedCoupon.discountValue) / 100
      : appliedCoupon.discountValue
    : 0;
  const tax = (subtotal - discount) * 0.18; // 18% GST
  const total = subtotal - discount + tax;

  useFocusEffect(
    useCallback(() => {
      // Any cart refresh logic if needed
    }, [])
  );

  const handleRemoveItem = (productId: string) => {
    hapticFeedback.light();
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeItem(productId),
        },
      ]
    );
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    hapticFeedback.light();
    updateQuantity(productId, newQuantity);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response: any = await cartService.applyCoupon(couponCode, subtotal);
      
      if (response.valid) {
        const couponData = response.coupon;
        const discountAmount = couponData.discount_type === 'percentage'
          ? (subtotal * couponData.discount_value) / 100
          : couponData.discount_value;

        setAppliedCoupon({
          code: couponCode,
          discountType: couponData.discount_type,
          discountValue: couponData.discount_value,
          minOrderValue: couponData.min_order_value,
          applicable: true,
          message: response.message,
        });

        hapticFeedback.success();
        Alert.alert('Success', response.message);
      } else {
        hapticFeedback.error();
        Alert.alert('Invalid Coupon', response.message);
      }
    } catch (error: any) {
      hapticFeedback.error();
      Alert.alert('Error', error.message || 'Failed to validate coupon');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    hapticFeedback.light();
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before checkout');
      return;
    }

    if (!user) {
      Alert.alert('Login Required', 'Please login to proceed with checkout');
      return;
    }

    hapticFeedback.medium();
    navigation.navigate('Checkout');
  };

  const renderCartItem = ({ item }: any) => (
    <Card style={styles.cartItem}>
      <Image
        source={{ uri: item.product.image_url || 'https://via.placeholder.com/80' }}
        style={styles.productImage}
      />
      <View style={styles.productDetails}>
        <Text style={[styles.productName, { color: theme.text }]} numberOfLines={2}>
          {item.product.name}
        </Text>
        <Text style={[styles.productPrice, { color: theme.primary }]}>
          ₹{item.product.price.toFixed(2)}
        </Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: theme.surface }]}
            onPress={() => handleQuantityChange(item.product.id, item.quantity - 1)}
          >
            <MaterialCommunityIcons name="minus" size={20} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.quantityText, { color: theme.text }]}>
            {item.quantity}
          </Text>
          
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: theme.surface }]}
            onPress={() => handleQuantityChange(item.product.id, item.quantity + 1)}
          >
            <MaterialCommunityIcons name="plus" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.product.id)}
      >
        <MaterialCommunityIcons name="delete-outline" size={24} color={theme.error} />
      </TouchableOpacity>
    </Card>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="cart-outline"
        size={moderateScale(100)}
        color={theme.textSecondary}
      />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        Your cart is empty
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        Add products to get started
      </Text>
      <Button
        title="Browse Products"
        onPress={() => navigation.goBack()}
        style={styles.browseButton}
      />
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {renderEmptyCart()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Shopping Cart
        </Text>
        <Text style={[styles.itemCount, { color: theme.textSecondary }]}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Coupon Section */}
      <Card style={styles.couponSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Apply Coupon
        </Text>
        
        {appliedCoupon ? (
          <View style={[styles.appliedCoupon, { backgroundColor: theme.success + '20' }]}>
            <MaterialCommunityIcons name="check-circle" size={24} color={theme.success} />
            <View style={styles.couponInfo}>
              <Text style={[styles.couponCode, { color: theme.success }]}>
                {appliedCoupon.code}
              </Text>
              <Text style={[styles.couponMessage, { color: theme.textSecondary }]}>
                {appliedCoupon.message}
              </Text>
            </View>
            <TouchableOpacity onPress={handleRemoveCoupon}>
              <MaterialCommunityIcons name="close" size={24} color={theme.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.couponInput}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              }]}
              placeholder="Enter coupon code"
              placeholderTextColor={theme.textSecondary}
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <Button
              title="Apply"
              onPress={handleApplyCoupon}
              loading={isValidatingCoupon}
              disabled={!couponCode.trim() || isValidatingCoupon}
              style={styles.applyButton}
            />
          </View>
        )}
      </Card>

      {/* Order Summary */}
      <Card style={styles.summarySection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Order Summary
        </Text>
        
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Subtotal
          </Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            ₹{subtotal.toFixed(2)}
          </Text>
        </View>

        {discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.success }]}>
              Discount
            </Text>
            <Text style={[styles.summaryValue, { color: theme.success }]}>
              -₹{discount.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>
            Tax (18% GST)
          </Text>
          <Text style={[styles.summaryValue, { color: theme.text }]}>
            ₹{tax.toFixed(2)}
          </Text>
        </View>

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, { color: theme.text }]}>
            Total
          </Text>
          <Text style={[styles.totalValue, { color: theme.primary }]}>
            ₹{total.toFixed(2)}
          </Text>
        </View>
      </Card>

      {/* Checkout Button */}
      <View style={styles.checkoutContainer}>
        <Button
          title="Proceed to Checkout"
          onPress={handleCheckout}
          loading={isProcessing}
          disabled={isProcessing}
          style={styles.checkoutButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: PADDING,
    paddingVertical: MARGIN,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    ...typography.h1,
    fontSize: moderateScale(24),
  },
  itemCount: {
    ...typography.body2,
    marginTop: 4,
  },
  listContent: {
    padding: PADDING,
  },
  cartItem: {
    flexDirection: 'row',
    marginBottom: MARGIN,
    padding: PADDING,
  },
  productImage: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: 8,
    marginRight: MARGIN,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    ...typography.body1,
    fontWeight: '600',
    marginBottom: 4,
  },
  productPrice: {
    ...typography.h3,
    fontSize: moderateScale(16),
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    ...typography.body1,
    fontWeight: '600',
    marginHorizontal: MARGIN,
    minWidth: moderateScale(30),
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: PADDING * 2,
  },
  emptyTitle: {
    ...typography.h2,
    marginTop: MARGIN * 2,
    marginBottom: MARGIN,
  },
  emptySubtitle: {
    ...typography.body1,
    textAlign: 'center',
    marginBottom: MARGIN * 2,
  },
  browseButton: {
    minWidth: moderateScale(200),
  },
  couponSection: {
    margin: PADDING,
    padding: PADDING,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: moderateScale(16),
    marginBottom: MARGIN,
  },
  couponInput: {
    flexDirection: 'row',
    gap: MARGIN,
  },
  input: {
    flex: 1,
    height: moderateScale(48),
    borderRadius: 8,
    paddingHorizontal: PADDING,
    borderWidth: 1,
    ...typography.body1,
  },
  applyButton: {
    minWidth: moderateScale(80),
  },
  appliedCoupon: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: PADDING,
    borderRadius: 8,
    gap: MARGIN,
  },
  couponInfo: {
    flex: 1,
  },
  couponCode: {
    ...typography.body1,
    fontWeight: '600',
  },
  couponMessage: {
    ...typography.caption,
  },
  summarySection: {
    margin: PADDING,
    marginTop: 0,
    padding: PADDING,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: MARGIN / 2,
  },
  summaryLabel: {
    ...typography.body1,
  },
  summaryValue: {
    ...typography.body1,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: MARGIN,
    paddingTop: MARGIN,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  totalLabel: {
    ...typography.h3,
    fontSize: moderateScale(18),
  },
  totalValue: {
    ...typography.h2,
    fontSize: moderateScale(20),
  },
  checkoutContainer: {
    padding: PADDING,
    paddingBottom: PADDING * 1.5,
  },
  checkoutButton: {
    width: '100%',
  },
});
