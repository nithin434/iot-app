/**
 * Order Detail Screen
 * Detailed view of order with tracking timeline
 * Best practice: Clear status tracking, all order info, quick actions
 * Industry-grade UX: Vertical timeline, beautiful cards, download invoice, track order
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInLeft } from 'react-native-reanimated';
import { ProfileStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Button, Card } from '../../components/common';
import { FadeIn } from '../../components/animations';
import { hapticFeedback } from '../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'OrderDetail'>;
type RoutePropType = RouteProp<ProfileStackParamList, 'OrderDetail'>;

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  icon: string;
}

interface OrderItem {
  id: string;
  name: string;
  image: string;
  quantity: number;
  price: number;
}

// Mock order data
const MOCK_ORDER = {
  id: '1',
  orderNumber: 'ORD2024001',
  date: '2024-01-28',
  status: 'shipped',
  itemCount: 3,
  totalAmount: 1897,
  subtotal: 1897,
  discount: 200,
  deliveryCharge: 0,
  items: [
    {
      id: '1',
      name: 'Arduino Uno R3',
      image: 'https://via.placeholder.com/80',
      quantity: 2,
      price: 499,
    },
    {
      id: '2',
      name: 'ESP32 DevKit',
      image: 'https://via.placeholder.com/80',
      quantity: 1,
      price: 699,
    },
    {
      id: '3',
      name: 'DHT22 Temperature Sensor',
      image: 'https://via.placeholder.com/80',
      quantity: 3,
      price: 249,
    },
  ],
  deliveryAddress: {
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    addressLine1: '123, Tech Park, Sector 5',
    addressLine2: 'Near Metro Station',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
  },
  paymentMethod: 'UPI',
  timeline: [
    {
      id: '1',
      title: 'Order Placed',
      description: 'Your order has been confirmed',
      timestamp: 'Jan 28, 10:30 AM',
      completed: true,
      icon: 'check-circle',
    },
    {
      id: '2',
      title: 'Order Confirmed',
      description: 'Payment received successfully',
      timestamp: 'Jan 28, 10:31 AM',
      completed: true,
      icon: 'credit-card-check',
    },
    {
      id: '3',
      title: 'Processing',
      description: 'Items are being prepared',
      timestamp: 'Jan 28, 2:15 PM',
      completed: true,
      icon: 'package-variant',
    },
    {
      id: '4',
      title: 'Shipped',
      description: 'Package handed to courier',
      timestamp: 'Jan 29, 9:00 AM',
      completed: true,
      icon: 'truck-delivery',
    },
    {
      id: '5',
      title: 'Out for Delivery',
      description: 'Package is on the way',
      timestamp: 'Expected: Jan 31',
      completed: false,
      icon: 'truck-fast',
    },
    {
      id: '6',
      title: 'Delivered',
      description: 'Package delivered successfully',
      timestamp: 'Pending',
      completed: false,
      icon: 'home-circle',
    },
  ],
};

export const OrderDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  
  const orderId = route.params?.orderId;
  const [order] = useState(MOCK_ORDER);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const handleTrackOrder = () => {
    hapticFeedback.light();
    // Navigate to tracking screen or open tracking URL
  };

  const handleDownloadInvoice = () => {
    hapticFeedback.medium();
    // Download invoice logic
  };

  const handleCancelOrder = () => {
    hapticFeedback.medium();
    setIsCancelling(true);
    // Show confirmation dialog
    setTimeout(() => {
      setIsCancelling(false);
    }, 2000);
  };

  const handleReorder = () => {
    hapticFeedback.light();
    // Add items to cart and navigate
  };

  const handleContactSupport = () => {
    hapticFeedback.light();
    // Open support chat or email
  };

  const renderTimeline = () => (
    <Card style={[styles.timelineCard, { backgroundColor: theme.surface }]}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="timeline-clock" size={24} color={theme.primary} />
        <Text style={[typography.h3, { color: theme.text, marginLeft: 12 }]}>
          Order Timeline
        </Text>
      </View>

      <View style={styles.timeline}>
        {order.timeline.map((step, index) => {
          const isLast = index === order.timeline.length - 1;
          const isCompleted = step.completed;

          return (
            <Animated.View
              key={step.id}
              entering={FadeInLeft.delay(index * 100)}
              style={styles.timelineItem}
            >
              {/* Timeline Line */}
              {!isLast && (
                <View
                  style={[
                    styles.timelineLine,
                    {
                      backgroundColor: isCompleted ? theme.primary : theme.border,
                    },
                  ]}
                />
              )}

              {/* Timeline Icon */}
              <View
                style={[
                  styles.timelineIcon,
                  {
                    backgroundColor: isCompleted ? theme.primary : theme.backgroundSecondary,
                    borderColor: isCompleted ? theme.primary : theme.border,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={step.icon as any}
                  size={20}
                  color={isCompleted ? theme.textInverse : theme.textSecondary}
                />
              </View>

              {/* Timeline Content */}
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    typography.h4,
                    {
                      color: isCompleted ? theme.text : theme.textSecondary,
                    },
                  ]}
                >
                  {step.title}
                </Text>
                <Text
                  style={[
                    typography.body,
                    {
                      color: theme.textSecondary,
                      marginTop: 4,
                    },
                  ]}
                >
                  {step.description}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    {
                      color: isCompleted ? theme.primary : theme.textSecondary,
                      marginTop: 4,
                    },
                  ]}
                >
                  {step.timestamp}
                </Text>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </Card>
  );

  const renderOrderItems = () => (
    <Card style={[styles.itemsCard, { backgroundColor: theme.surface }]}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="package-variant" size={24} color={theme.primary} />
        <Text style={[typography.h3, { color: theme.text, marginLeft: 12 }]}>
          Order Items ({order.itemCount})
        </Text>
      </View>

      {order.items.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeInDown.delay(index * 100)}
          style={[
            styles.orderItem,
            {
              borderBottomWidth: index < order.items.length - 1 ? 1 : 0,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <View style={[styles.itemImage, { backgroundColor: theme.backgroundSecondary }]}>
            <MaterialCommunityIcons name="cube-outline" size={32} color={theme.textSecondary} />
          </View>

          <View style={styles.itemDetails}>
            <Text style={[typography.h4, { color: theme.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[typography.body, { color: theme.textSecondary, marginTop: 4 }]}>
              Qty: {item.quantity}
            </Text>
          </View>

          <View style={styles.itemPrice}>
            <Text style={[typography.h4, { color: theme.primary }]}>
              ₹{item.price * item.quantity}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
              ₹{item.price} each
            </Text>
          </View>
        </Animated.View>
      ))}
    </Card>
  );

  const renderDeliveryAddress = () => (
    <Card style={[styles.addressCard, { backgroundColor: theme.surface }]}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="map-marker" size={24} color={theme.primary} />
        <Text style={[typography.h3, { color: theme.text, marginLeft: 12 }]}>
          Delivery Address
        </Text>
      </View>

      <View style={[styles.addressContent, { backgroundColor: theme.backgroundSecondary }]}>
        <Text style={[typography.h4, { color: theme.text }]}>
          {order.deliveryAddress.name}
        </Text>
        <Text style={[typography.body, { color: theme.textSecondary, marginTop: 4 }]}>
          {order.deliveryAddress.phone}
        </Text>
        <Text style={[typography.body, { color: theme.text, marginTop: 8 }]}>
          {order.deliveryAddress.addressLine1}
        </Text>
        {order.deliveryAddress.addressLine2 && (
          <Text style={[typography.body, { color: theme.text }]}>
            {order.deliveryAddress.addressLine2}
          </Text>
        )}
        <Text style={[typography.body, { color: theme.text }]}>
          {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
        </Text>
      </View>
    </Card>
  );

  const renderPaymentInfo = () => (
    <Card style={[styles.paymentCard, { backgroundColor: theme.surface }]}>
      <View style={styles.cardHeader}>
        <MaterialCommunityIcons name="credit-card" size={24} color={theme.primary} />
        <Text style={[typography.h3, { color: theme.text, marginLeft: 12 }]}>
          Payment Details
        </Text>
      </View>

      <View style={styles.paymentRow}>
        <Text style={[typography.body, { color: theme.textSecondary }]}>
          Payment Method
        </Text>
        <View style={styles.paymentMethod}>
          <MaterialCommunityIcons name="qrcode-scan" size={20} color={theme.primary} />
          <Text style={[typography.h4, { color: theme.text, marginLeft: 8 }]}>
            {order.paymentMethod}
          </Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <View style={styles.priceRow}>
        <Text style={[typography.body, { color: theme.textSecondary }]}>
          Subtotal
        </Text>
        <Text style={[typography.body, { color: theme.text }]}>
          ₹{order.subtotal}
        </Text>
      </View>

      <View style={styles.priceRow}>
        <Text style={[typography.body, { color: theme.success }]}>
          Discount
        </Text>
        <Text style={[typography.body, { color: theme.success }]}>
          -₹{order.discount}
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
          ₹{order.totalAmount}
        </Text>
      </View>
    </Card>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      {order.status === 'shipped' && (
        <>
          <Button
            title="Track Order"
            onPress={handleTrackOrder}
            variant="primary"
            icon={<MaterialCommunityIcons name="map-marker-path" size={20} color={theme.textInverse} />}
          />
          <Button
            title="Download Invoice"
            onPress={handleDownloadInvoice}
            variant="secondary"
            style={{ marginTop: 12 }}
            icon={<MaterialCommunityIcons name="download" size={20} color={theme.primary} />}
          />
        </>
      )}

      {order.status === 'pending' && (
        <>
          <Button
            title="Cancel Order"
            onPress={handleCancelOrder}
            variant="secondary"
            loading={isCancelling}
            icon={<MaterialCommunityIcons name="close-circle" size={20} color={theme.error} />}
          />
          <Button
            title="Download Invoice"
            onPress={handleDownloadInvoice}
            variant="secondary"
            style={{ marginTop: 12 }}
            icon={<MaterialCommunityIcons name="download" size={20} color={theme.primary} />}
          />
        </>
      )}

      {order.status === 'delivered' && (
        <>
          <Button
            title="Reorder Items"
            onPress={handleReorder}
            variant="primary"
            icon={<MaterialCommunityIcons name="refresh" size={20} color={theme.textInverse} />}
          />
          <Button
            title="Download Invoice"
            onPress={handleDownloadInvoice}
            variant="secondary"
            style={{ marginTop: 12 }}
            icon={<MaterialCommunityIcons name="download" size={20} color={theme.primary} />}
          />
        </>
      )}

      <TouchableOpacity
        style={styles.supportButton}
        onPress={handleContactSupport}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="headset" size={20} color={theme.primary} />
        <Text style={[typography.label, { color: theme.primary, marginLeft: 8 }]}>
          Need Help? Contact Support
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: theme.text }]}>
            Order Details
          </Text>
          <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 2 }]}>
            {order.orderNumber}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.shareButton}
          onPress={() => hapticFeedback.light()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="share-variant" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Timeline */}
        <FadeIn delay={50}>
          {renderTimeline()}
        </FadeIn>

        {/* Order Items */}
        <FadeIn delay={100}>
          {renderOrderItems()}
        </FadeIn>

        {/* Delivery Address */}
        <FadeIn delay={150}>
          {renderDeliveryAddress()}
        </FadeIn>

        {/* Payment Info */}
        <FadeIn delay={200}>
          {renderPaymentInfo()}
        </FadeIn>

        {/* Actions */}
        <FadeIn delay={250}>
          {renderActions()}
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
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingTop: semanticSpacing.paddingMd,
  },
  timelineCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginMd,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: semanticSpacing.marginMd,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingBottom: semanticSpacing.paddingLg,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    bottom: 0,
    width: 2,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
  },
  itemsCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginMd,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: semanticSpacing.paddingMd,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: semanticSpacing.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemPrice: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  addressCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginMd,
  },
  addressContent: {
    padding: semanticSpacing.paddingMd,
    borderRadius: semanticSpacing.radiusMd,
  },
  paymentCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginMd,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: semanticSpacing.marginMd,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: semanticSpacing.marginMd,
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
  actionsContainer: {
    marginBottom: semanticSpacing.marginMd,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: semanticSpacing.paddingMd,
    marginTop: 12,
  },
});
