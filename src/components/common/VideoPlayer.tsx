/**
 * Video Player Component
 * Displays video content with controls
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import { Video, AVPlaybackStatus } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { typography } from '../../theme/typography';
import { semanticSpacing } from '../../theme/spacing';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  thumbnail?: string;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onError?: (error: string) => void;
  resizeMode?: 'cover' | 'contain';
  autoPlay?: boolean;
  showControls?: boolean;
  height?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const DEFAULT_HEIGHT = (SCREEN_WIDTH * 9) / 16; // 16:9 aspect ratio

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  title,
  thumbnail,
  onLoadStart,
  onLoadComplete,
  onError,
  resizeMode = 'contain',
  autoPlay = false,
  showControls = true,
  height = DEFAULT_HEIGHT,
}) => {
  const { theme } = useTheme();
  const videoRef = useRef<Video>(null);
  
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);

  useEffect(() => {
    if (autoPlay) {
      videoRef.current?.playAsync();
    }
  }, [autoPlay]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      await videoRef.current?.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current?.playAsync();
      setIsPlaying(true);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    onLoadStart?.();
  };

  const handleLoadComplete = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setIsLoading(false);
      onLoadComplete?.();
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentPosition(status.positionMillis || 0);
      
      // Auto pause at end
      if (status.didJustFinish && !status.isLooping) {
        setIsPlaying(false);
      }
    }
  };

  const handleError = (error: string) => {
    setIsLoading(false);
    onError?.(error);
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = async (position: number) => {
    await videoRef.current?.setPositionAsync(position);
  };

  const progressBarRef = useRef<View>(null);

  const progressPercentage = duration > 0 ? (currentPosition / duration) * 100 : 0;

  return (
    <View style={[styles.container, { height }]}>
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        resizeMode={resizeMode as any}
        onLoadStart={handleLoadStart}
        onLoad={handleLoadComplete}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onError={(error: string) => handleError(error)}
        shouldPlay={autoPlay}
        progressUpdateIntervalMillis={500}
        usePoster={!!thumbnail}
        // posterResizeMode={"cover" as any}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator
            size="large"
            color={theme.primary}
          />
        </View>
      )}

      {/* Video Controls */}
      {showControls && (
        <View style={[styles.controls, { backgroundColor: theme.background + '80' }]}>
          {/* Play/Pause Button */}
          <TouchableOpacity
            onPress={handlePlayPause}
            style={styles.playButton}
          >
            <MaterialCommunityIcons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={48}
              color={theme.primary}
            />
          </TouchableOpacity>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <TouchableOpacity
              ref={progressBarRef}
              style={[
                styles.progressBar,
                { backgroundColor: theme.border },
              ]}
              onPress={(e: GestureResponderEvent) => {
                progressBarRef.current?.measure((fx: number, fy: number, width: number, height: number, pageX: number, pageY: number) => {
                  const touchX = e.nativeEvent.locationX;
                  const newPosition = (touchX / width) * duration;
                  handleSeek(newPosition);
                });
              }}
            >
              <View
                style={[
                  styles.progress,
                  { backgroundColor: theme.primary, width: `${progressPercentage}%` },
                ]}
              />
            </TouchableOpacity>

            {/* Time Display */}
            <View style={styles.timeContainer}>
              <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                {formatTime(currentPosition)}
              </Text>
              <Text style={[styles.timeText, { color: theme.textSecondary }]}>
                {formatTime(duration)}
              </Text>
            </View>
          </View>

          {/* Fullscreen Button */}
          <TouchableOpacity
            onPress={() => setShowFullscreen(!showFullscreen)}
            style={styles.fullscreenButton}
          >
            <MaterialCommunityIcons
              name={showFullscreen ? 'fullscreen-exit' : 'fullscreen'}
              size={24}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Title */}
      {title && (
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              typography.body2,
              { color: theme.text },
            ]}
            numberOfLines={2}
          >
            {title}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 8,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: semanticSpacing.paddingMd,
    gap: semanticSpacing.paddingSm,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -24,
    marginTop: -24,
    zIndex: 10,
  },
  progressContainer: {
    gap: semanticSpacing.marginSm,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: semanticSpacing.paddingSm,
  },
  timeText: {
    fontSize: 12,
  },
  fullscreenButton: {
    alignSelf: 'flex-end',
    padding: semanticSpacing.paddingSm,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: semanticSpacing.paddingMd,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontWeight: '600',
  },
});
