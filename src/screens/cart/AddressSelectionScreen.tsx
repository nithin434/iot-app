/**
 * Address Selection Screen (Bottom Sheet)
 * Select delivery address from saved addresses
 * Best practice: Easy selection, clear visual hierarchy
 * Industry-grade UX: Radio selection, quick actions, smooth animations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Button, EmptyState } from '../../components/common';
import { FadeIn, SlideUp } from '../../components/animations';
import { hapticFeedback } from '../../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddressSelection'>;

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
  {
    id: '3',
    name: 'Priya Sharma',
    phone: '+91 98765 43211',
    addressLine1: '45, Green Valley Apartments',
    addressLine2: 'Whitefield Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560066',
    isDefault: false,
    type: 'home',
  },
];

const ADDRESS_TYPE_CONFIG = {
  home: { icon: 'home', color: '#4CAF50', label: 'Home' },
  work: { icon: 'briefcase', color: '#2196F3', label: 'Work' },
  other: { icon: 'map-marker', color: '#FF9800', label: 'Other' },
};

export const AddressSelectionScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [selectedId, setSelectedId] = useState<string>(
    MOCK_ADDRESSES.find(a => a.isDefault)?.id || MOCK_ADDRESSES[0]?.id || ''
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleClose = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const handleSelectAddress = (addressId: string) => {
    hapticFeedback.light();
    setSelectedId(addressId);
  };

  const handleConfirm = () => {
    hapticFeedback.medium();
    // TODO: Update selected address in store
    navigation.goBack();
  };

  const handleEditAddress = (addressId: string) => {
    hapticFeedback.light();
    navigation.navigate('AddEditAddress' as any, { addressId } as any);
  };

  const handleDeleteAddress = (addressId: string) => {
    hapticFeedback.medium();
    setDeletingId(addressId);
    
    // Show confirmation and delete
    setTimeout(() => {
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      setDeletingId(null);
      
      // If deleted address was selected, select another
      if (selectedId === addressId) {
        const remaining = addresses.filter(addr => addr.id !== addressId);
        if (remaining.length > 0) {
          setSelectedId(remaining[0].id);
        }
      }
    }, 300);
  };

  const handleAddNew = () => {
    hapticFeedback.light();
    navigation.navigate('AddEditAddress' as any, { addressId: undefined } as any);
  };

  const renderAddressCard = ({ item, index }: { item: Address; index: number }) => {
    const isSelected = selectedId === item.id;
    const isDeleting = deletingId === item.id;
    const typeConfig = ADDRESS_TYPE_CONFIG[item.type];

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50)}
        exiting={FadeOutUp}
        style={[
          styles.addressCard,
          {
            backgroundColor: theme.surface,
            borderColor: isSelected ? theme.primary : theme.border,
            borderWidth: isSelected ? 2 : 1,
            opacity: isDeleting ? 0.5 : 1,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.addressContent}
          onPress={() => handleSelectAddress(item.id)}
          activeOpacity={0.7}
          disabled={isDeleting}
        >
          {/* Radio Button */}
          <View style={styles.radioContainer}>
            <View style={[styles.radioOuter, { borderColor: theme.border }]}>
              {isSelected && (
                <Animated.View
                  entering={FadeInDown}
                  style={[styles.radioInner, { backgroundColor: theme.primary }]}
                />
              )}
            </View>
          </View>

          {/* Address Details */}
          <View style={styles.addressDetails}>
            {/* Header Row */}
            <View style={styles.addressHeader}>
              <View style={styles.nameRow}>
                <Text style={[typography.h4, { color: theme.text }]}>
                  {item.name}
                </Text>
                
                {/* Address Type Badge */}
                <View style={[styles.typeBadge, { backgroundColor: typeConfig.color + '20' }]}>
                  <MaterialCommunityIcons
                    name={typeConfig.icon as any}
                    size={12}
                    color={typeConfig.color}
                  />
                  <Text style={[typography.caption, { color: typeConfig.color, marginLeft: 4 }]}>
                    {typeConfig.label}
                  </Text>
                </View>
              </View>

              {item.isDefault && (
                <View style={[styles.defaultBadge, { backgroundColor: theme.primaryLight }]}>
                  <MaterialCommunityIcons name="star" size={12} color={theme.primary} />
                  <Text style={[typography.caption, { color: theme.primary, marginLeft: 4 }]}>
                    Default
                  </Text>
                </View>
              )}
            </View>

            {/* Phone */}
            <View style={styles.infoRow}>
              <MaterialCommunityIcons name="phone" size={14} color={theme.textSecondary} />
              <Text style={[typography.body, { color: theme.textSecondary, marginLeft: 6 }]}>
                {item.phone}
              </Text>
            </View>

            {/* Address */}
            <View style={styles.addressTextContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color={theme.textSecondary}
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1, marginLeft: 6 }}>
                <Text style={[typography.body, { color: theme.text }]}>
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
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.primaryLight }]}
                onPress={() => handleEditAddress(item.id)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="pencil" size={16} color={theme.primary} />
                <Text style={[typography.label, { color: theme.primary, marginLeft: 6 }]}>
                  Edit
                </Text>
              </TouchableOpacity>

              {!item.isDefault && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.errorLight }]}
                  onPress={() => handleDeleteAddress(item.id)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="delete" size={16} color={theme.error} />
                  <Text style={[typography.label, { color: theme.error, marginLeft: 6 }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Selected Indicator */}
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}>
            <MaterialCommunityIcons name="check" size={20} color={theme.textInverse} />
          </View>
        )}
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <EmptyState
        icon="map-marker-off"
        title="No Saved Addresses"
        description="Add a delivery address to continue with your order"
        actionLabel="Add Address"
        onAction={handleAddNew}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <MaterialCommunityIcons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: theme.text, flex: 1, textAlign: 'center' }]}>
          Select Address
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Address Count */}
      {addresses.length > 0 && (
        <FadeIn delay={50}>
          <View style={styles.countContainer}>
            <MaterialCommunityIcons name="map-marker-multiple" size={20} color={theme.primary} />
            <Text style={[typography.body, { color: theme.textSecondary, marginLeft: 8 }]}>
              {addresses.length} saved {addresses.length === 1 ? 'address' : 'addresses'}
            </Text>
          </View>
        </FadeIn>
      )}

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
          ListFooterComponent={<View style={{ height: 180 }} />}
        />
      )}

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <LinearGradient
          colors={[theme.surface, theme.surface + 'F0']}
          style={styles.bottomGradient}
        />
        <View style={styles.bottomContent}>
          {/* Add New Address Button */}
          <Button
            title="Add New Address"
            onPress={handleAddNew}
            variant="secondary"
            style={styles.addButton}
            icon={<MaterialCommunityIcons name="plus" size={20} color={theme.primary} />}
          />

          {/* Confirm Button */}
          {addresses.length > 0 && (
            <Button
              title="Deliver Here"
              onPress={handleConfirm}
              variant="primary"
              style={styles.confirmButton}
              icon={<MaterialCommunityIcons name="check" size={20} color={theme.textInverse} />}
            />
          )}
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
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingVertical: semanticSpacing.paddingMd,
  },
  listContent: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingTop: semanticSpacing.paddingMd,
  },
  addressCard: {
    borderRadius: semanticSpacing.radiusLg,
    marginBottom: semanticSpacing.marginMd,
    overflow: 'hidden',
  },
  addressContent: {
    flexDirection: 'row',
    padding: semanticSpacing.paddingMd,
  },
  radioContainer: {
    paddingTop: 4,
    marginRight: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  addressDetails: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: semanticSpacing.radiusSm,
    marginLeft: 8,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: semanticSpacing.radiusSm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTextContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: semanticSpacing.radiusMd,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
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
    padding: semanticSpacing.paddingMd,
    gap: 12,
  },
  addButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingBottom: 100,
  },
});
