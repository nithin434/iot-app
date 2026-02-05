/**
 * BottomSheet Component
 * Beautiful bottom sheet with gesture support and smooth animations
 * Best practice: Used for filters, options, and secondary actions
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  PanResponder,
  Animated,
} from 'react-native';
import { useTheme } from '../../theme';
import { semanticSpacing } from '../../theme/spacing';
import { semanticShadows } from '../../theme/shadows';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[]; // Percentage of screen height
  enablePanDownToClose?: boolean;
  showHandle?: boolean;
  maxHeight?: number;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoints = [50, 90],
  enablePanDownToClose = true,
  showHandle = true,
  maxHeight,
}) => {
  const { theme } = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const lastGestureDy = useRef(0);

  // Calculate sheet height based on snap points
  const sheetHeight = maxHeight || (SCREEN_HEIGHT * snapPoints[0]) / 100;

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
      }).start();
    } else {
      // Slide down animation
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Pan responder for drag to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enablePanDownToClose,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dy } = gestureState;
        // Only respond to downward drags
        return enablePanDownToClose && dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const { dy } = gestureState;
        if (dy > 0) {
          // Only allow dragging down
          translateY.setValue(dy);
          lastGestureDy.current = dy;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dy, vy } = gestureState;
        
        // If dragged down more than 100px or fast swipe down, close
        if (dy > 100 || vy > 0.5) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          // Snap back to original position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 90,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor: theme.overlay,
              opacity: translateY.interpolate({
                inputRange: [0, SCREEN_HEIGHT],
                outputRange: [1, 0],
              }),
            }}
          />
        </TouchableOpacity>

        {/* Bottom Sheet */}
        <Animated.View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: theme.surface,
              maxHeight: sheetHeight,
              transform: [{ translateY }],
              ...semanticShadows.bottomSheet,
            },
          ]}
        >
          {/* Drag Handle */}
          {showHandle && (
            <View
              style={styles.handleContainer}
              {...panResponder.panHandlers}
            >
              <View
                style={[
                  styles.handle,
                  { backgroundColor: theme.border },
                ]}
              />
            </View>
          )}

          {/* Content */}
          <ScrollView
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    borderTopLeftRadius: semanticSpacing.radiusXl,
    borderTopRightRadius: semanticSpacing.radiusXl,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: semanticSpacing.paddingMd,
  },
  handle: {
    width: 40,
    height: semanticSpacing.bottomSheetHandleHeight,
    borderRadius: semanticSpacing.radiusSm,
  },
  contentContainer: {
    paddingHorizontal: semanticSpacing.screenPaddingX,
    paddingBottom: semanticSpacing.paddingXl,
  },
});
