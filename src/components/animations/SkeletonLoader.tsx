/**
 * Skeleton Loader Component
 * Beautiful shimmer loading effect
 * Best practice: Use while content is loading to improve perceived performance
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { semanticSpacing } from '../../theme/spacing';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = semanticSpacing.radiusSm,
  style,
}) => {
  const { theme } = useTheme();
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, []);

  const translateX = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.surfaceHover,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <View
          style={[
            styles.shimmerGradient,
            {
              backgroundColor: theme.surface,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

// Preset skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <View>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLoader
        key={index}
        height={16}
        width={index === lines - 1 ? '70%' : '100%'}
        style={{ marginBottom: semanticSpacing.marginSm }}
      />
    ))}
  </View>
);

export const SkeletonCard: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderRadius: semanticSpacing.radiusLg,
          padding: semanticSpacing.paddingMd,
        },
      ]}
    >
      <SkeletonLoader height={150} style={{ marginBottom: semanticSpacing.marginMd }} />
      <SkeletonLoader height={20} width="80%" style={{ marginBottom: semanticSpacing.marginSm }} />
      <SkeletonLoader height={16} width="60%" />
    </View>
  );
};

export const SkeletonProductCard: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View
      style={[
        styles.productCard,
        {
          backgroundColor: theme.surface,
          borderRadius: semanticSpacing.radiusLg,
          padding: semanticSpacing.paddingMd,
        },
      ]}
    >
      <SkeletonLoader
        height={180}
        style={{ marginBottom: semanticSpacing.marginMd }}
        borderRadius={semanticSpacing.radiusMd}
      />
      <SkeletonLoader height={18} width="90%" style={{ marginBottom: semanticSpacing.marginSm }} />
      <SkeletonLoader height={16} width="50%" style={{ marginBottom: semanticSpacing.marginMd }} />
      <View style={styles.row}>
        <SkeletonLoader height={32} width={80} borderRadius={semanticSpacing.radiusMd} />
        <SkeletonLoader height={32} width={32} borderRadius={semanticSpacing.radiusFull} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  shimmerGradient: {
    width: 300,
    height: '100%',
    opacity: 0.3,
  },
  card: {
    marginBottom: semanticSpacing.marginMd,
  },
  productCard: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
