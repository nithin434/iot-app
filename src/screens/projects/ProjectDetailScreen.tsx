/**
 * Project Detail Screen
 * Complete project view with component lists and pricing
 * Best practice: Make it easy to buy all components for a project
 * Industry-grade UX: Visual hierarchy, smooth animations, clear CTAs
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ProjectsStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Button, Badge, Card } from '../../components/common';
import { FadeIn, SlideUp, ScaleIn } from '../../components/animations';
import { useCartStore, useAuthStore } from '../../stores';
import { hapticFeedback } from '../../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_HEIGHT * 0.35;

type NavigationProp = NativeStackNavigationProp<ProjectsStackParamList, 'ProjectDetail'>;
type RoutePropType = RouteProp<ProjectsStackParamList, 'ProjectDetail'>;

// Mock project data
const MOCK_PROJECT = {
  id: '1',
  name: 'Smart Home Automation System',
  description: 'Build a complete home automation system that lets you control lights, fans, and appliances using your smartphone. This project includes WiFi connectivity, mobile app integration, and voice control capabilities.',
  difficulty: 'Intermediate',
  estimatedCost: 2499,
  studentCost: 2199,
  duration: '4-6 hours',
  image: 'https://via.placeholder.com/800x400',
  tags: ['IoT', 'Home Automation', 'ESP32', 'WiFi'],
  learningOutcomes: [
    'Understanding IoT protocols',
    'Mobile app integration',
    'Relay control circuits',
    'WiFi module programming',
  ],
  mandatoryComponents: [
    { id: '1', name: 'ESP32 DevKit', quantity: 1, price: 799, image: 'https://via.placeholder.com/80' },
    { id: '2', name: '4-Channel Relay Module', quantity: 1, price: 249, image: 'https://via.placeholder.com/80' },
    { id: '3', name: 'Jumper Wires (40pcs)', quantity: 1, price: 79, image: 'https://via.placeholder.com/80' },
    { id: '4', name: 'Breadboard 830 Points', quantity: 1, price: 99, image: 'https://via.placeholder.com/80' },
    { id: '5', name: 'Power Supply 5V 2A', quantity: 1, price: 299, image: 'https://via.placeholder.com/80' },
  ],
  optionalComponents: [
    { id: '6', name: 'DHT22 Temperature Sensor', quantity: 1, price: 299, image: 'https://via.placeholder.com/80', description: 'Add temperature monitoring' },
    { id: '7', name: 'PIR Motion Sensor', quantity: 2, price: 149, image: 'https://via.placeholder.com/80', description: 'Enable motion detection' },
    { id: '8', name: 'OLED Display 0.96"', quantity: 1, price: 349, image: 'https://via.placeholder.com/80', description: 'Show system status' },
  ],
};

export const ProjectDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { projectId } = route.params;
  
  const { user } = useAuthStore();
  const { addItem } = useCartStore();

  const [selectedOptional, setSelectedOptional] = useState<string[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const project = MOCK_PROJECT;
  const isStudent = user?.isStudentVerified;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.3, 1],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT],
    outputRange: [0, -HERO_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return theme.primary;
    }
  };

  const calculateTotalCost = () => {
    const mandatoryCost = project.mandatoryComponents.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const optionalCost = project.optionalComponents
      .filter(item => selectedOptional.includes(item.id))
      .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return mandatoryCost + optionalCost;
  };

  const handleOptionalToggle = (componentId: string) => {
    hapticFeedback.light();
    setSelectedOptional(prev =>
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  const handleAddAllToCart = async () => {
    hapticFeedback.medium();
    setIsAddingToCart(true);

    try {
      // Add mandatory components
      for (const component of project.mandatoryComponents) {
        await addItem(component.id, component.quantity);
      }

      // Add selected optional components
      for (const component of project.optionalComponents) {
        if (selectedOptional.includes(component.id)) {
          await addItem(component.id, component.quantity);
        }
      }

      hapticFeedback.success();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      hapticFeedback.error();
      console.error('Add to cart error:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const difficultyColor = getDifficultyColor(project.difficulty);
  const totalCost = calculateTotalCost();
  const mandatoryCost = project.mandatoryComponents.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const optionalCost = totalCost - mandatoryCost;

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
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[typography.h4, { color: theme.text, flex: 1, marginHorizontal: 16 }]} numberOfLines={1}>
          {project.name}
        </Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => hapticFeedback.light()}>
          <MaterialCommunityIcons name="share-variant" size={24} color={theme.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Floating Back Button */}
      <TouchableOpacity
        style={[styles.floatingBack, { backgroundColor: theme.surface }]}
        onPress={handleBack}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
      </TouchableOpacity>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image with Parallax */}
        <Animated.View
          style={[
            styles.heroContainer,
            {
              transform: [
                { translateY: imageTranslateY },
                { scale: imageScale },
              ],
            },
          ]}
        >
          <Image
            source={{ uri: project.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Project Info Card */}
          <FadeIn>
            <Card style={[styles.infoCard, { backgroundColor: theme.surface }]}>
              <LinearGradient
                colors={[theme.primaryLight, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              />
              
              <View style={styles.infoHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h2, { color: theme.text }]}>
                    {project.name}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
                      <MaterialCommunityIcons name="star" size={14} color="#fff" />
                      <Text style={[typography.caption, { color: '#fff', marginLeft: 4 }]}>
                        {project.difficulty}
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color={theme.textSecondary} />
                      <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 4 }]}>
                        {project.duration}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={[typography.body, { color: theme.textSecondary, marginTop: 12 }]}>
                {project.description}
              </Text>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {project.tags.map((tag, idx) => (
                  <FadeIn key={idx} delay={idx * 50}>
                    <View style={[styles.tag, { backgroundColor: theme.primaryLight }]}>
                      <Text style={[typography.caption, { color: theme.primary }]}>
                        {tag}
                      </Text>
                    </View>
                  </FadeIn>
                ))}
              </View>
            </Card>
          </FadeIn>

          {/* Learning Outcomes */}
          <SlideUp delay={200}>
            <Card style={[styles.section, { backgroundColor: theme.surface }]}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="school" size={24} color={theme.primary} />
                <Text style={[typography.h3, { color: theme.text, marginLeft: 12 }]}>
                  What You'll Learn
                </Text>
              </View>
              {project.learningOutcomes.map((outcome, idx) => (
                <FadeIn key={idx} delay={300 + idx * 50}>
                  <View style={styles.outcomeItem}>
                    <View style={[styles.checkCircle, { backgroundColor: theme.successLight }]}>
                      <MaterialCommunityIcons name="check" size={16} color={theme.success} />
                    </View>
                    <Text style={[typography.body, { color: theme.text, flex: 1 }]}>
                      {outcome}
                    </Text>
                  </View>
                </FadeIn>
              ))}
            </Card>
          </SlideUp>

          {/* Mandatory Components */}
          <SlideUp delay={400}>
            <Card style={[styles.section, { backgroundColor: theme.surface }]}>
              <LinearGradient
                colors={[theme.errorLight + '20', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.sectionGradient}
              />
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="package-variant" size={24} color={theme.error} />
                <Text style={[typography.h3, { color: theme.text, marginLeft: 12, flex: 1 }]}>
                  Required Components
                </Text>
                <Badge label={`${project.mandatoryComponents.length} items`} variant="error" size="small" />
              </View>
              
              {project.mandatoryComponents.map((component, idx) => (
                <FadeIn key={component.id} delay={500 + idx * 50}>
                  <View style={[styles.componentItem, { borderBottomColor: theme.border }]}>
                    <Image source={{ uri: component.image }} style={styles.componentImage} resizeMode="cover" />
                    <View style={styles.componentInfo}>
                      <Text style={[typography.body, { color: theme.text }]}>
                        {component.name}
                      </Text>
                      <View style={styles.componentMeta}>
                        <Text style={[typography.caption, { color: theme.textSecondary }]}>
                          Qty: {component.quantity}
                        </Text>
                        <Text style={[typography.label, { color: theme.primary }]}>
                          ₹{component.price}
                        </Text>
                      </View>
                    </View>
                  </View>
                </FadeIn>
              ))}
            </Card>
          </SlideUp>

          {/* Optional Components */}
          <SlideUp delay={600}>
            <Card style={[styles.section, { backgroundColor: theme.surface }]}>
              <LinearGradient
                colors={[theme.warningLight + '20', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.sectionGradient}
              />
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="plus-circle-outline" size={24} color={theme.warning} />
                <Text style={[typography.h3, { color: theme.text, marginLeft: 12, flex: 1 }]}>
                  Optional Add-ons
                </Text>
                <Badge label={`${selectedOptional.length} selected`} variant="warning" size="small" />
              </View>
              
              <Text style={[typography.bodySmall, { color: theme.textSecondary, marginBottom: 16 }]}>
                Enhance your project with these optional components
              </Text>

              {project.optionalComponents.map((component, idx) => {
                const isSelected = selectedOptional.includes(component.id);
                
                return (
                  <FadeIn key={component.id} delay={700 + idx * 50}>
                    <TouchableOpacity
                      style={[
                        styles.optionalItem,
                        {
                          backgroundColor: isSelected ? theme.primaryLight : theme.backgroundSecondary,
                          borderColor: isSelected ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => handleOptionalToggle(component.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          {
                            backgroundColor: isSelected ? theme.primary : 'transparent',
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                      >
                        {isSelected && (
                          <MaterialCommunityIcons name="check" size={16} color={theme.textInverse} />
                        )}
                      </View>
                      
                      <Image source={{ uri: component.image }} style={styles.componentImage} resizeMode="cover" />
                      
                      <View style={styles.componentInfo}>
                        <Text style={[typography.body, { color: theme.text }]}>
                          {component.name}
                        </Text>
                        <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 2 }]}>
                          {component.description}
                        </Text>
                        <View style={styles.componentMeta}>
                          <Text style={[typography.caption, { color: theme.textSecondary }]}>
                            Qty: {component.quantity}
                          </Text>
                          <Text style={[typography.label, { color: theme.primary }]}>
                            ₹{component.price}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </FadeIn>
                );
              })}
            </Card>
          </SlideUp>

          {/* Cost Summary */}
          <ScaleIn delay={800}>
            <Card style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
              <LinearGradient
                colors={[theme.primary + '10', theme.primary + '05']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryGradient}
              />
              
              <Text style={[typography.h3, { color: theme.text, marginBottom: 16 }]}>
                Cost Summary
              </Text>

              <View style={styles.costRow}>
                <Text style={[typography.body, { color: theme.textSecondary }]}>
                  Required Components
                </Text>
                <Text style={[typography.body, { color: theme.text }]}>
                  ₹{mandatoryCost}
                </Text>
              </View>

              {selectedOptional.length > 0 && (
                <View style={styles.costRow}>
                  <Text style={[typography.body, { color: theme.textSecondary }]}>
                    Optional Components ({selectedOptional.length})
                  </Text>
                  <Text style={[typography.body, { color: theme.text }]}>
                    ₹{optionalCost}
                  </Text>
                </View>
              )}

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.totalRow}>
                <Text style={[typography.h2, { color: theme.text }]}>
                  Total
                </Text>
                <Text style={[typography.h1, { color: theme.primary }]}>
                  ₹{totalCost}
                </Text>
              </View>

              {isStudent && (
                <View style={[styles.savingsBadge, { backgroundColor: theme.successLight }]}>
                  <MaterialCommunityIcons name="tag" size={16} color={theme.success} />
                  <Text style={[typography.caption, { color: theme.success, marginLeft: 6 }]}>
                    Student discount applied!
                  </Text>
                </View>
              )}
            </Card>
          </ScaleIn>

          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <LinearGradient
          colors={[theme.surface, theme.surface + 'F0']}
          style={styles.bottomGradient}
        />
        <View style={styles.bottomContent}>
          <View>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>
              Total Cost
            </Text>
            <Text style={[typography.h2, { color: theme.primary }]}>
              ₹{totalCost}
            </Text>
          </View>
          
          <Button
            title="Add All to Cart"
            onPress={handleAddAllToCart}
            variant="primary"
            loading={isAddingToCart}
            style={styles.addButton}
            icon={<MaterialCommunityIcons name="cart-plus" size={20} color={theme.textInverse} />}
          />
        </View>
      </View>

      {/* Confetti Effect */}
      {showConfetti && (
        <View style={styles.confettiContainer}>
          <FadeIn>
            <View style={[styles.successMessage, { backgroundColor: theme.success }]}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#fff" />
              <Text style={[typography.h4, { color: '#fff', marginLeft: 12 }]}>
                Added to Cart! 🎉
              </Text>
            </View>
          </FadeIn>
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingBack: {
    position: 'absolute',
    top: 44,
    left: semanticSpacing.screenPaddingX,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    elevation: 4,
  },
  heroContainer: {
    height: HERO_HEIGHT,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  content: {
    marginTop: -40,
    paddingHorizontal: semanticSpacing.screenPaddingX,
  },
  infoCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginLg,
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    opacity: 0.3,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: semanticSpacing.radiusFull,
    marginRight: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: semanticSpacing.radiusSm,
    marginRight: 8,
    marginBottom: 8,
  },
  section: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginLg,
    overflow: 'hidden',
  },
  sectionGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  outcomeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  componentImage: {
    width: 60,
    height: 60,
    borderRadius: semanticSpacing.radiusMd,
    marginRight: 12,
  },
  componentInfo: {
    flex: 1,
  },
  componentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  optionalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: semanticSpacing.radiusMd,
    borderWidth: 2,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginLg,
    overflow: 'hidden',
  },
  summaryGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: semanticSpacing.radiusSm,
    marginTop: 12,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: semanticSpacing.paddingMd,
  },
  addButton: {
    flex: 1,
    marginLeft: semanticSpacing.marginMd,
  },
  confettiContainer: {
    position: 'absolute',
    top: 100,
    left: semanticSpacing.screenPaddingX,
    right: semanticSpacing.screenPaddingX,
    zIndex: 100,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: semanticSpacing.paddingMd,
    borderRadius: semanticSpacing.radiusMd,
    elevation: 8,
  },
});
