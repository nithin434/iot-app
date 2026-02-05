/**
 * SlideUp Animation Component
 * Smooth slide-up animation from bottom
 * Best practice: Use for cards, modals, and bottom sheets
 */

import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface SlideUpProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  distance?: number;
  style?: ViewStyle;
}

export const SlideUp: React.FC<SlideUpProps> = ({
  children,
  duration = 400,
  delay = 0,
  distance = 50,
  style,
}) => {
  const translateY = useRef(new Animated.Value(distance)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: duration * 0.8,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          opacity,
          transform: [{ translateY }],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};
