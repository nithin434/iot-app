/**
 * Profile Screen - IoT Marketplace
 * User profile, orders history, settings
 * Production-ready with real API integration
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProfileStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { Card, Badge, Button } from '../../components/common';
import { useAuthStore } from '../../stores';
import { hapticFeedback } from '../../utils/haptics';
import { authService } from '../../services/api/auth';
import { cartService } from '../../services/api/cart';
import { moderateScale, getResponsivePadding, getResponsiveMargin } from '../../utils/responsive';

const PADDING = getResponsivePadding();
const MARGIN = getResponsiveMargin();

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  isStudentVerified: boolean;
  studentDiscount: number;
  createdAt: string;
}

interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
}

export const ProfileScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { user: authUser, logout } = useAuthStore();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [])
  );

  const loadProfileData = async () => {
    try {
      setIsLoading(true);

      // Load user profile
      const profile = await authService.getProfile();
      setUserData(profile);

      // Load order statistics
      const orders = await cartService.getUserOrders();
      const completed = orders.filter((o) => o.status === 'delivered').length;
      const pending = orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length;
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

      setOrderStats({
        totalOrders: orders.length,
        completedOrders: completed,
        pendingOrders: pending,
        totalSpent,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          hapticFeedback.light();
          try {
            await authService.logout();
            logout();
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <Text style={[typography.h3, { color: theme.text, fontWeight: '700', fontSize: moderateScale(18) }]}>
            Profile
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <MaterialCommunityIcons name="cog" size={moderateScale(24)} color={theme.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* User Info Card */}
        <Card style={[styles.userCard, { backgroundColor: theme.primaryLight }]}>
          <View style={styles.userHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
              {userData?.avatar_url ? (
                <Image source={{ uri: userData.avatar_url }} style={{ width: '100%', height: '100%' }} />
              ) : (
                <MaterialCommunityIcons name="account-circle" size={moderateScale(64)} color="#FFF" />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={[typography.h3, { color: theme.text, fontWeight: '700', fontSize: moderateScale(18) }]}>
                {userData?.name || 'User'}
              </Text>
              <Text style={[typography.body, { color: theme.textSecondary, fontSize: moderateScale(13), marginTop: 4 }]}>
                {userData?.email}
              </Text>
              {userData?.isStudentVerified && (
                <Badge label="Verified Student" variant="success" size="small" style={{ marginTop: 8 }} />
              )}
            </View>
          </View>

          <TouchableOpacity style={[styles.editBtn, { backgroundColor: theme.primary }]} onPress={() => navigation.navigate('EditProfile')}>
            <MaterialCommunityIcons name="pencil" size={moderateScale(16)} color="#FFF" />
            <Text style={[typography.body, { color: '#FFF', fontWeight: '600', marginLeft: 6, fontSize: moderateScale(13) }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Order Statistics */}
        {orderStats && (
          <View style={styles.statsSection}>
            <Text style={[typography.h4, { color: theme.text, fontWeight: '700', fontSize: moderateScale(16), marginBottom: 12 }]}>
              Order Statistics
            </Text>

            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <MaterialCommunityIcons name="package-multiple" size={moderateScale(32)} color={theme.primary} />
                <Text style={[typography.h3, { color: theme.primary, fontWeight: '700', fontSize: moderateScale(20), marginTop: 8 }]}>
                  {orderStats.totalOrders}
                </Text>
                <Text style={[typography.caption, { color: theme.textSecondary, fontSize: moderateScale(12), marginTop: 4 }]}>
                  Total Orders
                </Text>
              </Card>

              <Card style={styles.statCard}>
                <MaterialCommunityIcons name="check-circle" size={moderateScale(32)} color={theme.success} />
                <Text style={[typography.h3, { color: theme.success, fontWeight: '700', fontSize: moderateScale(20), marginTop: 8 }]}>
                  {orderStats.completedOrders}
                </Text>
                <Text style={[typography.caption, { color: theme.textSecondary, fontSize: moderateScale(12), marginTop: 4 }]}>
                  Delivered
                </Text>
              </Card>

              <Card style={styles.statCard}>
                <MaterialCommunityIcons name="clock-outline" size={moderateScale(32)} color={theme.warning} />
                <Text style={[typography.h3, { color: theme.warning, fontWeight: '700', fontSize: moderateScale(20), marginTop: 8 }]}>
                  {orderStats.pendingOrders}
                </Text>
                <Text style={[typography.caption, { color: theme.textSecondary, fontSize: moderateScale(12), marginTop: 4 }]}>
                  Pending
                </Text>
              </Card>

              <Card style={styles.statCard}>
                <MaterialCommunityIcons name="currency-inr" size={moderateScale(32)} color={theme.error} />
                <Text style={[typography.h3, { color: theme.error, fontWeight: '700', fontSize: moderateScale(18), marginTop: 8 }]}>
                  ₹{orderStats.totalSpent}
                </Text>
                <Text style={[typography.caption, { color: theme.textSecondary, fontSize: moderateScale(12), marginTop: 4 }]}>
                  Total Spent
                </Text>
              </Card>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="history" size={moderateScale(24)} color={theme.primary} />
              <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginLeft: 12, fontSize: moderateScale(14) }]}>
                Order History
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={moderateScale(24)} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate('Addresses')}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="map-marker-multiple" size={moderateScale(24)} color={theme.primary} />
              <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginLeft: 12, fontSize: moderateScale(14) }]}>
                Saved Addresses
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={moderateScale(24)} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate('SavedItems')}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="heart" size={moderateScale(24)} color={theme.primary} />
              <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginLeft: 12, fontSize: moderateScale(14) }]}>
                Saved Items
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={moderateScale(24)} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="bell" size={moderateScale(24)} color={theme.primary} />
              <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginLeft: 12, fontSize: moderateScale(14) }]}>
                Notifications
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => {
                hapticFeedback.light();
                setNotificationsEnabled(value);
              }}
              thumbColor={notificationsEnabled ? theme.primary : theme.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
            onPress={() => navigation.navigate('Help')}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="help-circle" size={moderateScale(24)} color={theme.primary} />
              <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginLeft: 12, fontSize: moderateScale(14) }]}>
                Help & Support
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={moderateScale(24)} color={theme.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('About')}
          >
            <View style={styles.menuItemLeft}>
              <MaterialCommunityIcons name="information" size={moderateScale(24)} color={theme.primary} />
              <Text style={[typography.body, { color: theme.text, fontWeight: '600', marginLeft: 12, fontSize: moderateScale(14) }]}>
                About App
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={moderateScale(24)} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="error"
          style={{ marginHorizontal: PADDING, marginVertical: MARGIN * 2 }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PADDING,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
  },
  userCard: {
    margin: PADDING,
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsSection: {
    paddingHorizontal: PADDING,
    marginBottom: MARGIN * 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: MARGIN,
  },
  statCard: {
    width: '48%',
    padding: 16,
    alignItems: 'center',
  },
  menuSection: {
    marginBottom: PADDING,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PADDING,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});
