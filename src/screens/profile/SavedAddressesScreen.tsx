/**
 * Saved Addresses Screen
 * Manage delivery addresses
 * Design Reference: Apple-style list with swipe actions
 * Best practice: Clear default indicator, easy edit/delete
 * Industry-grade UX: Swipe actions, FAB for add, empty state
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutRight } from 'react-native-reanimated';
import { ProfileStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { EmptyState } from '../../components/common';
import { FadeIn } from '../../components/animations';
import { hapticFeedback } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'SavedAddresses'>;

interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  type: 'home' | 'work' | 'other';
}

const ADDRESS_TYPE_CONFIG = {
  home: { icon: 'home', color: '#4CAF50', label: 'Home' },
  work: { icon: 'briefcase', color: '#2196F3', label: 'Work' },
  other: { icon: 'map-marker', color: '#FF9800', label: 'Other' },
};

// Mock addresses
const MOCK_ADDRESSES: Address[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    addressLine1: '123, Tech Park, Sector 5',
    addressLine2: 'Near Metro Station',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    isDefault: true,
    type: 'home',
  },
  {
    id: '2',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    addressLine1: 'Office 401, Innovation Hub',
    addressLine2: 'Electronic City Phase 1',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560100',
    isDefault: false,
    type: 'work',
  },
];

export const SavedAddressesScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const handleAddNew = () => {
    hapticFeedback.light();
    navigation.navigate('AddEditAddress', { addressId: undefined });
  };

  const handleEdit = (addressId: string) => {
    hapticFeedback.light();
    navigation.navigate('AddEditAddress', { addressId });
  };

  const handleDelete = (address: Address) => {
    if (address.isDefault) {
      Alert.alert(
        'Cannot Delete',
        'You cannot delete your default address. Please set another address as default first.',
        [{ text: 'OK', onPress: () => hapticFeedback.light() }]
      );
      return;
    }

    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => hapticFeedback.light(),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            hapticFeedback.medium();
            setDeletingId(address.id);
            setTimeout(() => {
              setAddresses(prev => prev.filter(addr => addr.id !== address.id));
              setDeletingId(null);
            }, 300);
          },
        },
      ]
    );
  };

  const handleSetDefault = (addressId: string) => {
    hapticFeedback.medium();
    setAddresses(prev =>
      prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      }))
    );
  };

  const renderAddressCard = ({ item, index }: { item: Address; index: number }) => {
    const typeConfig = ADDRESS_TYPE_CONFIG[item.type];
    const isDeleting = deletingId === item.id;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50)}
        exiting={FadeOutRight}
      >
        <View
          style={[
            styles.addressCard,
            {
              backgroundColor: theme.surface,
              opacity: isDeleting ? 0.5 : 1,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.typeContainer}>
              <View style={[styles.typeIcon, { backgroundColor: typeConfig.color + '20' }]}>
                <MaterialCommunityIcons
                  name={typeConfig.icon as any}
                  size={20}
                  color={typeConfig.color}
                />
              </View>
              <Text style={[typography.h4, { color: theme.text, marginLeft: 12 }]}>
                {typeConfig.label}
              </Text>
            </View>

            {item.isDefault && (
              <View style={[styles.defaultBadge, { backgroundColor: theme.primaryLight }]}>
                <MaterialCommunityIcons name="star" size={14} color={theme.primary} />
                <Text style={[typography.caption, { color: theme.primary, marginLeft: 4 }]}>
                  Default
                </Text>
              </View>
            )}
          </View>

          {/* Address Details */}
          <View style={styles.addressDetails}>
            <Text style={[typography.h4, { color: theme.text }]}>
              {item.name}
            </Text>
            <Text style={[typography.body, { color: theme.textSecondary, marginTop: 4 }]}>
              {item.phone}
            </Text>
            <Text style={[typography.body, { color: theme.text, marginTop: 8 }]}>
              {item.addressLine1}
            </Text>
            {item.addressLine2 && (
              <Text style={[typography.body, { color: theme.text }]}>
                {item.addressLine2}
              </Text>
            )}
            <Text style={[typography.body, { color: theme.text }]}>
              {item.city}, {item.state} - {item.pincode}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.cardActions}>
            {!item.isDefault && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.primaryLight }]}
                onPress={() => handleSetDefault(item.id)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="star" size={18} color={theme.primary} />
                <Text style={[typography.label, { color: theme.primary, marginLeft: 6 }]}>
                  Set Default
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => handleEdit(item.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="pencil" size={18} color={theme.text} />
              <Text style={[typography.label, { color: theme.text, marginLeft: 6 }]}>
                Edit
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.errorLight }]}
              onPress={() => handleDelete(item)}
              activeOpacity={0.7}
              disabled={isDeleting}
            >
              <MaterialCommunityIcons name="delete" size={18} color={theme.error} />
              <Text style={[typography.label, { color: theme.error, marginLeft: 6 }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <EmptyState
        icon="map-marker-off"
        title="No Saved Addresses"
        description="Add a delivery address to make checkout faster"
        actionLabel="Add Address"
        onAction={handleAddNew}
      />
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
          Saved Addresses
        </Text>
      </View>

      {/* Address List */}
      {addresses.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={addresses}
          renderItem={renderAddressCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={handleAddNew}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={28} color={theme.textInverse} />
      </TouchableOpacity>
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
  listContent: {
    padding: semanticSpacing.screenPaddingX,
  },
  addressCard: {
    borderRadius: semanticSpacing.radiusLg,
    padding: semanticSpacing.paddingMd,
    marginBottom: semanticSpacing.marginMd,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: semanticSpacing.marginMd,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: semanticSpacing.radiusMd,
  },
  addressDetails: {
    marginBottom: semanticSpacing.marginMd,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: semanticSpacing.radiusMd,
  },
  fab: {
    position: 'absolute',
    right: semanticSpacing.screenPaddingX,
    bottom: semanticSpacing.screenPaddingX,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenPaddingX,
  },
});
