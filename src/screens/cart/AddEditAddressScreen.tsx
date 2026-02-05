/**
 * Add/Edit Address Screen
 * Form to add or edit delivery address
 * Best practice: Clear labels, inline validation, auto-save
 * Industry-grade UX: Smart input focus, error states, success feedback
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput as RNTextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Button, Input } from '../../components/common';
import { FadeIn } from '../../components/animations';
import { hapticFeedback } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<{ params: { addressId?: string } }>;

interface AddressForm {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
}

interface FormErrors {
  name?: string;
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const ADDRESS_TYPES = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'work', label: 'Work', icon: 'briefcase' },
  { id: 'other', label: 'Other', icon: 'map-marker' },
];

export const AddEditAddressScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  
  const addressId = route.params?.addressId;
  const isEditMode = !!addressId;

  // Form refs for auto-focus
  const phoneRef = useRef<RNTextInput>(null);
  const addressLine1Ref = useRef<RNTextInput>(null);
  const addressLine2Ref = useRef<RNTextInput>(null);
  const cityRef = useRef<RNTextInput>(null);
  const stateRef = useRef<RNTextInput>(null);
  const pincodeRef = useRef<RNTextInput>(null);

  const [formData, setFormData] = useState<AddressForm>({
    name: isEditMode ? 'Rahul Sharma' : '',
    phone: isEditMode ? '9876543210' : '',
    addressLine1: isEditMode ? '123, Tech Park, Sector 5' : '',
    addressLine2: isEditMode ? 'Near Metro Station' : '',
    city: isEditMode ? 'Bangalore' : '',
    state: isEditMode ? 'Karnataka' : '',
    pincode: isEditMode ? '560001' : '',
    type: 'home',
    isDefault: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const updateField = (field: keyof AddressForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter valid 10-digit phone number';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Enter valid 6-digit pincode';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      hapticFeedback.error();
      return;
    }

    hapticFeedback.medium();
    setIsSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Save address via API
      hapticFeedback.success();
      navigation.goBack();
    } catch (error) {
      hapticFeedback.error();
      console.error('Failed to save address:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderAddressTypeSelector = () => (
    <View style={styles.section}>
      <Text style={[typography.label, { color: theme.text, marginBottom: 12 }]}>
        Address Type
      </Text>
      <View style={styles.typeSelector}>
        {ADDRESS_TYPES.map((type, index) => {
          const isSelected = formData.type === type.id;
          return (
            <Animated.View
              key={type.id}
              entering={FadeInDown.delay(index * 50)}
              style={{ flex: 1 }}
            >
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.backgroundSecondary,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => {
                  hapticFeedback.light();
                  updateField('type', type.id as any);
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={type.icon as any}
                  size={24}
                  color={isSelected ? theme.textInverse : theme.textSecondary}
                />
                <Text
                  style={[
                    typography.label,
                    {
                      color: isSelected ? theme.textInverse : theme.text,
                      marginTop: 4,
                    },
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[typography.h3, { color: theme.text, flex: 1, textAlign: 'center' }]}>
            {isEditMode ? 'Edit Address' : 'Add New Address'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Form */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Contact Details Section */}
          <FadeIn delay={50}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="account" size={24} color={theme.primary} />
                <Text style={[typography.h4, { color: theme.text, marginLeft: 12 }]}>
                  Contact Details
                </Text>
              </View>

              <Input
                label="Full Name"
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                placeholder="Enter your full name"
                error={errors.name}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                autoCapitalize="words"
              />

              <Input
                ref={phoneRef}
                label="Phone Number"
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text.replace(/\D/g, ''))}
                placeholder="Enter 10-digit phone number"
                error={errors.phone}
                keyboardType="phone-pad"
                maxLength={10}
                returnKeyType="next"
                onSubmitEditing={() => addressLine1Ref.current?.focus()}
              />
            </View>
          </FadeIn>

          {/* Address Details Section */}
          <FadeIn delay={100}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="map-marker" size={24} color={theme.primary} />
                <Text style={[typography.h4, { color: theme.text, marginLeft: 12 }]}>
                  Address Details
                </Text>
              </View>

              <Input
                ref={addressLine1Ref}
                label="Address Line 1"
                value={formData.addressLine1}
                onChangeText={(text) => updateField('addressLine1', text)}
                placeholder="House/Flat No., Building Name"
                error={errors.addressLine1}
                returnKeyType="next"
                onSubmitEditing={() => addressLine2Ref.current?.focus()}
                multiline
                numberOfLines={2}
              />

              <Input
                ref={addressLine2Ref}
                label="Address Line 2 (Optional)"
                value={formData.addressLine2}
                onChangeText={(text) => updateField('addressLine2', text)}
                placeholder="Street, Landmark"
                returnKeyType="next"
                onSubmitEditing={() => cityRef.current?.focus()}
                multiline
                numberOfLines={2}
              />

              <View style={styles.row}>
                <Input
                  ref={cityRef}
                  label="City"
                  value={formData.city}
                  onChangeText={(text) => updateField('city', text)}
                  placeholder="City"
                  error={errors.city}
                  style={{ flex: 1, marginRight: 8 }}
                  returnKeyType="next"
                  onSubmitEditing={() => stateRef.current?.focus()}
                  autoCapitalize="words"
                />

                <Input
                  ref={stateRef}
                  label="State"
                  value={formData.state}
                  onChangeText={(text) => updateField('state', text)}
                  placeholder="State"
                  error={errors.state}
                  style={{ flex: 1, marginLeft: 8 }}
                  returnKeyType="next"
                  onSubmitEditing={() => pincodeRef.current?.focus()}
                  autoCapitalize="words"
                />
              </View>

              <Input
                ref={pincodeRef}
                label="Pincode"
                value={formData.pincode}
                onChangeText={(text) => updateField('pincode', text.replace(/\D/g, ''))}
                placeholder="6-digit pincode"
                error={errors.pincode}
                keyboardType="number-pad"
                maxLength={6}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            </View>
          </FadeIn>

          {/* Address Type */}
          <FadeIn delay={150}>
            {renderAddressTypeSelector()}
          </FadeIn>

          {/* Set as Default */}
          <FadeIn delay={200}>
            <TouchableOpacity
              style={[styles.defaultToggle, { backgroundColor: theme.surface }]}
              onPress={() => {
                hapticFeedback.light();
                updateField('isDefault', !formData.isDefault);
              }}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={[typography.h4, { color: theme.text }]}>
                  Set as Default Address
                </Text>
                <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 4 }]}>
                  This address will be selected by default for future orders
                </Text>
              </View>
              <View
                style={[
                  styles.toggle,
                  {
                    backgroundColor: formData.isDefault ? theme.primary : theme.backgroundSecondary,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: theme.textInverse,
                      transform: [{ translateX: formData.isDefault ? 20 : 0 }],
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </FadeIn>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Bar */}
        <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
          <LinearGradient
            colors={[theme.surface, theme.surface + 'F0']}
            style={styles.bottomGradient}
          />
          <View style={styles.bottomContent}>
            <Button
              title={isEditMode ? 'Update Address' : 'Save Address'}
              onPress={handleSave}
              variant="primary"
              loading={isSaving}
              disabled={isSaving}
              icon={<MaterialCommunityIcons name="check" size={20} color={theme.textInverse} />}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingTop: semanticSpacing.paddingLg,
  },
  section: {
    marginBottom: semanticSpacing.marginLg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: semanticSpacing.marginMd,
  },
  row: {
    flexDirection: 'row',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    alignItems: 'center',
    paddingVertical: semanticSpacing.paddingMd,
    borderRadius: semanticSpacing.radiusMd,
    borderWidth: 2,
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: semanticSpacing.paddingMd,
    borderRadius: semanticSpacing.radiusMd,
    marginBottom: semanticSpacing.marginMd,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  bottomBar: {
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
    padding: semanticSpacing.paddingMd,
  },
});
