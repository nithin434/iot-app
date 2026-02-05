/**
 * Catalog Screen - IoT Marketplace
 * Browse all products with filters and sorting
 * Production-ready with real API integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CatalogStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { Card, Badge, EmptyState } from '../../components/common';
import { useCartStore, useAuthStore } from '../../stores';
import { hapticFeedback } from '../../utils/haptics';
import { productsService } from '../../services/api/products';
import { moderateScale, screenWidth, getResponsivePadding, getResponsiveMargin } from '../../utils/responsive';

const PADDING = getResponsivePadding();
const MARGIN = getResponsiveMargin();
const CARD_WIDTH = (screenWidth - PADDING * 2 - MARGIN) / 2;

type NavigationProp = NativeStackNavigationProp<CatalogStackParamList, 'Catalog'>;

interface FilterState {
  selectedCategory: string;
  selectedDifficulty: string[];
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  sortBy: 'price' | 'popularity' | 'newest';
  sortOrder: 'asc' | 'desc';
}

export const CatalogScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    selectedCategory: 'all',
    selectedDifficulty: [],
    minPrice: 0,
    maxPrice: 50000,
    inStock: false,
    sortBy: 'popularity',
    sortOrder: 'desc',
  });

  // Load categories and products
  useFocusEffect(
    useCallback(() => {
      loadCategories();
      loadProducts(1, true);
    }, [])
  );

  const loadCategories = async () => {
    try {
      const cats = await productsService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const response = await productsService.getProducts({
        page: pageNum,
        limit: 20,
        categoryId: filters.selectedCategory !== 'all' ? filters.selectedCategory : undefined,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        difficulty: filters.selectedDifficulty.length > 0 ? filters.selectedDifficulty : undefined,
        inStock: filters.inStock || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (reset) {
        setProducts(response.products);
      } else {
        setProducts([...products, ...response.products]);
      }

      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProducts(1, true);
  };

  const handleLoadMore = async () => {
    if (hasMore && !isLoadingMore && !isLoading) {
      await loadProducts(page + 1, false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    hapticFeedback.light();
    setFilters({ ...filters, selectedCategory: categoryId });
    setPage(1);
  };

  const handleDifficultyToggle = (difficulty: string) => {
    hapticFeedback.light();
    const newDifficulties = filters.selectedDifficulty.includes(difficulty)
      ? filters.selectedDifficulty.filter((d) => d !== difficulty)
      : [...filters.selectedDifficulty, difficulty];
    setFilters({ ...filters, selectedDifficulty: newDifficulties });
    setPage(1);
  };

  const handleSortChange = (sortBy: FilterState['sortBy']) => {
    hapticFeedback.light();
    setFilters({
      ...filters,
      sortBy,
      sortOrder: filters.sortBy === sortBy && filters.sortOrder === 'desc' ? 'asc' : 'desc',
    });
    setPage(1);
  };

  const handleApplyFilters = () => {
    hapticFeedback.light();
    loadProducts(1, true);
    setShowFilters(false);
  };

  const handleProductPress = (productId: string) => {
    hapticFeedback.light();
    navigation.navigate('ProductDetail', { productId });
  };

  const handleAddToCart = (product: any) => {
    hapticFeedback.medium();
    const price = user?.isStudentVerified && product.student_price ? product.student_price : product.price;
    addItem({
      productId: product._id || product.id,
      name: product.name,
      price,
      quantity: 1,
      image: product.images?.[0],
    });
  };

  const renderProductCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.productCard, { width: CARD_WIDTH, marginRight: MARGIN }]}
      onPress={() => handleProductPress(item._id || item.id)}
      activeOpacity={0.9}
    >
      <Card style={styles.cardInner}>
        <View style={styles.imageContainer}>
          {item.images && item.images[0] ? (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.image}
              defaultSource={require('../../../assets/icon.png')}
            />
          ) : (
            <View style={[styles.image, { backgroundColor: theme.backgroundTertiary, justifyContent: 'center', alignItems: 'center' }]}>
              <MaterialCommunityIcons name="package" size={moderateScale(40)} color={theme.textSecondary} />
            </View>
          )}
          <TouchableOpacity
            style={[styles.favoriteBtn, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
            onPress={(e) => {
              e.stopPropagation();
              hapticFeedback.light();
            }}
          >
            <MaterialCommunityIcons name="heart-outline" size={moderateScale(18)} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          <Text style={[typography.h4, { color: theme.text, fontWeight: '600', fontSize: moderateScale(15) }]} numberOfLines={2}>
            {item.name}
          </Text>

          <View style={styles.metaRow}>
            {item.difficulty && (
              <Badge
                label={item.difficulty}
                variant={item.difficulty === 'beginner' ? 'success' : item.difficulty === 'intermediate' ? 'warning' : 'error'}
                size="small"
              />
            )}
            {item.stock === 0 && (
              <Badge label="Out of Stock" variant="error" size="small" />
            )}
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={[typography.h3, { color: theme.primary, fontWeight: '700', fontSize: moderateScale(18) }]}>
                ₹{user?.isStudentVerified && item.student_price ? item.student_price : item.price}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.primary }]}
              onPress={(e) => {
                e.stopPropagation();
                handleAddToCart(item);
              }}
              disabled={item.stock === 0}
            >
              <MaterialCommunityIcons name="plus" size={moderateScale(18)} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderCategoryFilter = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryFilter,
        {
          backgroundColor: filters.selectedCategory === item.id ? theme.primary : theme.backgroundTertiary,
        },
      ]}
      onPress={() => handleCategorySelect(item.id)}
      activeOpacity={0.8}
    >
      <Text
        style={[
          typography.body,
          {
            color: filters.selectedCategory === item.id ? '#FFF' : theme.text,
            fontWeight: '600',
            fontSize: moderateScale(14),
          },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={moderateScale(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[typography.h3, { color: theme.text, fontWeight: '700', fontSize: moderateScale(18), flex: 1, marginLeft: 12 }]}>
            Products
          </Text>
          <TouchableOpacity onPress={() => setShowFilters(true)}>
            <MaterialCommunityIcons name="tune" size={moderateScale(24)} color={theme.text} />
          </TouchableOpacity>
        </View>

        {categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={{ paddingHorizontal: PADDING }}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat._id || cat.id}
                style={[
                  styles.categoryFilter,
                  {
                    backgroundColor: filters.selectedCategory === (cat._id || cat.id) ? theme.primary : theme.backgroundTertiary,
                    marginRight: MARGIN,
                  },
                ]}
                onPress={() => handleCategorySelect(cat._id || cat.id)}
              >
                <Text
                  style={[
                    typography.body,
                    {
                      color: filters.selectedCategory === (cat._id || cat.id) ? '#FFF' : theme.text,
                      fontWeight: '600',
                      fontSize: moderateScale(13),
                    },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>

      {products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description="Try adjusting your filters or search criteria"
          onRetry={handleRefresh}
        />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item._id || item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            ) : null
          }
        />
      )}

      {showFilters && (
        <View style={[styles.filterModal, { backgroundColor: theme.surface }]}>
          <View style={[styles.filterHeader, { borderBottomColor: theme.border }]}>
            <Text style={[typography.h3, { color: theme.text, fontWeight: '700', fontSize: moderateScale(18) }]}>
              Filters
            </Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <MaterialCommunityIcons name="close" size={moderateScale(24)} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <View style={styles.filterSection}>
              <Text style={[typography.h4, { color: theme.text, fontWeight: '600', fontSize: moderateScale(16), marginBottom: 12 }]}>
                Difficulty Level
              </Text>
              {['beginner', 'intermediate', 'advanced'].map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={styles.filterOption}
                  onPress={() => handleDifficultyToggle(difficulty)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: filters.selectedDifficulty.includes(difficulty) ? theme.primary : theme.backgroundTertiary,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    {filters.selectedDifficulty.includes(difficulty) && (
                      <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                    )}
                  </View>
                  <Text style={[typography.body, { color: theme.text, marginLeft: 12, fontSize: moderateScale(14), textTransform: 'capitalize' }]}>
                    {difficulty}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterSection}>
              <Text style={[typography.h4, { color: theme.text, fontWeight: '600', fontSize: moderateScale(16), marginBottom: 12 }]}>
                Sort By
              </Text>
              {(['popularity', 'price', 'newest'] as const).map((sort) => (
                <TouchableOpacity
                  key={sort}
                  style={styles.filterOption}
                  onPress={() => handleSortChange(sort)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: filters.sortBy === sort ? theme.primary : theme.backgroundTertiary,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    {filters.sortBy === sort && (
                      <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                    )}
                  </View>
                  <Text style={[typography.body, { color: theme.text, marginLeft: 12, fontSize: moderateScale(14), textTransform: 'capitalize' }]}>
                    {sort}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={[styles.filterFooter, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.filterBtn, { backgroundColor: theme.backgroundTertiary }]}
              onPress={() => {
                setFilters({
                  selectedCategory: 'all',
                  selectedDifficulty: [],
                  minPrice: 0,
                  maxPrice: 50000,
                  inStock: false,
                  sortBy: 'popularity',
                  sortOrder: 'desc',
                });
              }}
            >
              <Text style={[typography.body, { color: theme.text, fontWeight: '600', fontSize: moderateScale(14) }]}>
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterBtn, { backgroundColor: theme.primary }]}
              onPress={handleApplyFilters}
            >
              <Text style={[typography.body, { color: '#FFF', fontWeight: '600', fontSize: moderateScale(14) }]}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    alignItems: 'center',
    paddingHorizontal: PADDING,
    paddingVertical: 12,
  },
  categoryScroll: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  categoryFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  grid: {
    paddingHorizontal: PADDING,
    paddingVertical: PADDING,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: MARGIN,
  },
  productCard: {
    marginRight: 0,
  },
  cardInner: {
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 12,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingFooter: {
    padding: PADDING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: PADDING,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  filterContent: {
    paddingHorizontal: PADDING,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterFooter: {
    flexDirection: 'row',
    gap: MARGIN,
    paddingHorizontal: PADDING,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
