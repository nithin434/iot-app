/**
 * Notifications Screen
 * View all notifications with read/unread states
 * Design Reference: Apple Notifications, clean and organized
 * Best practice: Clear grouping, mark as read, swipe actions
 * Industry-grade UX: Time grouping, icons, tap navigation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProfileStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { EmptyState } from '../../components/common';
import { hapticFeedback } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Notifications'>;

type NotificationType = 'order' | 'promotion' | 'product' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionData?: {
    screen?: string;
    params?: any;
  };
}

const NOTIFICATION_CONFIG = {
  order: {
    icon: 'package-variant',
    color: '#2196F3',
    bgColor: '#E3F2FD',
  },
  promotion: {
    icon: 'tag-percent',
    color: '#FF9800',
    bgColor: '#FFF3E0',
  },
  product: {
    icon: 'cube-outline',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
  },
  system: {
    icon: 'information',
    color: '#9C27B0',
    bgColor: '#F3E5F5',
  },
};

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Shipped',
    message: 'Your order #ORD2024001 has been shipped and will arrive by Jan 31',
    timestamp: '2024-01-29T10:30:00',
    isRead: false,
    actionData: {
      screen: 'OrderDetail',
      params: { orderId: '1' },
    },
  },
  {
    id: '2',
    type: 'promotion',
    title: 'Flash Sale Alert! 🎉',
    message: 'Get 25% off on all Arduino boards. Limited time offer!',
    timestamp: '2024-01-29T09:15:00',
    isRead: false,
  },
  {
    id: '3',
    type: 'order',
    title: 'Order Delivered',
    message: 'Your order #ORD2024002 has been delivered successfully',
    timestamp: '2024-01-28T16:45:00',
    isRead: true,
    actionData: {
      screen: 'OrderDetail',
      params: { orderId: '2' },
    },
  },
  {
    id: '4',
    type: 'product',
    title: 'Back in Stock',
    message: 'Raspberry Pi 4 (4GB) is now available. Order before it runs out!',
    timestamp: '2024-01-28T14:20:00',
    isRead: true,
  },
  {
    id: '5',
    type: 'promotion',
    title: 'Student Discount Activated',
    message: 'Congratulations! Your student verification is complete. Enjoy 20% off!',
    timestamp: '2024-01-27T11:00:00',
    isRead: true,
  },
  {
    id: '6',
    type: 'system',
    title: 'Welcome to IoT Marketplace',
    message: 'Thank you for joining us! Explore our wide range of IoT components.',
    timestamp: '2024-01-25T10:00:00',
    isRead: true,
  },
];

export const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    hapticFeedback.light();
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsRefreshing(false);
  };

  const handleMarkAllRead = () => {
    hapticFeedback.medium();
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    hapticFeedback.light();
    
    // Mark as read
    setNotifications(prev =>
      prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
    );

    // Navigate if action data exists
    if (notification.actionData?.screen) {
      navigation.navigate(notification.actionData.screen as any, notification.actionData.params);
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    hapticFeedback.medium();
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const groupNotificationsByDate = () => {
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const older: Notification[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    notifications.forEach(notification => {
      const notifDate = new Date(notification.timestamp);
      if (notifDate >= todayStart) {
        today.push(notification);
      } else if (notifDate >= yesterdayStart) {
        yesterday.push(notification);
      } else {
        older.push(notification);
      }
    });

    return { today, yesterday, older };
  };

  const renderNotificationCard = (notification: Notification, index: number) => {
    const config = NOTIFICATION_CONFIG[notification.type];

    return (
      <Animated.View entering={FadeInDown.delay(index * 50)}>
        <TouchableOpacity
          style={[
            styles.notificationCard,
            {
              backgroundColor: notification.isRead ? theme.surface : theme.primaryLight + '20',
              borderLeftColor: config.color,
            },
          ]}
          onPress={() => handleNotificationPress(notification)}
          activeOpacity={0.7}
        >
          {/* Icon */}
          <View style={[styles.notificationIcon, { backgroundColor: config.bgColor }]}>
            <MaterialCommunityIcons
              name={config.icon as any}
              size={24}
              color={config.color}
            />
          </View>

          {/* Content */}
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text
                style={[
                  typography.h4,
                  {
                    color: theme.text,
                    flex: 1,
                    fontWeight: notification.isRead ? '400' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {notification.title}
              </Text>
              {!notification.isRead && (
                <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
              )}
            </View>

            <Text
              style={[
                typography.body,
                {
                  color: theme.textSecondary,
                  marginTop: 4,
                },
              ]}
              numberOfLines={2}
            >
              {notification.message}
            </Text>

            <View style={styles.notificationFooter}>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>
                {formatTimestamp(notification.timestamp)}
              </Text>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteNotification(notification.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="close" size={18} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderSection = (title: string, items: Notification[], startIndex: number) => {
    if (items.length === 0) return null;

    return (
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
          {title}
        </Text>
        {items.map((notification, index) =>
          renderNotificationCard(notification, startIndex + index)
        )}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <EmptyState
        icon="bell-off"
        title="No Notifications"
        description="You're all caught up! We'll notify you when something new happens."
      />
    </View>
  );

  const { today, yesterday, older } = groupNotificationsByDate();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, { color: theme.text }]}>
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 2 }]}>
              {unreadCount} unread
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
          >
            <Text style={[typography.label, { color: theme.primary }]}>
              Mark All Read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={[{ key: 'content' }]}
          renderItem={() => (
            <>
              {renderSection('TODAY', today, 0)}
              {renderSection('YESTERDAY', yesterday, today.length)}
              {renderSection('OLDER', older, today.length + yesterday.length)}
            </>
          )}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
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
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  listContent: {
    paddingBottom: semanticSpacing.paddingXl,
  },
  section: {
    marginTop: semanticSpacing.marginMd,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: semanticSpacing.paddingMd,
    marginHorizontal: semanticSpacing.screenPaddingX,
    marginBottom: semanticSpacing.marginSm,
    borderRadius: semanticSpacing.radiusMd,
    borderLeftWidth: 4,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  deleteButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenPaddingX,
  },
});
