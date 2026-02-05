/**
 * Settings Screen
 * App settings and preferences
 * Design Reference: Apple Settings - clean, grouped, clear
 * Best practice: Grouped settings, toggle switches, clear labels
 * Industry-grade UX: Instant feedback, organized sections
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
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
import { hapticFeedback } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;

interface ToggleSetting {
  id: string;
  title: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

interface LinkSetting {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  onPress: () => void;
}

interface SettingsSection {
  id: string;
  title: string;
  toggles?: ToggleSetting[];
  links?: LinkSetting[];
}

export const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  // Notification settings
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [newProducts, setNewProducts] = useState(false);
  const [priceDrops, setPriceDrops] = useState(true);

  // App settings
  const [darkMode, setDarkMode] = useState(isDark);
  const [haptics, setHaptics] = useState(true);

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const handleThemeToggle = (value: boolean) => {
    hapticFeedback.light();
    setDarkMode(value);
    toggleTheme();
  };

  const handleHapticsToggle = (value: boolean) => {
    if (value) {
      hapticFeedback.light();
    }
    setHaptics(value);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => hapticFeedback.light(),
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            hapticFeedback.medium();
            // Clear cache logic
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const settingsSections: SettingsSection[] = [
    {
      id: 'notifications',
      title: 'NOTIFICATIONS',
      toggles: [
        {
          id: 'order-updates',
          title: 'Order Updates',
          description: 'Get notified about your order status',
          value: orderUpdates,
          onChange: setOrderUpdates,
        },
        {
          id: 'promotions',
          title: 'Promotions & Offers',
          description: 'Receive exclusive deals and discounts',
          value: promotions,
          onChange: setPromotions,
        },
        {
          id: 'new-products',
          title: 'New Products',
          description: 'Be the first to know about new arrivals',
          value: newProducts,
          onChange: setNewProducts,
        },
        {
          id: 'price-drops',
          title: 'Price Drop Alerts',
          description: 'Get notified when prices drop',
          value: priceDrops,
          onChange: setPriceDrops,
        },
      ],
    },
    {
      id: 'appearance',
      title: 'APPEARANCE',
      toggles: [
        {
          id: 'dark-mode',
          title: 'Dark Mode',
          description: 'Use dark theme throughout the app',
          value: darkMode,
          onChange: handleThemeToggle,
        },
      ],
    },
    {
      id: 'preferences',
      title: 'PREFERENCES',
      toggles: [
        {
          id: 'haptics',
          title: 'Haptic Feedback',
          description: 'Feel vibrations when interacting',
          value: haptics,
          onChange: handleHapticsToggle,
        },
      ],
      links: [
        {
          id: 'language',
          title: 'Language',
          description: 'English',
          onPress: () => {
            hapticFeedback.light();
            Alert.alert('Coming Soon', 'Multiple languages will be available soon');
          },
        },
      ],
    },
    {
      id: 'data',
      title: 'DATA & STORAGE',
      links: [
        {
          id: 'clear-cache',
          title: 'Clear Cache',
          description: 'Free up storage space',
          icon: 'delete-sweep',
          onPress: handleClearCache,
        },
      ],
    },
    {
      id: 'about',
      title: 'ABOUT',
      links: [
        {
          id: 'terms',
          title: 'Terms of Service',
          onPress: () => {
            hapticFeedback.light();
            // Open terms
          },
        },
        {
          id: 'privacy',
          title: 'Privacy Policy',
          onPress: () => {
            hapticFeedback.light();
            // Open privacy policy
          },
        },
        {
          id: 'licenses',
          title: 'Open Source Licenses',
          onPress: () => {
            hapticFeedback.light();
            // Open licenses
          },
        },
      ],
    },
  ];

  const renderToggleSetting = (setting: ToggleSetting, index: number, isLast: boolean) => (
    <Animated.View
      key={setting.id}
      entering={FadeInDown.delay(index * 50)}
    >
      <View
        style={[
          styles.settingItem,
          {
            backgroundColor: theme.surface,
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[typography.body, { color: theme.text }]}>
            {setting.title}
          </Text>
          {setting.description && (
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
              {setting.description}
            </Text>
          )}
        </View>
        <Switch
          value={setting.value}
          onValueChange={(value) => {
            hapticFeedback.light();
            setting.onChange(value);
          }}
          trackColor={{ false: theme.border, true: theme.primary }}
          thumbColor={theme.textInverse}
        />
      </View>
    </Animated.View>
  );

  const renderLinkSetting = (setting: LinkSetting, index: number, isLast: boolean) => (
    <Animated.View
      key={setting.id}
      entering={FadeInDown.delay(index * 50)}
    >
      <TouchableOpacity
        style={[
          styles.settingItem,
          {
            backgroundColor: theme.surface,
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: theme.border,
          },
        ]}
        onPress={setting.onPress}
        activeOpacity={0.7}
      >
        {setting.icon && (
          <View style={[styles.linkIcon, { backgroundColor: theme.errorLight }]}>
            <MaterialCommunityIcons
              name={setting.icon as any}
              size={20}
              color={theme.error}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[typography.body, { color: theme.text }]}>
            {setting.title}
          </Text>
          {setting.description && (
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
              {setting.description}
            </Text>
          )}
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSection = (section: SettingsSection) => (
    <View key={section.id} style={styles.section}>
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
        {section.title}
      </Text>

      <View style={[styles.settingsGroup, { backgroundColor: theme.surface }]}>
        {section.toggles?.map((toggle, index) =>
          renderToggleSetting(
            toggle,
            index,
            index === (section.toggles?.length || 0) - 1 && !section.links?.length
          )
        )}
        {section.links?.map((link, index) =>
          renderLinkSetting(
            link,
            (section.toggles?.length || 0) + index,
            index === (section.links?.length || 0) - 1
          )
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: theme.text, flex: 1 }]}>
          Settings
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {settingsSections.map(renderSection)}

        {/* App Version */}
        <Text
          style={[
            typography.caption,
            {
              color: theme.textSecondary,
              textAlign: 'center',
              marginTop: semanticSpacing.marginLg,
              marginBottom: semanticSpacing.marginXl,
            },
          ]}
        >
          Version 1.0.0 (Build 1)
        </Text>
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
    paddingBottom: semanticSpacing.paddingXl,
  },
  section: {
    marginBottom: semanticSpacing.marginMd,
  },
  settingsGroup: {
    marginHorizontal: semanticSpacing.screenPaddingX,
    borderRadius: semanticSpacing.radiusLg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: semanticSpacing.paddingMd,
    paddingHorizontal: semanticSpacing.paddingMd,
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
});
