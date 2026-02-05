/**
 * Tutorial Detail Screen
 * Detailed tutorial with steps, code, and diagrams
 * Design Reference: Medium articles, dev.to - clean reading experience
 * Best practice: Clear sections, code highlighting, zoomable images
 * Industry-grade UX: Bookmark, share, components list, copy code
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LearningStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';
import { Button, Card } from '../../components/common';
import { FadeIn } from '../../components/animations';
import { hapticFeedback } from '../../utils/haptics';

type NavigationProp = NativeStackNavigationProp<LearningStackParamList, 'TutorialDetail'>;
type RoutePropType = RouteProp<LearningStackParamList, 'TutorialDetail'>;

interface Component {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  code?: string;
}

// Mock tutorial data
const MOCK_TUTORIAL = {
  id: '1',
  title: 'Getting Started with Arduino Uno',
  description: 'Learn the basics of Arduino programming and build your first LED blink project. This tutorial will guide you through setting up your Arduino, understanding the basics of programming, and creating your first circuit.',
  difficulty: 'beginner',
  duration: '15 min',
  views: 12500,
  isBookmarked: false,
  components: [
    { id: '1', name: 'Arduino Uno R3', quantity: 1, price: 599 },
    { id: '2', name: 'LED (Red)', quantity: 1, price: 5 },
    { id: '3', name: 'Resistor 220Ω', quantity: 1, price: 2 },
    { id: '4', name: 'Breadboard', quantity: 1, price: 99 },
    { id: '5', name: 'Jumper Wires', quantity: 3, price: 15 },
  ],
  steps: [
    {
      id: '1',
      title: 'Setup Arduino IDE',
      description: 'Download and install the Arduino IDE from arduino.cc. Connect your Arduino Uno to your computer using a USB cable.',
    },
    {
      id: '2',
      title: 'Connect the Circuit',
      description: 'Connect the LED to pin 13 through a 220Ω resistor. Connect the other end of the LED to GND.',
    },
    {
      id: '3',
      title: 'Write the Code',
      description: 'Open Arduino IDE and write the following code to blink the LED:',
      code: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`,
    },
    {
      id: '4',
      title: 'Upload and Test',
      description: 'Click the upload button in Arduino IDE. Wait for the upload to complete. Your LED should start blinking!',
    },
  ],
  externalLinks: [
    { id: '1', title: 'Arduino Official Documentation', url: 'https://www.arduino.cc/reference/en/' },
    { id: '2', title: 'Arduino Forum', url: 'https://forum.arduino.cc/' },
  ],
};

export const TutorialDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  
  const tutorialId = route.params?.tutorialId;
  const [tutorial] = useState(MOCK_TUTORIAL);
  const [isBookmarked, setIsBookmarked] = useState(tutorial.isBookmarked);

  const handleBack = () => {
    hapticFeedback.light();
    navigation.goBack();
  };

  const handleBookmark = () => {
    hapticFeedback.medium();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    hapticFeedback.light();
    Alert.alert('Share Tutorial', 'Share this tutorial with your friends!');
  };

  const handleCopyCode = (code: string) => {
    hapticFeedback.success();
    Clipboard.setString(code);
    Alert.alert('Copied!', 'Code copied to clipboard');
  };

  const handleAddAllToCart = () => {
    hapticFeedback.medium();
    Alert.alert('Added to Cart', 'All components have been added to your cart');
  };

  const totalCost = tutorial.components.reduce((sum, comp) => sum + (comp.price * comp.quantity), 0);

  const renderIntroSection = () => (
    <Card style={[styles.introCard, { backgroundColor: theme.surface }]}>
      <LinearGradient
        colors={[theme.primary + '10', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      />

      <View style={styles.introHeader}>
        <View style={[styles.difficultyBadge, { backgroundColor: theme.successLight }]}>
          <MaterialCommunityIcons name="school" size={16} color={theme.success} />
          <Text style={[typography.label, { color: theme.success, marginLeft: 6 }]}>
            {tutorial.difficulty.charAt(0).toUpperCase() + tutorial.difficulty.slice(1)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={theme.textSecondary} />
            <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 4 }]}>
              {tutorial.duration}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="eye-outline" size={16} color={theme.textSecondary} />
            <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 4 }]}>
              {(tutorial.views / 1000).toFixed(1)}K views
            </Text>
          </View>
        </View>
      </View>

      <Text style={[typography.body, { color: theme.text, marginTop: 12, lineHeight: 24 }]}>
        {tutorial.description}
      </Text>
    </Card>
  );

  const renderComponentsSection = () => (
    <Card style={[styles.componentsCard, { backgroundColor: theme.surface }]}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="cube-outline" size={24} color={theme.primary} />
        <Text style={[typography.h3, { color: theme.text, marginLeft: 12 }]}>
          Components Needed
        </Text>
      </View>

      {tutorial.components.map((component, index) => (
        <Animated.View
          key={component.id}
          entering={FadeInDown.delay(index * 50)}
          style={[
            styles.componentItem,
            {
              borderBottomWidth: index < tutorial.components.length - 1 ? 1 : 0,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <View style={[styles.componentIcon, { backgroundColor: theme.primaryLight }]}>
            <MaterialCommunityIcons name="chip" size={20} color={theme.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[typography.body, { color: theme.text }]}>
              {component.name}
            </Text>
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 2 }]}>
              Qty: {component.quantity}
            </Text>
          </View>

          <Text style={[typography.h4, { color: theme.primary }]}>
            ₹{component.price * component.quantity}
          </Text>
        </Animated.View>
      ))}

      <View style={[styles.totalRow, { backgroundColor: theme.primaryLight }]}>
        <Text style={[typography.h4, { color: theme.primary }]}>
          Total Cost
        </Text>
        <Text style={[typography.h3, { color: theme.primary }]}>
          ₹{totalCost}
        </Text>
      </View>

      <Button
        title="Add All to Cart"
        onPress={handleAddAllToCart}
        variant="primary"
        style={{ marginTop: 12 }}
        icon={<MaterialCommunityIcons name="cart-plus" size={20} color={theme.textInverse} />}
      />
    </Card>
  );

  const renderStepsSection = () => (
    <Card style={[styles.stepsCard, { backgroundColor: theme.surface }]}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="format-list-numbered" size={24} color={theme.primary} />
        <Text style={[typography.h3, { color: theme.text, marginLeft: 12 }]}>
          Step-by-Step Guide
        </Text>
      </View>

      {tutorial.steps.map((step, index) => (
        <Animated.View
          key={step.id}
          entering={FadeInDown.delay(index * 100)}
          style={styles.stepItem}
        >
          <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
            <Text style={[typography.h4, { color: theme.textInverse }]}>
              {index + 1}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[typography.h4, { color: theme.text }]}>
              {step.title}
            </Text>
            <Text style={[typography.body, { color: theme.textSecondary, marginTop: 8, lineHeight: 22 }]}>
              {step.description}
            </Text>

            {step.code && (
              <View style={[styles.codeBlock, { backgroundColor: theme.backgroundSecondary }]}>
                <View style={styles.codeHeader}>
                  <MaterialCommunityIcons name="code-tags" size={16} color={theme.textSecondary} />
                  <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 6 }]}>
                    Arduino Code
                  </Text>
                  <TouchableOpacity
                    style={[styles.copyButton, { backgroundColor: theme.primaryLight }]}
                    onPress={() => handleCopyCode(step.code!)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="content-copy" size={14} color={theme.primary} />
                    <Text style={[typography.caption, { color: theme.primary, marginLeft: 4 }]}>
                      Copy
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={[typography.body, { color: theme.text, fontFamily: 'monospace', marginTop: 8 }]}>
                  {step.code}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      ))}
    </Card>
  );

  const renderLinksSection = () => (
    <Card style={[styles.linksCard, { backgroundColor: theme.surface }]}>
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="link-variant" size={24} color={theme.primary} />
        <Text style={[typography.h3, { color: theme.text, marginLeft: 12 }]}>
          Helpful Resources
        </Text>
      </View>

      {tutorial.externalLinks.map((link, index) => (
        <TouchableOpacity
          key={link.id}
          style={[
            styles.linkItem,
            {
              borderBottomWidth: index < tutorial.externalLinks.length - 1 ? 1 : 0,
              borderBottomColor: theme.border,
            },
          ]}
          onPress={() => {
            hapticFeedback.light();
            // Open URL
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="open-in-new" size={20} color={theme.primary} />
          <Text style={[typography.body, { color: theme.primary, marginLeft: 12, flex: 1 }]}>
            {link.title}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      ))}
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: theme.text, flex: 1 }]} numberOfLines={1}>
          {tutorial.title}
        </Text>
        <TouchableOpacity onPress={handleBookmark} style={styles.iconButton}>
          <MaterialCommunityIcons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isBookmarked ? theme.warning : theme.text}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
          <MaterialCommunityIcons name="share-variant" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <FadeIn delay={50}>
          {renderIntroSection()}
        </FadeIn>

        <FadeIn delay={100}>
          {renderComponentsSection()}
        </FadeIn>

        <FadeIn delay={150}>
          {renderStepsSection()}
        </FadeIn>

        <FadeIn delay={200}>
          {renderLinksSection()}
        </FadeIn>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    marginRight: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: semanticSpacing.screenPaddingX,
  },
  introCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginMd,
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: semanticSpacing.radiusMd,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  componentsCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginMd,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: semanticSpacing.marginMd,
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: semanticSpacing.paddingMd,
  },
  componentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: semanticSpacing.paddingMd,
    borderRadius: semanticSpacing.radiusMd,
    marginTop: 12,
  },
  stepsCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginMd,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: semanticSpacing.marginLg,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  codeBlock: {
    padding: semanticSpacing.paddingMd,
    borderRadius: semanticSpacing.radiusMd,
    marginTop: 12,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: semanticSpacing.radiusSm,
    marginLeft: 'auto',
  },
  linksCard: {
    padding: semanticSpacing.paddingLg,
    marginBottom: semanticSpacing.marginMd,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: semanticSpacing.paddingMd,
  },
});
