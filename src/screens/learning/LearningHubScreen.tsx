/**
 * Learning Hub Screen
 * Educational content and tutorials
 * Design Reference: YouTube, Udemy - card-based learning
 * Best practice: Category filters, difficulty badges, bookmarks
 * Industry-grade UX: Beautiful cards, search, progress tracking
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LearningStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { EmptyState } from '../../components/common';
import { FadeIn, SkeletonLoader } from '../../components/animations';
import { hapticFeedback } from '../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - semanticSpacing.screenPaddingX * 2;

type NavigationProp = NativeStackNavigationProp<LearningStackParamList, 'LearningHub'>;

type Category = 'all' | 'arduino' | 'raspberry-pi' | 'esp32' | 'sensors' | 'iot-projects';
type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: Exclude<Category, 'all'>;
  difficulty: Difficulty;
  thumbnail: string;
  duration: string;
  views: number;
  isBookmarked: boolean;
  componentsNeeded: string[];
}

const CATEGORIES = [
  { id: 'all' as Category, label: 'All', icon: 'view-grid' },
  { id: 'arduino' as Category, label: 'Arduino', icon: 'chip' },
  { id: 'raspberry-pi' as Category, label: 'Raspberry Pi', icon: 'raspberry-pi' },
  { id: 'esp32' as Category, label: 'ESP32', icon: 'wifi' },
  { id: 'sensors' as Category, label: 'Sensors', icon: 'radar' },
  { id: 'iot-projects' as Category, label: 'IoT Projects', icon: 'home-automation' },
];

const DIFFICULTY_CONFIG = {
  beginner: { color: '#4CAF50', label: 'Beginner' },
  intermediate: { color: '#FF9800', label: 'Intermediate' },
  advanced: { color: '#F44336', label: 'Advanced' },
};

// Mock tutorials
const MOCK_TUTORIALS: Tutorial[] = [
  {
    id: '1',
    title: 'Getting Started with Arduino Uno',
    description: 'Learn the basics of Arduino programming and build your first LED blink project',
    category: 'arduino',
    difficulty: 'beginner',
    thumbnail: 'https://via.placeholder.com/400x200',
    duration: '15 min',
    views: 12500,
    isBookmarked: false,
    componentsNeeded: ['Arduino Uno', 'LED', 'Resistor 220Ω'],
  },
  {
    id: '2',
    title: 'ESP32 WiFi Web Server',
    description: 'Create a web server with ESP32 to control devices over WiFi',
    category: 'esp32',
    difficulty: 'intermediate',
    thumbnail: 'https://via.placeholder.com/400x200',
    duration: '25 min',
    views: 8900,
    isBookmarked: true,
    componentsNeeded: ['ESP32 DevKit', 'LED', 'Breadboard'],
  },
  {
    id: '3',
    title: 'DHT22 Temperature & Humidity Sensor',
    description: 'Read temperature and humidity data using DHT22 sensor with Arduino',
    category: 'sensors',
    difficulty: 'beginner',
    thumbnail: 'https://via.placeholder.com/400x200',
    duration: '12 min',
    views: 15200,
    isBookmarked: false,
    componentsNeeded: ['Arduino Uno', 'DHT22 Sensor', 'Jumper Wires'],
  },
  {
    id: '4',
    title: 'Smart Home Automation System',
    description: 'Build a complete IoT-based home automation system with voice control',
    category: 'iot-projects',
    difficulty: 'advanced',
    thumbnail: 'https://via.placeholder.com/400x200',
    duration: '45 min',
    views: 22100,
    isBookmarked: true,
    componentsNeeded: ['ESP32', 'Relay Module', 'DHT22', 'PIR Sensor'],
  },
  {
    id: '5',
    title: 'Raspberry Pi Media Center',
    description: 'Set up a complete media center using Raspberry Pi and Kodi',
    category: 'raspberry-pi',
    difficulty: 'intermediate',
    thumbnail: 'https://via.placeholder.com/400x200',
    duration: '30 min',
    views: 18700,
    isBookmarked: false,
    componentsNeeded: ['Raspberry Pi 4', 'MicroSD Card', 'HDMI Cable'],
  },
];

export const LearningHubScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [tutorials, setTutorials] = useState<Tutorial[]>(MOCK_TUTORIALS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCategoryChange = (category: Category) => {
    hapticFeedback.light();
    setSelectedCategory(category);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    hapticFeedback.light();
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsRefreshing(false);
  };

  const handleTutorialPress = (tutorialId: string) => {
    hapticFeedback.light();
    navigation.navigate('TutorialDetail', { tutorialId });
  };

  const handleBookmarkToggle = (tutorialId: string) => {
    hapticFeedback.light();
    setTutorials(prev =>
      prev.map(tutorial =>
        tutorial.id === tutorialId
          ? { ...tutorial, isBookmarked: !tutorial.isBookmarked }
          : tutorial
      )
    );
  };

  const handleSearch = () => {
    hapticFeedback.light();
    // Open search
  };

  const filteredTutorials = selectedCategory === 'all'
    ? tutorials
    : tutorials.filter(t => t.category === selectedCategory);

  const formatViews = (views: number): string => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const renderCategoryTab = ({ item, index }: { item: typeof CATEGORIES[0]; index: number }) => {
    const isSelected = selectedCategory === item.id;

    return (
      <Animated.View entering={FadeInDown.delay(index * 50)}>
        <TouchableOpacity
          style={[
            styles.categoryTab,
            {
              backgroundColor: isSelected ? theme.primary : theme.backgroundSecondary,
              borderColor: isSelected ? theme.primary : 'transparent',
            },
          ]}
          onPress={() => handleCategoryChange(item.id)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={item.icon as any}
            size={20}
            color={isSelected ? theme.textInverse : theme.textSecondary}
          />
          <Text
            style={[
              typography.label,
              {
                color: isSelected ? theme.textInverse : theme.text,
                marginLeft: 6,
              },
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTutorialCard = ({ item, index }: { item: Tutorial; index: number }) => {
    const difficultyConfig = DIFFICULTY_CONFIG[item.difficulty];

    return (
      <Animated.View entering={FadeInDown.delay(index * 100)}>
        <TouchableOpacity
          style={[styles.tutorialCard, { backgroundColor: theme.surface }]}
          onPress={() => handleTutorialPress(item.id)}
          activeOpacity={0.7}
        >
          {/* Thumbnail */}
          <View style={styles.thumbnailContainer}>
            <View style={[styles.thumbnail, { backgroundColor: theme.backgroundSecondary }]}>
              <MaterialCommunityIcons name="play-circle" size={64} color={theme.textSecondary} />
            </View>
            
            {/* Duration Badge */}
            <View style={[styles.durationBadge, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
              <MaterialCommunityIcons name="clock-outline" size={14} color="#fff" />
              <Text style={[typography.caption, { color: '#fff', marginLeft: 4 }]}>
                {item.duration}
              </Text>
            </View>

            {/* Bookmark Button */}
            <TouchableOpacity
              style={[styles.bookmarkButton, { backgroundColor: 'rgba(0,0,0,0.7)' }]}
              onPress={() => handleBookmarkToggle(item.id)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={item.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={item.isBookmarked ? theme.warning : '#fff'}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.cardContent}>
            {/* Title & Difficulty */}
            <View style={styles.cardHeader}>
              <Text style={[typography.h4, { color: theme.text, flex: 1 }]} numberOfLines={2}>
                {item.title}
              </Text>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: difficultyConfig.color + '20' },
                ]}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: difficultyConfig.color, fontSize: 10, fontWeight: '600' },
                  ]}
                >
                  {difficultyConfig.label}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text
              style={[typography.body, { color: theme.textSecondary, marginTop: 8 }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>

            {/* Components Needed */}
            <View style={styles.componentsRow}>
              <MaterialCommunityIcons name="cube-outline" size={16} color={theme.textSecondary} />
              <Text
                style={[typography.caption, { color: theme.textSecondary, marginLeft: 6, flex: 1 }]}
                numberOfLines={1}
              >
                {item.componentsNeeded.join(', ')}
              </Text>
            </View>

            {/* Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.viewsContainer}>
                <MaterialCommunityIcons name="eye-outline" size={16} color={theme.textSecondary} />
                <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 4 }]}>
                  {formatViews(item.views)} views
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: theme.primaryLight }]}
                onPress={() => handleTutorialPress(item.id)}
                activeOpacity={0.7}
              >
                <Text style={[typography.label, { color: theme.primary }]}>
                  Start Learning
                </Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <EmptyState
        icon="book-open-variant"
        title="No Tutorials Found"
        description="Try selecting a different category"
        actionLabel="View All"
        onAction={() => setSelectedCategory('all')}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[typography.h2, { color: theme.text }]}>
          Learning Hub
        </Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="magnify" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <FadeIn delay={50}>
        <FlatList
          horizontal
          data={CATEGORIES}
          renderItem={renderCategoryTab}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryList}
          showsHorizontalScrollIndicator={false}
          style={[styles.categoryContainer, { backgroundColor: theme.background }]}
        />
      </FadeIn>

      {/* Tutorials List */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((_, index) => (
            <View key={index} style={[styles.tutorialCard, { backgroundColor: theme.surface }]}>
              <SkeletonLoader width="100%" height={200} style={{ marginBottom: 12 }} />
              <SkeletonLoader width="80%" height={20} style={{ marginBottom: 8 }} />
              <SkeletonLoader width="100%" height={40} />
            </View>
          ))}
        </View>
      ) : filteredTutorials.length === 0 ? (
        renderEmpty()
      ) : (
        <FlatList
          data={filteredTutorials}
          renderItem={renderTutorialCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
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
    justifyContent: 'space-between',
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingVertical: semanticSpacing.paddingMd,
    borderBottomWidth: 1,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryContainer: {
    maxHeight: 60,
  },
  categoryList: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingVertical: semanticSpacing.paddingMd,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: semanticSpacing.radiusLg,
    borderWidth: 1,
    marginRight: 8,
  },
  listContent: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingTop: semanticSpacing.paddingMd,
    paddingBottom: semanticSpacing.paddingXl,
  },
  tutorialCard: {
    borderRadius: semanticSpacing.radiusLg,
    marginBottom: semanticSpacing.marginMd,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    height: 200,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: semanticSpacing.radiusSm,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: semanticSpacing.paddingMd,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: semanticSpacing.radiusSm,
    marginLeft: 8,
  },
  componentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: semanticSpacing.radiusMd,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenPaddingX,
  },
  skeletonContainer: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingTop: semanticSpacing.paddingMd,
  },
});
