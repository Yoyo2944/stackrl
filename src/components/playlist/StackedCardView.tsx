import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useStackedDeck, SLOT_COUNT, SLOT_OFFSET } from '@/hooks/useStackedDeck';
import { StackedCard, CARD_HEIGHT, CARD_WIDTH } from './StackedCard';
import type { Video } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Props ────────────────────────────────────────────────────────────────────

interface StackedCardViewProps {
  videos: Video[];
  initialIndex?: number;
  onVideoPress?: (video: Video, index: number) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StackedCardView({ videos, initialIndex = 0 }: StackedCardViewProps) {
  const theme = useTheme();

  const {
    dragY,
    activeSlot,
    incomingSlot,
    incomingY,
    autoProgress,
    isAutoScrolling,
    isHeavyMode,
    currentIndex,
    activeSlotIndex,
    slotVideoIndices,
    gesture,
  } = useStackedDeck(videos, initialIndex);

  // ── Counter progress bar ──
  const progressPercent = videos.length > 1 ? currentIndex / (videos.length - 1) : 1;

  // ── Auto-scroll progress bar style ──
  // Normal mode: thin bar (4px), accent color
  // Heavy mode: thicker bar (8px), different color (white)
  const autoProgressBarStyle = useAnimatedStyle(() => {
    'worklet';
    const visible = isAutoScrolling.value;
    const heavy = isHeavyMode.value;
    return {
      width: `${autoProgress.value * 100}%`,
      height: heavy ? 8 : 4,
      opacity: visible ? 1 : 0,
    };
  });

  const autoProgressTrackStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: isAutoScrolling.value ? 1 : 0,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ── Header: counter + progress bar ── */}
      <View style={styles.header}>
        <Text style={[styles.counter, { color: theme.colors.textSecondary }]}>
          <Text style={[styles.counterCurrent, { color: theme.colors.text }]}>
            {currentIndex + 1}
          </Text>
          {'  /  '}
          {videos.length}
        </Text>

        {/* Overall playlist progress */}
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

      {/* ── Card stack ──
          The container has no overflow:hidden so lower cards can peek below.
          Width = CARD_WIDTH; height accommodates active card + 3 × SLOT_OFFSET peeks.
          All 5 slots are always mounted; only their shared-value-driven positions change. */}
      <View style={styles.cardsContainer}>
        {/* Render all slots — order in JSX doesn't matter for z-ordering since
            zIndex is set per card via useAnimatedStyle */}
        {Array.from({ length: SLOT_COUNT }, (_, slotKey) => {
          const videoIndex = slotVideoIndices[slotKey];
          const video = videoIndex !== null ? videos[videoIndex] : null;

          if (slotKey === activeSlotIndex) {
            // Top card is the gesture target
            return (
              <GestureDetector key={slotKey} gesture={gesture}>
                <StackedCard
                  slotKey={slotKey}
                  video={video}
                  activeSlot={activeSlot}
                  incomingSlot={incomingSlot}
                  incomingY={incomingY}
                  dragY={dragY}
                />
              </GestureDetector>
            );
          }

          return (
            <StackedCard
              key={slotKey}
              slotKey={slotKey}
              video={video}
              activeSlot={activeSlot}
              incomingSlot={incomingSlot}
              incomingY={incomingY}
              dragY={dragY}
            />
          );
        })}

        {/* Auto-scroll progress bar — overlaid at the top of the active card */}
        <Animated.View
          style={[styles.autoProgressTrack, autoProgressTrackStyle]}
          pointerEvents="none"
        >
          <Animated.View
            style={[
              styles.autoProgressBar,
              { backgroundColor: theme.colors.accent },
              autoProgressBarStyle,
            ]}
          />
        </Animated.View>
      </View>
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
  counterCurrent: {
    fontWeight: '600',
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

  // ── Card stack container ──
  // No overflow:hidden — the peeking cards below are part of the visual.
  // Height = active card + 3 peek zones (visible slots 1–3).
  cardsContainer: {
    alignSelf: 'center',
    width: CARD_WIDTH,
    height: CARD_HEIGHT + (SLOT_COUNT - 2) * SLOT_OFFSET,
  },

  // ── Auto-scroll progress indicator ──
  // Sits at the top of the card stack, above all cards (via absolute positioning)
  autoProgressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    zIndex: 100,
  },
  autoProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
});
