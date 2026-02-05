/**
 * Tutorial Detail Screen with Video Support
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { VideoPlayer } from '../../components/common';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';

interface TutorialMedia {
  mediaId: string;
  filename: string;
  mediaType: string;
  title?: string;
  url: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  category: string;
  content: string;
  components: string[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export const TutorialDetailVideoScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();

  const { tutorialId } = route.params || {};

  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [media, setMedia] = useState<TutorialMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);

  useEffect(() => {
    loadTutorialData();
  }, [tutorialId]);

  const loadTutorialData = async () => {
    try {
      setIsLoading(true);
      // TODO: Load tutorial and media from API
      // For now, showing mock data structure
      const mockTutorial: Tutorial = {
        id: tutorialId || '1',
        title: 'Getting Started with Arduino',
        description: 'Learn the basics of Arduino programming',
        difficulty: 'beginner',
        duration: 45,
        category: 'microcontrollers',
        content: `
          # Arduino Basics
          
          This tutorial covers:
          1. Arduino board overview
          2. Installation and setup
          3. Your first LED blink project
          4. Serial communication
          
          ## Components Needed
          - Arduino UNO board
          - USB cable
          - LED
          - 220Ω resistor
          - Breadboard
          - Jumper wires
        `,
        components: ['Arduino UNO', 'LED', 'Resistor', 'Breadboard'],
      };

      const mockMedia: TutorialMedia[] = [
        {
          mediaId: 'video1',
          filename: 'arduino-intro.mp4',
          mediaType: 'video',
          title: 'Arduino Introduction',
          url: 'http://localhost:8000/api/media/video1/download',
        },
        {
          mediaId: 'video2',
          filename: 'led-blink.mp4',
          mediaType: 'video',
          title: 'LED Blink Project',
          url: 'http://localhost:8000/api/media/video2/download',
        },
      ];

      setTutorial(mockTutorial);
      setMedia(mockMedia);
      if (mockMedia.length > 0) {
        setSelectedMediaId(mockMedia[0].mediaId);
      }
    } catch (error) {
      console.error('Failed to load tutorial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!tutorial) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContent}>
          <Text style={[{ color: theme.text }]}>Tutorial not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedMedia = media.find((m) => m.mediaId === selectedMediaId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={theme.primary}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Tutorial
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Video Player */}
        {selectedMedia && (
          <View style={styles.videoSection}>
            <VideoPlayer
              videoUrl={selectedMedia.url}
              title={selectedMedia.title}
              autoPlay={false}
              showControls
              height={SCREEN_WIDTH * (9 / 16)}
            />
          </View>
        )}

        {/* Video List */}
        {media.length > 0 && (
          <View style={styles.mediaListSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Videos
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mediaList}
            >
              {media.map((m) => (
                <TouchableOpacity
                  key={m.mediaId}
                  style={[
                    styles.mediaCard,
                    {
                      backgroundColor:
                        selectedMediaId === m.mediaId
                          ? theme.primary + '20'
                          : theme.surface,
                      borderColor:
                        selectedMediaId === m.mediaId ? theme.primary : 'transparent',
                      borderWidth: selectedMediaId === m.mediaId ? 2 : 0,
                    },
                  ]}
                  onPress={() => setSelectedMediaId(m.mediaId)}
                >
                  <MaterialCommunityIcons
                    name="play-circle"
                    size={32}
                    color={theme.primary}
                  />
                  <Text
                    style={[
                      styles.mediaTitle,
                      { color: theme.text },
                    ]}
                    numberOfLines={2}
                  >
                    {m.title || m.filename}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tutorial Title */}
        <Text style={[styles.title, { color: theme.text }]}>
          {tutorial.title}
        </Text>

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {tutorial.duration} min
            </Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons
            //   name="difficulty"
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {tutorial.difficulty}
            </Text>
          </View>
        </View>

        {/* Description */}
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {tutorial.description}
        </Text>

        {/* Components */}
        {tutorial.components.length > 0 && (
          <View style={styles.componentsSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Components Needed
            </Text>
            <View style={styles.componentsList}>
              {tutorial.components.map((component, index) => (
                <View
                  key={index}
                  style={[
                    styles.componentItem,
                    { backgroundColor: theme.surface },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="chip"
                    size={16}
                    color={theme.primary}
                  />
                  <Text style={[{ color: theme.text }]}>
                    {component}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Full Content */}
        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Content
          </Text>
          <Text style={[styles.contentText, { color: theme.text }]}>
            {tutorial.content}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: semanticSpacing.paddingLg,
    paddingVertical: semanticSpacing.paddingMd,
    gap: semanticSpacing.paddingLg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: semanticSpacing.paddingMd,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  videoSection: {
    marginBottom: semanticSpacing.paddingLg,
  },
  mediaListSection: {
    gap: semanticSpacing.paddingMd,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  mediaList: {
    gap: semanticSpacing.paddingMd,
    paddingRight: semanticSpacing.paddingLg,
  },
  mediaCard: {
    width: 140,
    paddingHorizontal: semanticSpacing.paddingMd,
    paddingVertical: semanticSpacing.paddingLg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: semanticSpacing.paddingSm,
  },
  mediaTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  metaContainer: {
    flexDirection: 'row',
    gap: semanticSpacing.paddingLg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: semanticSpacing.paddingSm,
  },
  metaText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  componentsSection: {
    gap: semanticSpacing.paddingMd,
  },
  componentsList: {
    gap: semanticSpacing.paddingSm,
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: semanticSpacing.paddingMd,
    paddingHorizontal: semanticSpacing.paddingMd,
    paddingVertical: semanticSpacing.paddingSm,
    borderRadius: 8,
  },
  contentSection: {
    gap: semanticSpacing.paddingMd,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
