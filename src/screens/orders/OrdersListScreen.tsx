/**
 * Orders List Screen
 * View order history with filters and status tracking
 * Best practice: Clear status indication, easy filtering, quick actions
 * Industry-grade UX: Tab filters, status badges, pull-to-refresh, beautiful cards
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { ProfileStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { EmptyState } from '../../components/common';
import { FadeIn, SkeletonLoader } from '../../components/animations';
import { hapticFeedback } from '../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'OrdersList'>;

type OrderStatus = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: Exclude<OrderStatus, 'all'>;
  itemCount: number;
  totalAmount: number;
  items: Array<{
    name: string;
    image: string;
    quantity: number;
  }>;
  estimatedDelivery?: string;
}

const ORDER_FILTERS: Array<{ id: OrderStatus; label: string; icon: string }> = [
  { id: 'all', label: 'All', icon: 'format-list-bulleted' },
  { id: 'pending', label: 'Pending', icon: 'clock-outline' },
  { id: 'processing', label: 'Processing', icon: 'package-variant' },
  { id: 'shipped', label: 'Shipped', icon: 'truck-delivery' },
  { id: 'delivered', label: 'Delivered', icon: 'check-circle' },
  { id: 'cancelled', label: 'Cancelled', icon: 'close-circle' },
];

const STATUS_CONFIG = {
  pending: {
    color: '#FF9800',
    bgColor: '#FFF3E0',
    icon: 'clock-outline',
    label: 'Pending',
  },
  processing: {
    color: '#2196F3',
    bgColor: '#E3F2FD',
    icon: 'package-variant',
    label: 'Processing',
  },
  shipped: {
    color: '#9C27B0',
    bgColor: '#F3E5F5',
    icon: 'truck-delivery',
    label: 'Shipped',
  },
  delivered: {
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    icon: 'check-circle',
    label: 'Delivered',
  },
  cancelled: {
    color: '#F44336',
    bgColor: '#FFEBEE',
    icon: 'close-circle',
    label: 'Cancelled',
  },
};

// Mock orders data
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD2024001',
    date: '2024-01-28',
    status: 'shipped',
    itemCount: 3,
    totalAmount: 1897,
    items: [
      { name: 'Arduino Uno R3', image: 'https://via.placeholder.com/60', quantity: 2 },
      { name: 'ESP32 DevKit', image: 'https://via.placeholder.com/60', quantity: 1 },
    ],
    estimatedDelivery: 'Jan 31, 2024',
  },
  {
    id: '2',
    orderNumber: 'ORD2024002',
    date: '2024-01-25',
    status: 'delivered',
    itemCount: 5,
    totalAmount: 3245,
    items: [
      { name: 'Raspberry Pi 4', image: 'https://via.placeholder.com/60', quantity: 1 },
      { name: 'DHT22 Sensor', image: 'https://via.placeholder.com/60', quantity: 3 },
    ],
  },
  {
    id: '3',
    orderNumber: 'ORD2024003',
    date: '2024-01-20',
    status: 'processing',
    itemCount: 2,
    totalAmount: 1299,
    items: [
      { name: 'HC-SR04 Ultrasonic', image: 'https://via.placeholder.com/60', quantity: 2 },
    ],
    estimatedDelivery: 'Feb 2, 2024',
  },
  {
    id: '4',
    orderNumber: 'ORD2024004',
    date: '2024-01-15',
    status: 'delivered',
    itemCount: 4,
    totalAmount: 2150,
    items: [
      { name: 'NodeMCU ESP8266', image: 'https://via.placeholder.com/60', quantity: 2 },
      { name: 'Servo Motor', image: 'https://via.placeholder.com/60', quantity: 2 },
    ],
  },
  {
    id: '5',
    orderNumber: 'ORD2024005',
    date: '2024-01-10',
    status: 'cancelled',
    itemCount: 1,
    totalAmount: 599,
    items: [
      { name: 'PIR Motion Sensor', image: 'https://via.placeholder.com/60', quantity: 1 },
    ],
  },
];

export const OrdersListScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const [selectedFilter, setSelectedFilter] = useState<OrderStatus>('all');
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilterChange = (filter: OrderStatus) => {
    hapticFeedback.light();
    setSelectedFilter(filter);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    hapticFeedback.light();
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsRefreshing(false);
  };

  const handleOrderPress = (orderId: string) => {
    hapticFeedback.light();
    navigation.navigate('OrderDetail', { orderId });
  };

  const filteredOrders = selectedFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  const getStatusCount = (status: OrderStatus): number => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const renderFilterTab = ({ item, index }: { item: typeof ORDER_FILTERS[0]; index: number }) => {
    const isSelected = selectedFilter === item.id;
    const count = getStatusCount(item.id);

    return (
      <Animated.View entering={FadeInRight.delay(index * 50)}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            {
              backgroundColor: isSelected ? theme.primary : theme.backgroundSecondary,
              borderColor: isSelected ? theme.primary : 'transparent',
            },
          ]}
          onPress={() => handleFilterChange(item.id)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={20}
            color={isSelected ? theme.textInverse : theme.textSecondary}
          />
          <Text
            style={[
              typography.label,
              {
                color: isSelected ? theme.textInverse : theme.text,
                marginLeft: 6,
              },
            ]}
          >
            {item.label}
          </Text>
          {count > 0 && (
            <View
              style={[
                styles.countBadge,
                {
                  backgroundColor: isSelected ? theme.textInverse : theme.primary,
                },
              ]}
            >
              <Text
                style={[
                  typography.caption,
                  {
                    color: isSelected ? theme.primary : theme.textInverse,
                    fontSize: 10,
                  },
                ]}
              >
                {count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderOrderCard = ({ item, index }: { item: Order; index: number }) => {
    const statusConfig = STATUS_CONFIG[item.status];

    return (
      <Animated.View entering={FadeInDown.delay(index * 100)}>
        <TouchableOpacity
          style={[styles.orderCard, { backgroundColor: theme.surface }]}
          onPress={() => handleOrderPress(item.id)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={[statusConfig.bgColor + '40', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          />

          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h4, { color: theme.text }]}>
                {item.orderNumber}
              </Text>
              <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
                {formatDate(item.date)}
              </Text>
            </View>

            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.bgColor },
              ]}
            >
              <MaterialCommunityIcons
                name={statusConfig.icon as any}
                size={16}
                color={statusConfig.color}
              />
              <Text
                style={[
                  typography.label,
                  { color: statusConfig.color, marginLeft: 6 },
                ]}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>

          {/* Items Preview */}
          <View style={styles.itemsPreview}>
            <View style={styles.itemImages}>
              {item.items.slice(0, 3).map((orderItem, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.itemImageContainer,
                    {
                      backgroundColor: theme.backgroundSecondary,
                      marginLeft: idx > 0 ? -8 : 0,
                      zIndex: 3 - idx,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="cube-outline"
                    size={20}
                    color={theme.textSecondary}
                  />
                </View>
              ))}
            </View>
            <Text style={[typography.body, { color: theme.textSecondary }]}>
              {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Footer */}
          <View style={styles.orderFooter}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                Total Amount
              </Text>
              <Text style={[typography.h3, { color: theme.primary, marginTop: 4 }]}>
                ₹{item.totalAmount}
              </Text>
            </View>

            {item.estimatedDelivery && item.status !== 'delivered' && item.status !== 'cancelled' && (
              <View style={styles.deliveryInfo}>
                <MaterialCommunityIcons
                  name="truck-fast"
                  size={16}
                  color={theme.textSecondary}
                />
                <View style={{ marginLeft: 8 }}>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>
                    Arriving by
                  </Text>
                  <Text style={[typography.label, { color: theme.text, marginTop: 2 }]}>
                    {item.estimatedDelivery}
                  </Text>
                </View>
              </View>
            )}

            {item.status === 'delivered' && (
              <View style={[styles.actionButton, { backgroundColor: theme.successLight }]}>
                <MaterialCommunityIcons name="star" size={16} color={theme.success} />
                <Text style={[typography.label, { color: theme.success, marginLeft: 6 }]}>
                  Rate Order
                </Text>
              </View>
            )}

            {item.status === 'cancelled' && (
              <View style={[styles.actionButton, { backgroundColor: theme.primaryLight }]}>
                <MaterialCommunityIcons name="refresh" size={16} color={theme.primary} />
                <Text style={[typography.label, { color: theme.primary, marginLeft: 6 }]}>
                  Reorder
                </Text>
              </View>
            )}
          </View>

          {/* View Details Arrow */}
          <View style={styles.viewDetailsArrow}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.textSecondary}
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <EmptyState
        icon={selectedFilter === 'all' ? 'package-variant-closed' : 'filter-off'}
        title={
          selectedFilter === 'all'
            ? 'No Orders Yet'
            : `No ${ORDER_FILTERS.find(f => f.id === selectedFilter)?.label} Orders`
        }
        description={
          selectedFilter === 'all'
            ? 'Start shopping to see your orders here'
            : 'Try selecting a different filter'
        }
        actionLabel={selectedFilter === 'all' ? 'Browse Products' : 'View All Orders'}
        onAction={() => {
          if (selectedFilter === 'all') {
            navigation.navigate('Home' as any);
          } else {
            setSelectedFilter('all');
          }
        }}
      />
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((_, index) => (
        <View key={index} style={[styles.orderCard, { backgroundColor: theme.surface }]}>
          <SkeletonLoader width="60%" height={20} style={{ marginBottom: 8 }} />
          <SkeletonLoader width="40%" height={14} style={{ marginBottom: 16 }} />
          <SkeletonLoader width="100%" height={60} style={{ marginBottom: 16 }} />
          <SkeletonLoader width="30%" height={24} />
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[typography.h2, { color: theme.text }]}>
          My Orders
        </Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => hapticFeedback.light()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="magnify" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <FadeIn delay={50}>
        <FlatList
          horizontal
          data={ORDER_FILTERS}
          renderItem={renderFilterTab}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
          showsHorizontalScrollIndicator={false}
          style={[styles.filterContainer, { backgroundColor: theme.background }]}
        />
      </FadeIn>

      {/* Orders List */}
      {isLoading ? (
        renderSkeleton()
      ) : filteredOrders.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        />
      )}
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
    justifyContent: 'space-between',
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingVertical: semanticSpacing.paddingMd,
    borderBottomWidth: 1,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    maxHeight: 60,
  },
  filterList: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingVertical: semanticSpacing.paddingMd,
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: semanticSpacing.radiusLg,
    borderWidth: 1,
    marginRight: 8,
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingTop: semanticSpacing.paddingMd,
    paddingBottom: semanticSpacing.paddingXl,
  },
  orderCard: {
    borderRadius: semanticSpacing.radiusLg,
    padding: semanticSpacing.paddingMd,
    marginBottom: semanticSpacing.marginMd,
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
    alignItems: 'flex-start',
    marginBottom: semanticSpacing.marginMd,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: semanticSpacing.radiusMd,
  },
  itemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: semanticSpacing.marginMd,
  },
  itemImages: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  divider: {
    height: 1,
    marginVertical: semanticSpacing.marginMd,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: semanticSpacing.radiusMd,
  },
  viewDetailsArrow: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenPaddingX,
  },
  skeletonContainer: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingTop: semanticSpacing.paddingMd,
  },
});
