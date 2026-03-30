import React, { memo, useLayoutEffect, useState } from 'react';
import {
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import type { Video } from '@/types';
import {
  useStackedCarousel,
  THROW_THRESHOLD,
  SLOT_OFFSET,
  SLOT_SCALE,
  SLOT_OPACITY_STEP,
  type UseStackedCarouselResult,
} from '@/hooks/useStackedCarousel';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = Math.round(SCREEN_HEIGHT * 0.68);
const VISIBLE_CARDS = 3; // cards fully visible in the stack
const PRELOAD_CARDS = VISIBLE_CARDS + 1; // +1 rendered at opacity 0 for prefetch

// ─── StackedCard ─────────────────────────────────────────────────────────────

interface StackedCardProps {
  video: Video;
  slotIndex: number; // 0 = top card, 1 = second, …
  dragY: UseStackedCarouselResult['dragY'];
}

const StackedCardInner = ({ video, slotIndex, dragY }: StackedCardProps) => {
  const theme = useTheme();

  const animatedStyle = useAnimatedStyle(() => {
    const raw = dragY.value;

    let translateY: number;
    let scale: number;
    let opacity: number;

    if (slotIndex === 0) {
      // Top card: follows finger directly
      translateY = raw;
      scale = 1;
      opacity = 1;
    } else {
      // Lower cards: interpolate from base position toward "promoted" position
      // as the user drags the top card up.
      const progress = raw < 0 ? Math.min(1, -raw / THROW_THRESHOLD) : 0;

      const baseY = slotIndex * SLOT_OFFSET;
      const promotedY = (slotIndex - 1) * SLOT_OFFSET;

      const baseScale = 1 - slotIndex * SLOT_SCALE;
      const promotedScale = 1 - (slotIndex - 1) * SLOT_SCALE;

      const baseOpacity = slotIndex < VISIBLE_CARDS ? 1 - slotIndex * SLOT_OPACITY_STEP : 0;
      const promotedOpacity =
        slotIndex - 1 < VISIBLE_CARDS ? 1 - (slotIndex - 1) * SLOT_OPACITY_STEP : 0;

      translateY = baseY + (promotedY - baseY) * progress;
      scale = baseScale + (promotedScale - baseScale) * progress;
      opacity = baseOpacity + (promotedOpacity - baseOpacity) * progress;
    }

    // Slight rotateX for depth on lower cards
    const rotateXDeg = slotIndex > 0 ? slotIndex * 1.5 : 0;

    return {
      transform: [
        { perspective: 1200 },
        { translateY },
        { scale },
        { rotateX: `${rotateXDeg}deg` },
      ],
      opacity,
    };
  });

  // Elevation grows for the top card
  const shadowStyle =
    slotIndex === 0
      ? Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
          },
          android: { elevation: 12 },
          default: {},
        })
      : Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
          },
          android: { elevation: 3 },
          default: {},
        });

  return (
    <Animated.View
      style={[
        styles.card,
        { borderRadius: theme.radius.xl },
        shadowStyle,
        animatedStyle,
      ]}
    >
      <ImageBackground
        source={{ uri: video.thumbnail }}
        style={styles.thumbnail}
        imageStyle={{ borderRadius: theme.radius.xl }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.88)']}
          locations={[0.35, 0.68, 1]}
          style={styles.gradient}
        >
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceBadgeText}>{video.source.toUpperCase()}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {video.title}
          </Text>
        </LinearGradient>
      </ImageBackground>
    </Animated.View>
  );
};

// Memoize lower cards – they only need to re-render when their video changes,
// not on every dragY update (which is handled on the UI thread by Reanimated).
const StackedCard = memo(StackedCardInner);

// ─── StackedPlaylistView ─────────────────────────────────────────────────────

interface StackedPlaylistViewProps {
  videos: Video[];
  initialIndex?: number;
  onVideoPress?: (video: Video, index: number) => void;
}

export function StackedPlaylistView({
  videos,
  initialIndex = 0,
  onVideoPress,
}: StackedPlaylistViewProps) {
  const theme = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleNext = () => setCurrentIndex((i) => Math.min(i + 1, videos.length - 1));
  const handlePrev = () => setCurrentIndex((i) => Math.max(i - 1, 0));

  const { dragY, gesture, resetAnimation } = useStackedCarousel({
    total: videos.length,
    currentIndex,
    onNext: handleNext,
    onPrev: handlePrev,
  });

  // Reset animation values synchronously before the new frame is painted so
  // the incoming top card appears at rest position without any visible flash.
  useLayoutEffect(() => {
    resetAnimation();
  }, [currentIndex, resetAnimation]);

  const progressPercent = videos.length > 1 ? currentIndex / (videos.length - 1) : 1;

  // Build the slot list: [slot 0, slot 1, …, slot PRELOAD_CARDS-1]
  // Slots beyond the video array are omitted.
  const slots = Array.from({ length: PRELOAD_CARDS }, (_, i) => {
    const videoIndex = currentIndex + i;
    if (videoIndex >= videos.length) return null;
    return { slotIndex: i, video: videos[videoIndex] };
  }).filter((s): s is { slotIndex: number; video: Video } => s !== null);

  const topSlot = slots.find((s) => s.slotIndex === 0);
  const backSlots = slots.filter((s) => s.slotIndex > 0).reverse(); // render back-to-front

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ── Counter + progress bar ── */}
      <View style={styles.header}>
        <Text style={[styles.counter, { color: theme.colors.textSecondary }]}>
          <Text style={{ color: theme.colors.text, fontWeight: '600' }}>
            {currentIndex + 1}
          </Text>
          {'  /  '}
          {videos.length}
        </Text>

        <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.colors.accent,
                width: `${progressPercent * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* ── Card stack ── */}
      <GestureDetector gesture={gesture}>
        <View style={styles.cardsContainer}>
          {/* Back cards (rendered first = visually below) */}
          {backSlots.map(({ slotIndex, video }) => (
            <StackedCard
              key={video.id}
              video={video}
              slotIndex={slotIndex}
              dragY={dragY}
            />
          ))}

          {/* Top card (rendered last = visually on top) */}
          {topSlot && (
            <StackedCard
              key={topSlot.video.id}
              video={topSlot.video}
              slotIndex={0}
              dragY={dragY}
            />
          )}
        </View>
      </GestureDetector>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ── Header ──
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  counter: {
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // ── Cards container ──
  // Height allows bottom cards to peek below the top card.
  cardsContainer: {
    alignSelf: 'center',
    width: CARD_WIDTH,
    height: CARD_HEIGHT + SLOT_OFFSET * VISIBLE_CARDS,
  },

  // ── Individual card ──
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
  },
  thumbnail: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradient: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 80,
    gap: 8,
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  sourceBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
});
