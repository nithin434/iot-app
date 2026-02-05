/**
 * Product Detail Screen
 * Comprehensive product view with gallery, specs, and recommendations
 * Best practice: Provide all information needed for purchase decision
 * Industry-grade UX: Smooth scrolling, sticky header, quick actions
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Button, Card, Badge } from '../../components/common';
import { FadeIn, SlideUp, ScaleIn } from '../../components/animations';
import { useCartStore, useAuthStore } from '../../stores';
import { hapticFeedback } from '../../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_HEIGHT * 0.4;

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'ProductDetail'>;
type RoutePropType = RouteProp<HomeStackParamList, 'ProductDetail'>;

type TabType = 'specs' | 'diagram' | 'uses' | 'compatible';

// Mock product data - will be replaced with API data
const mockProduct = {
  id: '1',
  name: 'Arduino Uno R3 Development Board',
  description: 'The Arduino Uno R3 is a microcontroller board based on the ATmega328P. It has 14 digital input/output pins, 6 analog inputs, a 16 MHz ceramic resonator, a USB connection, a power jack, an ICSP header and a reset button.',
  price: 599,
  studentPrice: 499,
  images: [
    require('../../../assets/icon.png'),
    require('../../../assets/icon.png'),
    require('../../../assets/icon.png'),
  ],
  stock: 45,
  difficulty: 'Beginner',
  specifications: {
    'Microcontroller': 'ATmega328P',
    'Operating Voltage': '5V',
    'Input Voltage': '7-12V',
    'Digital I/O Pins': '14',
    'Analog Input Pins': '6',
    'Flash Memory': '32 KB',
    'SRAM': '2 KB',
    'EEPROM': '1 KB',
    'Clock Speed': '16 MHz',
  },
  useCases: [
    'Home Automation Projects',
    'Robotics and Motor Control',
    'Sensor Data Collection',
    'LED Matrix Displays',
    'IoT Applications',
  ],
  compatibleComponents: [
    { id: '2', name: 'USB Cable Type A-B', price: 49 },
    { id: '3', name: 'Breadboard 830 Points', price: 99 },
    { id: '4', name: 'Jumper Wires Set', price: 79 },
  ],
};

export const ProductDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { productId } = route.params;
  
  const { user } = useAuthStore();
  const { addItem, getItemQuantity } = useCartStore();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState<TabType>('specs');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const imageScrollRef = useRef<FlatList>(null);

  const product = mockProduct; // Replace with actual product fetch
  const isStudent = user?.isStudentVerified;
  const displayPrice = isStudent && product.studentPrice ? product.studentPrice : product.price;
  const cartQuantity = getItemQuantity(productId);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  // Fade effect for floating buttons
  const floatingButtonsOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  // Fade effect for image overlay
  const imageOverlayOpacity = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT / 2],
    outputRange: [0, 0.3],
    extrapolate: 'clamp',
  });

  const handleBack = () => {
    navigation.goBack();
  };

  const handleAddToCart = async () => {
    hapticFeedback.medium();
    setIsAddingToCart(true);
    
    try {
      await addItem(productId, quantity);
      hapticFeedback.success();
      // Show success animation or toast
    } catch (error) {
      hapticFeedback.error();
      console.error('Add to cart error:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      hapticFeedback.light();
      setQuantity(newQuantity);
    }
  };

  const handleTabChange = (tab: TabType) => {
    hapticFeedback.light();
    setSelectedTab(tab);
  };

  const renderImageItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.imageContainer}>
      <Animated.Image
        source={item}
        style={[
          styles.productImage,
          {
            transform: [{ scale: index === currentImageIndex ? imageScale : 1 }],
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );

  const renderImagePagination = () => (
    <View style={styles.imagePagination}>
      {product.images.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            {
              backgroundColor: index === currentImageIndex ? theme.primary : theme.textInverse,
              opacity: index === currentImageIndex ? 1 : 0.5,
            },
          ]}
        />
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'specs':
        return (
          <View style={styles.tabContent}>
            {Object.entries(product.specifications).map(([key, value]) => (
              <View key={key} style={[styles.specRow, { borderBottomColor: theme.border }]}>
                <Text style={[typography.bodySmall, { color: theme.textSecondary, flex: 1 }]}>
                  {key}
                </Text>
                <Text style={[typography.bodySmall, { color: theme.text, fontWeight: '600' }]}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'diagram':
        return (
          <View style={styles.tabContent}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.diagramImage}
              resizeMode="contain"
            />
            <Text style={[typography.caption, { color: theme.textSecondary, textAlign: 'center', marginTop: semanticSpacing.marginMd }]}>
              Pinch to zoom • Tap to view full screen
            </Text>
          </View>
        );

      case 'uses':
        return (
          <View style={styles.tabContent}>
            {product.useCases.map((useCase, index) => (
              <View key={index} style={styles.useCaseItem}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={theme.success}
                  style={{ marginRight: semanticSpacing.marginSm }}
                />
                <Text style={[typography.body, { color: theme.text, flex: 1 }]}>
                  {useCase}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'compatible':
        return (
          <View style={styles.tabContent}>
            {product.compatibleComponents.map((component) => (
              <TouchableOpacity
                key={component.id}
                style={[styles.compatibleItem, { backgroundColor: theme.surface }]}
                activeOpacity={0.7}
              >
                <View style={styles.compatibleInfo}>
                  <Text style={[typography.bodySmall, { color: theme.text }]}>
                    {component.name}
                  </Text>
                  <Text style={[typography.h4, { color: theme.primary, marginTop: 4 }]}>
                    ₹{component.price}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.addCompatibleButton, { backgroundColor: theme.primaryLight }]}
                  onPress={() => hapticFeedback.light()}
                >
                  <MaterialCommunityIcons name="plus" size={20} color={theme.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Sticky Header */}
      <Animated.View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            opacity: headerOpacity,
          },
        ]}
      >
        <Text style={[typography.h4, { color: theme.text }]} numberOfLines={1}>
          {product.name}
        </Text>
      </Animated.View>

      {/* Floating Action Buttons */}
      <Animated.View 
        style={[
          styles.floatingActions,
          { opacity: floatingButtonsOpacity }
        ]}
      >
        <TouchableOpacity
          style={[styles.floatingButton, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}
          onPress={handleBack}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.floatingButtonsRight}>
          <TouchableOpacity
            style={[styles.floatingButton, { backgroundColor: 'rgba(255, 255, 255, 0.95)', marginRight: 8 }]}
            onPress={() => hapticFeedback.light()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="share-variant" size={24} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.floatingButton, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}
            onPress={() => hapticFeedback.light()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="heart-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          <FlatList
            ref={imageScrollRef}
            data={product.images}
            renderItem={renderImageItem}
            keyExtractor={(_, index) => `image-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setCurrentImageIndex(index);
            }}
          />
          {/* Fade overlay for depth effect */}
          <Animated.View 
            style={[
              styles.imageOverlay,
              { opacity: imageOverlayOpacity }
            ]} 
          />
          {/* Bottom gradient fade */}
          <LinearGradient
            colors={['transparent', theme.background]}
            style={styles.imageGradientOverlay}
            pointerEvents="none"
          />
          {renderImagePagination()}
        </View>

        {/* Product Info */}
        <View style={styles.contentContainer}>
          <FadeIn>
            <View style={styles.productHeader}>
              <View style={styles.productTitleRow}>
                <Text style={[typography.h2, { color: theme.text, flex: 1 }]}>
                  {product.name}
                </Text>
              </View>
              
              <View style={styles.productMeta}>
                <Badge label={product.difficulty} variant="info" />
                <View style={styles.stockIndicator}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color={theme.success}
                  />
                  <Text style={[typography.caption, { color: theme.success, marginLeft: 4 }]}>
                    {product.stock} in stock
                  </Text>
                </View>
              </View>

              <View style={styles.priceContainer}>
                <View>
                  <Text style={[typography.h1, { color: theme.primary }]}>
                    ₹{displayPrice}
                  </Text>
                  {isStudent && product.studentPrice && (
                    <View style={styles.savingsRow}>
                      <Text style={[typography.caption, { color: theme.textSecondary, textDecorationLine: 'line-through' }]}>
                        ₹{product.price}
                      </Text>
                      <Badge
                        label={`Save ₹${product.price - product.studentPrice}`}
                        variant="success"
                        size="small"
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  )}
                </View>
              </View>

              <Text style={[typography.body, { color: theme.textSecondary, marginTop: semanticSpacing.marginMd }]}>
                {product.description}
              </Text>
            </View>
          </FadeIn>

          {/* Tabs */}
          <SlideUp delay={200}>
            <View style={styles.tabsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  { key: 'specs', label: 'Specifications', icon: 'format-list-bulleted' },
                  { key: 'diagram', label: 'Pin Diagram', icon: 'image-outline' },
                  { key: 'uses', label: 'Use Cases', icon: 'lightbulb-outline' },
                  { key: 'compatible', label: 'Compatible', icon: 'puzzle-outline' },
                ].map((tab) => (
                  <TouchableOpacity
                    key={tab.key}
                    style={[
                      styles.tab,
                      selectedTab === tab.key && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
                    ]}
                    onPress={() => handleTabChange(tab.key as TabType)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name={tab.icon as any}
                      size={20}
                      color={selectedTab === tab.key ? theme.primary : theme.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        typography.label,
                        { color: selectedTab === tab.key ? theme.primary : theme.textSecondary },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </SlideUp>

          {/* Tab Content */}
          <FadeIn key={selectedTab}>
            {renderTabContent()}
          </FadeIn>

          {/* Recommendations */}
          <SlideUp delay={400}>
            <View style={styles.recommendationsSection}>
              <Text style={[typography.h3, { color: theme.text, marginBottom: semanticSpacing.marginMd }]}>
                Frequently Bought Together
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[1, 2, 3].map((item) => (
                  <Card key={item} style={styles.recommendationCard}>
                    <Image
                      source={require('../../../assets/icon.png')}
                      style={styles.recommendationImage}
                    />
                    <Text style={[typography.caption, { color: theme.text, marginTop: 8 }]} numberOfLines={2}>
                      Component Name
                    </Text>
                    <Text style={[typography.labelSmall, { color: theme.primary, marginTop: 4 }]}>
                      ₹299
                    </Text>
                  </Card>
                ))}
              </ScrollView>
            </View>
          </SlideUp>
        </View>
      </Animated.ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="minus" size={20} color={theme.text} />
          </TouchableOpacity>
          <Text style={[typography.h4, { color: theme.text, marginHorizontal: semanticSpacing.marginLg }]}>
            {quantity}
          </Text>
          <TouchableOpacity
            style={[styles.quantityButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => handleQuantityChange(1)}
            disabled={quantity >= product.stock}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="plus" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        <Button
          title={cartQuantity > 0 ? `Update Cart (${cartQuantity})` : 'Add to Cart'}
          onPress={handleAddToCart}
          variant="primary"
          loading={isAddingToCart}
          style={styles.addToCartButton}
          icon={<MaterialCommunityIcons name="cart" size={20} color={theme.textInverse} />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenPaddingX,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  floatingActions: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenPaddingX,
    zIndex: 20,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingButtonsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  galleryContainer: {
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    pointerEvents: 'none',
  },
  imageGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    pointerEvents: 'none',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  productHeader: {
    padding: semanticSpacing.screenPaddingX,
  },
  productTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: semanticSpacing.marginMd,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: semanticSpacing.marginMd,
  },
  stockIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: semanticSpacing.marginMd,
  },
  priceContainer: {
    marginBottom: semanticSpacing.marginMd,
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    marginTop: semanticSpacing.marginLg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.paddingLg,
    paddingVertical: semanticSpacing.paddingMd,
  },
  tabContent: {
    padding: semanticSpacing.screenPaddingX,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: semanticSpacing.paddingMd,
    borderBottomWidth: 1,
  },
  diagramImage: {
    width: '100%',
    height: 300,
  },
  useCaseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: semanticSpacing.marginMd,
  },
  compatibleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: semanticSpacing.paddingMd,
    borderRadius: semanticSpacing.radiusMd,
    marginBottom: semanticSpacing.marginMd,
  },
  compatibleInfo: {
    flex: 1,
  },
  addCompatibleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationsSection: {
    padding: semanticSpacing.screenPaddingX,
    marginTop: semanticSpacing.marginXl,
  },
  recommendationCard: {
    width: 120,
    marginRight: semanticSpacing.marginMd,
    padding: semanticSpacing.paddingSm,
  },
  recommendationImage: {
    width: '100%',
    height: 100,
    borderRadius: semanticSpacing.radiusMd,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: semanticSpacing.paddingMd,
    borderTopWidth: 1,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: semanticSpacing.marginMd,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButton: {
    flex: 1,
  },
});
