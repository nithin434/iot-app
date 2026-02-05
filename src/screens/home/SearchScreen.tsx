/**
 * Search Screen
 * Modern search experience with real-time suggestions and smart filtering
 * Best practice: Make search fast, intuitive, and delightful
 * Industry-grade UX: Instant feedback, smart suggestions, smooth animations
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Keyboard,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HomeStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Card, Badge, EmptyState, LoadingSpinner } from '../../components/common';
import { FadeIn, SlideUp, SkeletonLoader } from '../../components/animations';
import { useProductStore } from '../../stores';
import { storageService, STORAGE_KEYS } from '../../services/storage';
import { hapticFeedback } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Search'>;

const TRENDING_SEARCHES = [
  'Arduino Uno',
  'ESP32',
  'Raspberry Pi',
  'Ultrasonic Sensor',
  'Servo Motor',
  'OLED Display',
];

const POPULAR_CATEGORIES = [
  { id: '1', name: 'Microcontrollers', icon: 'chip' },
  { id: '2', name: 'Sensors', icon: 'radar' },
  { id: '3', name: 'Motors', icon: 'engine' },
  { id: '4', name: 'Displays', icon: 'monitor' },
];

export const SearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { searchProducts, products, isLoading } = useProductStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchInputRef = useRef<TextInput>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Auto-focus search input
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    loadRecentSearches();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      handleSearchDebounce(searchQuery);
    } else {
      setSuggestions([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  const loadRecentSearches = async () => {
    const recent = await storageService.getItem<string[]>(STORAGE_KEYS.SEARCH_HISTORY);
    if (recent) {
      setRecentSearches(recent.slice(0, 5));
    }
  };

  const saveSearchToHistory = async (query: string) => {
    const recent = await storageService.getItem<string[]>(STORAGE_KEYS.SEARCH_HISTORY) || [];
    const updated = [query, ...recent.filter(item => item !== query)].slice(0, 10);
    await storageService.setItem(STORAGE_KEYS.SEARCH_HISTORY, updated);
    setRecentSearches(updated.slice(0, 5));
  };

  const handleSearchDebounce = (query: string) => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      handleSearch(query);
    }, 300);
  };

  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) return;

    setIsSearching(true);
    try {
      await searchProducts(query);
      setShowResults(true);
      
      // Generate suggestions (mock - replace with API)
      const mockSuggestions = TRENDING_SEARCHES
        .filter(item => item.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = async () => {
    if (searchQuery.trim().length === 0) return;
    
    hapticFeedback.light();
    Keyboard.dismiss();
    await saveSearchToHistory(searchQuery);
    await handleSearch(searchQuery);
  };

  const handleSuggestionPress = (suggestion: string) => {
    hapticFeedback.light();
    setSearchQuery(suggestion);
    handleSearchSubmit();
  };

  const handleRecentSearchPress = (query: string) => {
    hapticFeedback.light();
    setSearchQuery(query);
    handleSearch(query);
  };

  const handleClearSearch = () => {
    hapticFeedback.light();
    setSearchQuery('');
    setSuggestions([]);
    setShowResults(false);
    searchInputRef.current?.focus();
  };

  const handleClearRecentSearches = async () => {
    hapticFeedback.light();
    await storageService.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    setRecentSearches([]);
  };

  const handleProductPress = (productId: string) => {
    hapticFeedback.light();
    navigation.navigate('ProductDetail', { productId });
  };

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
  };

  const renderSearchBar = () => (
    <View style={[styles.searchBarContainer, { backgroundColor: theme.surface }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleClose}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
      </TouchableOpacity>

      <View style={[styles.searchInputContainer, { backgroundColor: theme.backgroundSecondary }]}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={theme.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          ref={searchInputRef}
          style={[styles.searchInput, typography.body, { color: theme.text }]}
          placeholder="Search for components..."
          placeholderTextColor={theme.inputPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearSearch}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={20}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSuggestion = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={theme.textSecondary}
        style={styles.suggestionIcon}
      />
      <Text style={[typography.body, { color: theme.text, flex: 1 }]}>
        {item}
      </Text>
      <MaterialCommunityIcons
        name="arrow-top-left"
        size={18}
        color={theme.textTertiary}
      />
    </TouchableOpacity>
  );

  const renderRecentSearch = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.recentItem}
      onPress={() => handleRecentSearchPress(item)}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name="history"
        size={20}
        color={theme.textSecondary}
        style={styles.recentIcon}
      />
      <Text style={[typography.body, { color: theme.text, flex: 1 }]}>
        {item}
      </Text>
      <MaterialCommunityIcons
        name="arrow-top-left"
        size={18}
        color={theme.textTertiary}
      />
    </TouchableOpacity>
  );

  const renderTrendingChip = (item: string) => (
    <TouchableOpacity
      key={item}
      style={[styles.trendingChip, { backgroundColor: theme.primaryLight }]}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name="trending-up"
        size={16}
        color={theme.primary}
        style={{ marginRight: 4 }}
      />
      <Text style={[typography.labelSmall, { color: theme.primary }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryChip = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.categoryChip, { backgroundColor: theme.surface }]}
      onPress={() => {
        hapticFeedback.light();
        setSearchQuery(item.name);
      }}
      activeOpacity={0.7}
    >
      <MaterialCommunityIcons
        name={item.icon as any}
        size={20}
        color={theme.primary}
        style={{ marginRight: 6 }}
      />
      <Text style={[typography.labelSmall, { color: theme.text }]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productItem}
      onPress={() => handleProductPress(item.id)}
      activeOpacity={0.9}
    >
      <Image
        source={item.images?.[0] || require('../../../assets/icon.png')}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={[typography.bodySmall, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.productMeta}>
          <Text style={[typography.h4, { color: theme.primary }]}>
            ₹{item.price}
          </Text>
          {item.difficulty && (
            <Badge label={item.difficulty} variant="neutral" size="small" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyContent = () => {
    if (showResults && products.length === 0 && !isSearching) {
      return (
        <FadeIn>
          <EmptyState
            icon={<MaterialCommunityIcons name="magnify" size={64} color={theme.textTertiary} />}
            title="No Results Found"
            description={`We couldn't find any products matching "${searchQuery}"`}
            actionLabel="Clear Search"
            onAction={handleClearSearch}
          />
        </FadeIn>
      );
    }

    return (
      <View style={styles.emptyContent}>
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <SlideUp delay={100}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[typography.h4, { color: theme.text }]}>
                  Recent Searches
                </Text>
                <TouchableOpacity onPress={handleClearRecentSearches} activeOpacity={0.7}>
                  <Text style={[typography.labelSmall, { color: theme.primary }]}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={recentSearches}
                renderItem={renderRecentSearch}
                keyExtractor={(item, index) => `recent-${index}`}
                scrollEnabled={false}
              />
            </View>
          </SlideUp>
        )}

        {/* Trending Searches */}
        <SlideUp delay={200}>
          <View style={styles.section}>
            <Text style={[typography.h4, styles.sectionTitle, { color: theme.text }]}>
              Trending Searches
            </Text>
            <View style={styles.chipsContainer}>
              {TRENDING_SEARCHES.map(renderTrendingChip)}
            </View>
          </View>
        </SlideUp>

        {/* Popular Categories */}
        <SlideUp delay={300}>
          <View style={styles.section}>
            <Text style={[typography.h4, styles.sectionTitle, { color: theme.text }]}>
              Popular Categories
            </Text>
            <View style={styles.chipsContainer}>
              {POPULAR_CATEGORIES.map(renderCategoryChip)}
            </View>
          </View>
        </SlideUp>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Search Bar */}
        {renderSearchBar()}

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && !showResults && (
          <FadeIn>
            <View style={[styles.suggestionsContainer, { backgroundColor: theme.surface }]}>
              <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item, index) => `suggestion-${index}`}
                scrollEnabled={false}
              />
            </View>
          </FadeIn>
        )}

        {/* Loading State */}
        {isSearching && (
          <View style={styles.loadingContainer}>
            <LoadingSpinner text="Searching..." />
          </View>
        )}

        {/* Search Results */}
        {showResults && !isSearching && products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.resultsContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: theme.border }} />}
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {renderEmptyContent()}
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.paddingMd,
    paddingVertical: semanticSpacing.paddingMd,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    marginRight: semanticSpacing.marginSm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: semanticSpacing.radiusMd,
    paddingHorizontal: semanticSpacing.paddingMd,
  },
  searchIcon: {
    marginRight: semanticSpacing.marginSm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: semanticSpacing.marginSm,
  },
  suggestionsContainer: {
    marginHorizontal: semanticSpacing.screenPaddingX,
    marginTop: semanticSpacing.marginSm,
    borderRadius: semanticSpacing.radiusLg,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: semanticSpacing.paddingMd,
    paddingHorizontal: semanticSpacing.paddingMd,
  },
  suggestionIcon: {
    marginRight: semanticSpacing.marginMd,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  emptyContent: {
    paddingTop: semanticSpacing.paddingLg,
  },
  section: {
    marginBottom: semanticSpacing.marginXl,
    paddingHorizontal: semanticSpacing.screenPaddingX,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: semanticSpacing.marginMd,
  },
  sectionTitle: {
    marginBottom: semanticSpacing.marginMd,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: semanticSpacing.paddingMd,
  },
  recentIcon: {
    marginRight: semanticSpacing.marginMd,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.paddingMd,
    paddingVertical: semanticSpacing.paddingSm,
    borderRadius: semanticSpacing.radiusFull,
    margin: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.paddingMd,
    paddingVertical: semanticSpacing.paddingSm,
    borderRadius: semanticSpacing.radiusFull,
    margin: 4,
  },
  resultsContainer: {
    paddingTop: semanticSpacing.paddingMd,
  },
  productItem: {
    flexDirection: 'row',
    padding: semanticSpacing.paddingMd,
    backgroundColor: 'transparent',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: semanticSpacing.radiusMd,
    marginRight: semanticSpacing.marginMd,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: semanticSpacing.marginSm,
  },
});
