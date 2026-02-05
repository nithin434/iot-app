/**
 * Projects List Screen
 * Browse IoT projects with component bundles
 * Best practice: Project-based shopping is the core USP
 * Industry-grade UX: Large cards, visual hierarchy, easy filtering
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProjectsStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Badge, EmptyState } from '../../components/common';
import { FadeIn, SkeletonLoader } from '../../components/animations';
import { hapticFeedback } from '../../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - semanticSpacing.screenPaddingX * 2;

type NavigationProp = NativeStackNavigationProp<ProjectsStackParamList, 'ProjectsList'>;

const DIFFICULTY_FILTERS = [
  { id: 'all', label: 'All Projects', icon: 'view-grid' },
  { id: 'beginner', label: 'Beginner', icon: 'star-outline', color: '#10B981' },
  { id: 'intermediate', label: 'Intermediate', icon: 'star-half-full', color: '#F59E0B' },
  { id: 'advanced', label: 'Advanced', icon: 'star', color: '#EF4444' },
];

// Mock projects data
const MOCK_PROJECTS = [
  {
    id: '1',
    name: 'Smart Home Automation System',
    description: 'Control lights, fans, and appliances using your smartphone',
    difficulty: 'Intermediate',
    estimatedCost: 2499,
    studentCost: 2199,
    componentsCount: 12,
    duration: '4-6 hours',
    image: 'https://via.placeholder.com/400x250',
    tags: ['IoT', 'Home Automation', 'ESP32'],
  },
  {
    id: '2',
    name: 'Line Following Robot',
    description: 'Build an autonomous robot that follows a black line',
    difficulty: 'Beginner',
    estimatedCost: 1299,
    studentCost: 1099,
    componentsCount: 8,
    duration: '2-3 hours',
    image: 'https://via.placeholder.com/400x250',
    tags: ['Robotics', 'Arduino', 'Motors'],
  },
  {
    id: '3',
    name: 'Weather Monitoring Station',
    description: 'Track temperature, humidity, and air quality in real-time',
    difficulty: 'Intermediate',
    estimatedCost: 1899,
    studentCost: 1699,
    componentsCount: 10,
    duration: '3-4 hours',
    image: 'https://via.placeholder.com/400x250',
    tags: ['IoT', 'Sensors', 'ESP8266'],
  },
  {
    id: '4',
    name: 'Gesture Controlled Robot',
    description: 'Control a robot using hand gestures with accelerometer',
    difficulty: 'Advanced',
    estimatedCost: 3299,
    studentCost: 2899,
    componentsCount: 15,
    duration: '6-8 hours',
    image: 'https://via.placeholder.com/400x250',
    tags: ['Robotics', 'Sensors', 'Wireless'],
  },
  {
    id: '5',
    name: 'Smart Plant Watering System',
    description: 'Automatically water plants based on soil moisture',
    difficulty: 'Beginner',
    estimatedCost: 899,
    studentCost: 799,
    componentsCount: 6,
    duration: '2 hours',
    image: 'https://via.placeholder.com/400x250',
    tags: ['IoT', 'Automation', 'Arduino'],
  },
];

export const ProjectsListScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [selectedDifficulty]);

  const loadProjects = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const filtered = selectedDifficulty === 'all' 
      ? MOCK_PROJECTS 
      : MOCK_PROJECTS.filter(p => p.difficulty.toLowerCase() === selectedDifficulty);
    
    setProjects(filtered);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleDifficultyPress = (difficultyId: string) => {
    hapticFeedback.light();
    setSelectedDifficulty(difficultyId);
  };

  const handleProjectPress = (projectId: string) => {
    hapticFeedback.medium();
    navigation.navigate('ProjectDetail', { projectId });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return theme.primary;
    }
  };

  const renderDifficultyFilter = ({ item }: { item: typeof DIFFICULTY_FILTERS[0] }) => {
    const isSelected = selectedDifficulty === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.filterPill,
          {
            backgroundColor: isSelected ? theme.primary : theme.surface,
            borderColor: isSelected ? theme.primary : theme.border,
          },
        ]}
        onPress={() => handleDifficultyPress(item.id)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={item.icon as any}
          size={18}
          color={isSelected ? theme.textInverse : (item.color || theme.textSecondary)}
        />
        <Text
          style={[
            typography.labelSmall,
            { color: isSelected ? theme.textInverse : theme.text, marginLeft: 6 },
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderProjectCard = ({ item, index }: { item: typeof MOCK_PROJECTS[0]; index: number }) => {
    const difficultyColor = getDifficultyColor(item.difficulty);
    
    return (
      <FadeIn delay={index * 100}>
        <TouchableOpacity
          style={[styles.projectCard, { backgroundColor: theme.surface }]}
          onPress={() => handleProjectPress(item.id)}
          activeOpacity={0.9}
        >
          {/* Project Image with Gradient Overlay */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.projectImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.imageGradient}
            />
            
            {/* Difficulty Badge */}
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
              <MaterialCommunityIcons name="star" size={14} color="#fff" />
              <Text style={[typography.caption, { color: '#fff', marginLeft: 4 }]}>
                {item.difficulty}
              </Text>
            </View>
          </View>

          {/* Project Info */}
          <View style={styles.projectInfo}>
            <Text style={[typography.h3, { color: theme.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            
            <Text style={[typography.bodySmall, { color: theme.textSecondary, marginTop: 6 }]} numberOfLines={2}>
              {item.description}
            </Text>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={[styles.tag, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[typography.caption, { color: theme.primary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>

            {/* Meta Info */}
            <View style={styles.metaContainer}>
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="package-variant" size={16} color={theme.textSecondary} />
                <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 4 }]}>
                  {item.componentsCount} components
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={theme.textSecondary} />
                <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 4 }]}>
                  {item.duration}
                </Text>
              </View>
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              <View>
                <Text style={[typography.h2, { color: theme.primary }]}>
                  ₹{item.studentCost}
                </Text>
                {item.studentCost < item.estimatedCost && (
                  <Text style={[typography.caption, { color: theme.textSecondary, textDecorationLine: 'line-through' }]}>
                    ₹{item.estimatedCost}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity
                style={[styles.viewButton, { backgroundColor: theme.primary }]}
                onPress={() => handleProjectPress(item.id)}
              >
                <Text style={[typography.label, { color: theme.textInverse }]}>
                  View Details
                </Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color={theme.textInverse} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </FadeIn>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((item) => (
        <View key={item} style={[styles.projectCard, { backgroundColor: theme.surface }]}>
          <SkeletonLoader style={styles.projectImage} />
          <View style={styles.projectInfo}>
            <SkeletonLoader style={{ width: '80%', height: 20, marginBottom: 8 }} />
            <SkeletonLoader style={{ width: '100%', height: 14, marginBottom: 4 }} />
            <SkeletonLoader style={{ width: '90%', height: 14, marginBottom: 12 }} />
            <SkeletonLoader style={{ width: '60%', height: 24 }} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      icon="lightbulb-outline"
      title="No Projects Found"
      description="Try selecting a different difficulty level"
      actionLabel="View All Projects"
      onAction={() => setSelectedDifficulty('all')}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View>
          <Text style={[typography.h2, { color: theme.text }]}>
            Projects
          </Text>
          <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 2 }]}>
            Build amazing IoT projects
          </Text>
        </View>
      </View>

      {/* Difficulty Filters */}
      <FlatList
        data={DIFFICULTY_FILTERS}
        renderItem={renderDifficultyFilter}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      />

      {/* Projects List */}
      {isLoading && projects.length === 0 ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={projects}
          renderItem={renderProjectCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
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
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingVertical: semanticSpacing.paddingMd,
    borderBottomWidth: 1,
  },
  filtersContainer: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingVertical: semanticSpacing.paddingMd,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.paddingMd,
    paddingVertical: semanticSpacing.paddingSm,
    borderRadius: semanticSpacing.radiusFull,
    borderWidth: 1,
    marginRight: semanticSpacing.marginSm,
  },
  listContent: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingBottom: semanticSpacing.paddingXl,
  },
  projectCard: {
    width: CARD_WIDTH,
    borderRadius: semanticSpacing.radiusLg,
    marginBottom: semanticSpacing.marginLg,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  difficultyBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: semanticSpacing.radiusFull,
  },
  projectInfo: {
    padding: semanticSpacing.paddingMd,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: semanticSpacing.radiusSm,
    marginRight: 6,
    marginBottom: 6,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.paddingMd,
    paddingVertical: semanticSpacing.paddingSm,
    borderRadius: semanticSpacing.radiusMd,
  },
  skeletonContainer: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
  },
});
