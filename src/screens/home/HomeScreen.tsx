/**
 * Home Screen - IoT Marketplace
 * Production-ready home screen with real data from API
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { Card, Badge } from '../../components/common';
import { useProductStore, useCartStore, useAuthStore } from '../../stores';
import { hapticFeedback } from '../../utils/haptics';
import { productsService } from '../../services/api/products';
import { 
  screenWidth, 
  getCardWidth, 
  getBannerHeight, 
  getResponsivePadding,
  getResponsiveMargin,
  getGridColumns,
  moderateScale,
} from '../../utils/responsive';

const PADDING = getResponsivePadding();
const MARGIN = getResponsiveMargin();
const BANNER_HEIGHT = getBannerHeight();
const GRID_COLUMNS = getGridColumns(160);
const CARD_WIDTH = getCardWidth(GRID_COLUMNS, PADDING);

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { getItemCount } = useCartStore();

  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<FlatList>(null);

  // Auto-scroll banners
  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      const nextIndex = (currentBannerIndex + 1) % banners.length;
      setCurrentBannerIndex(nextIndex);
      bannerScrollRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 5000);
    return () => clearInterval(interval);
  }, [currentBannerIndex, banners.length]);

  // Load data on mount and screen focus
  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [])
  );

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productsService.getProducts({ limit: 12, page: 1 }),
        productsService.getCategories(),
      ]);

      setProducts(productsRes.products);
      setCategories(categoriesRes);

      // Create banners from categories
      const categoryBanners = categoriesRes.slice(0, 3).map((cat, idx) => ({
        id: cat.id,
        title: cat.name,
        subtitle: cat.description,
        image: cat.image_url,
      }));
      setBanners(categoryBanners.length > 0 ? categoryBanners : getDefaultBanners());
    } catch (error) {
      console.error('Error loading home data:', error);
      setBanners(getDefaultBanners());
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const getDefaultBanners = () => [
    { id: '1', title: 'Student Discount', subtitle: 'Flat 20% off for verified students' },
    { id: '2', title: 'New Arrivals', subtitle: 'Latest IoT components in stock' },
    { id: '3', title: 'Bundle Deals', subtitle: 'Save up to 40% on starter kits' },
  ];

  const handleSearch = () => {
    hapticFeedback.light();
    navigation.navigate('Search');
  };

  const handleCategoryPress = (categoryId: string) => {
    hapticFeedback.light();
    navigation.navigate('Catalog', { categoryId });
  };

  const handleProductPress = (productId: string) => {
    hapticFeedback.light();
    navigation.navigate('ProductDetail', { productId });
  };

  const renderPromoBanner = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => handleCategoryPress(item.id)}
      style={[styles.bannerItem, { width: screenWidth - PADDING * 2 }]}
    >
      {item.image && (
        <Image 
          source={{ uri: item.image }} 
          style={styles.bannerBackgroundImage}
          defaultSource={require('../../../assets/icon.png')}
        />
      )}
      <LinearGradient
        colors={['rgba(37, 99, 235, 0.75)', 'rgba(29, 78, 216, 0.75)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerOverlay}
      >
        <View style={styles.bannerTextContent}>
          <Text style={[typography.h2, { color: '#FFF', marginBottom: 8, fontSize: moderateScale(24) }]}>
            {item.title}
          </Text>
          <Text style={[typography.body, { color: 'rgba(255, 255, 255, 0.95)', fontSize: moderateScale(14) }]}>
            {item.subtitle}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: any) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.categoryImageContainer, { backgroundColor: theme.backgroundTertiary }]}>
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.categoryImage}
            defaultSource={require('../../../assets/icon.png')}
          />
        ) : (
          <MaterialCommunityIcons 
            name="package-variant-closed" 
            size={moderateScale(32)} 
            color={theme.primary} 
          />
        )}
      </View>
      <Text 
        style={[typography.caption, { color: theme.text, marginTop: 6, textAlign: 'center', fontSize: moderateScale(12) }]} 
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProductCard = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.productCard, { width: CARD_WIDTH, marginRight: MARGIN }]}
      onPress={() => handleProductPress(item._id || item.id)}
      activeOpacity={0.9}
    >
      <Card style={styles.productCardInner}>
        <View style={styles.productImageContainer}>
          {item.images && item.images[0] ? (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.productImage}
              defaultSource={require('../../../assets/icon.png')}
            />
          ) : (
            <View style={[styles.productImage, { backgroundColor: theme.backgroundTertiary, justifyContent: 'center', alignItems: 'center' }]}>
              <MaterialCommunityIcons name="package" size={moderateScale(40)} color={theme.textSecondary} />
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text 
            style={[typography.h4, { color: theme.text, fontWeight: '600', fontSize: moderateScale(16) }]} 
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <View style={styles.productMeta}>
            <View style={[styles.ratingContainer, { backgroundColor: theme.success }]}>
              <MaterialCommunityIcons name="star" size={moderateScale(12)} color="#FFF" />
              <Text 
                style={[typography.caption, { color: '#FFF', marginLeft: 2, fontWeight: '600', fontSize: moderateScale(10) }]}
              >
                {item.rating || '4.5'}
              </Text>
            </View>
            <Text style={[typography.caption, { color: theme.textSecondary, fontSize: moderateScale(11) }]}>
              {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>
          <View style={styles.productFooter}>
            <View>
              <Text style={[typography.h3, { color: theme.primary, fontWeight: '700', fontSize: moderateScale(18) }]}>
                ₹{item.price}
              </Text>
              {user?.isStudentVerified && item.student_price && (
                <Text style={[typography.caption, { color: theme.success, fontWeight: '600', fontSize: moderateScale(11) }]}>
                  ₹{item.student_price} (Student)
                </Text>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && products.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.surface} 
      />
      
      <SafeAreaView edges={['top']} style={[styles.headerContainer, { backgroundColor: theme.surface }]}>
        <View style={styles.header}>
          <View style={styles.locationButton}>
            <MaterialCommunityIcons name="map-marker" size={moderateScale(20)} color={theme.primary} />
            <Text style={[typography.h4, { color: theme.text, fontWeight: '600', marginLeft: 6, fontSize: moderateScale(18) }]}>
              Delivery Location
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            {user?.isStudentVerified && (
              <Badge label="Student" variant="success" size="small" style={{ marginRight: 8 }} />
            )}
            <TouchableOpacity 
              onPress={() => navigation.navigate('Cart')} 
              activeOpacity={0.7}
              style={styles.cartButton}
            >
              <MaterialCommunityIcons name="cart-outline" size={moderateScale(24)} color={theme.text} />
              {getItemCount() > 0 && (
                <View style={[styles.cartBadge, { backgroundColor: theme.error }]}>
                  <Text style={[typography.caption, { color: '#FFF', fontSize: moderateScale(9), fontWeight: '700' }]}>
                    {getItemCount()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: theme.backgroundTertiary, borderColor: theme.border }]}
          onPress={handleSearch}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="magnify" size={moderateScale(20)} color={theme.textSecondary} />
          <Text style={[typography.body, { color: theme.textTertiary, marginLeft: 10, flex: 1, fontSize: moderateScale(15) }]}>
            Search products...
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
        }
      >
        {banners.length > 0 && (
          <View style={styles.bannersSection}>
            <FlatList
              ref={bannerScrollRef}
              data={banners}
              renderItem={renderPromoBanner}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              snapToInterval={screenWidth - PADDING * 2 + MARGIN}
              decelerationRate="fast"
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: PADDING }}
            />
            <View style={styles.bannerDots}>
              {banners.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: idx === currentBannerIndex ? theme.primary : theme.border,
                      width: idx === currentBannerIndex ? 24 : 8,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {categories.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[typography.h3, { color: theme.text, fontWeight: '700', fontSize: moderateScale(18) }]}>
                Browse Categories
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Catalog')}>
                <Text style={[typography.body, { color: theme.primary, fontSize: moderateScale(14), fontWeight: '600' }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories.slice(0, 6)}
              renderItem={renderCategory}
              keyExtractor={(item) => item._id || item.id}
              numColumns={3}
              scrollEnabled={false}
              columnWrapperStyle={styles.categoryRow}
            />
          </View>
        )}

        {products.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[typography.h3, { color: theme.text, fontWeight: '700', fontSize: moderateScale(18) }]}>
                Featured Products
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Catalog')}>
                <Text style={[typography.body, { color: theme.primary, fontSize: moderateScale(14), fontWeight: '600' }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={products}
              renderItem={renderProductCard}
              keyExtractor={(item) => item._id || item.id}
              horizontal
              scrollEnabled={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: PADDING }}
            />
          </View>
        )}

        <View style={{ height: PADDING * 2 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: PADDING,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PADDING,
    paddingTop: 8,
    paddingBottom: PADDING,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: PADDING,
    borderWidth: 1,
    height: 44,
  },
  bannersSection: {
    marginVertical: PADDING,
  },
  bannerItem: {
    height: BANNER_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  bannerBackgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  bannerTextContent: {
    paddingBottom: 8,
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  sectionContainer: {
    paddingHorizontal: PADDING,
    marginVertical: PADDING,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryItem: {
    width: '31%',
    alignItems: 'center',
  },
  categoryImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  productCard: {
    marginRight: 0,
  },
  productCardInner: {
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
    gap: 8,
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
});
