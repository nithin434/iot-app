/**
 * Onboarding Screen
 * Beautiful carousel introducing the app features
 * Best practice: First impression matters - make it stunning!
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Button } from '../../components/common';
import { FadeIn, SlideUp } from '../../components/animations';
import { storageService, STORAGE_KEYS } from '../../services/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  image: any; // Will use require() for local images
  backgroundColor: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Discover IoT Components',
    description: 'Browse thousands of electrical and IoT components for your next project',
    image: require('../../../assets/icon.png'), // Placeholder - replace with actual images
    backgroundColor: '#EFF6FF',
  },
  {
    id: '2',
    title: 'Project-Based Shopping',
    description: 'Select a project and get all required components in one click',
    image: require('../../../assets/icon.png'), // Placeholder
    backgroundColor: '#DBEAFE',
  },
  {
    id: '3',
    title: 'Learn & Build',
    description: 'Access tutorials, wiring diagrams, and sample code for every component',
    image: require('../../../assets/icon.png'), // Placeholder
    backgroundColor: '#BFDBFE',
  },
  {
    id: '4',
    title: 'Student Discounts',
    description: 'Verify your student status and get exclusive discounts on all products',
    image: require('../../../assets/icon.png'), // Placeholder
    backgroundColor: '#93C5FD',
  },
];

export const OnboardingScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<any>(null);

  const handleSkip = async () => {
    await storageService.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, true);
    navigation.replace('OTPEmail');
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * SCREEN_WIDTH,
        animated: true,
      });
    } else {
      handleSkip();
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const renderSlide = (slide: OnboardingSlide, index: number) => (
    <View
      key={slide.id}
      style={[
        styles.slide,
        { backgroundColor: slide.backgroundColor },
      ]}
    >
      <FadeIn delay={index * 100}>
        <View style={styles.imageContainer}>
          <Image
            source={slide.image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </FadeIn>

      <SlideUp delay={index * 100 + 200}>
        <View style={styles.textContainer}>
          <Text style={[typography.h1, styles.title, { color: theme.primary }]}>
            {slide.title}
          </Text>
          <Text style={[typography.body, styles.description, { color: theme.textSecondary }]}>
            {slide.description}
          </Text>
        </View>
      </SlideUp>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === currentIndex ? theme.primary : theme.border,
              width: index === currentIndex ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={[typography.label, { color: theme.textSecondary }]}>
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {/* Carousel */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
        >
          {slides.map((slide, index) => renderSlide(slide, index))}
        </ScrollView>
      </View>

      {/* Pagination Dots */}
      {renderPagination()}

      {/* Bottom Actions */}
      <View style={styles.bottomContainer}>
        <Button
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          variant="primary"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipButton: {
    position: 'absolute',
    top: semanticSpacing.paddingLg,
    right: semanticSpacing.paddingLg,
    zIndex: 10,
    padding: semanticSpacing.paddingSm,
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollView: {
    flexDirection: 'row',
    width: SCREEN_WIDTH * slides.length,
  },
  slide: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.screenPaddingX,
  },
  imageContainer: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_HEIGHT * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: semanticSpacing.marginXl,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: semanticSpacing.paddingLg,
  },
  title: {
    textAlign: 'center',
    marginBottom: semanticSpacing.marginMd,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: semanticSpacing.paddingLg,
  },
  dot: {
    height: 8,
    borderRadius: semanticSpacing.radiusFull,
    marginHorizontal: 4,
  },
  bottomContainer: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingBottom: semanticSpacing.paddingXl,
  },
});
