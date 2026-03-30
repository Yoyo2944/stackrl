import React, { memo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { Video } from '@/types';
import {
  SLOT_COUNT,
  VISIBLE_SLOTS,
  SLOT_OFFSET,
  SLOT_SCALE,
  THROW_THRESHOLD,
  OVERLAY_OPACITY,
  CARD_HEIGHT_RATIO,
} from '@/hooks/useStackedDeck';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export const CARD_WIDTH = SCREEN_WIDTH - 32;
export const CARD_HEIGHT = Math.round(SCREEN_HEIGHT * CARD_HEIGHT_RATIO);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StackedCardProps {
  slotKey: number; // 0–4, stable React key — never changes
  video: Video | null;
  activeSlot: SharedValue<number>;
  incomingSlot: SharedValue<number>;
  incomingY: SharedValue<number>;
  dragY: SharedValue<number>;
}

// ─── Component ────────────────────────────────────────────────────────────────

function StackedCardInner({
  slotKey,
  video,
  activeSlot,
  incomingSlot,
  incomingY,
  dragY,
}: StackedCardProps) {
  // ── Card wrapper: translateY + scale + zIndex ──
  const cardStyle = useAnimatedStyle(() => {
    'worklet';

    const isIncoming = slotKey === incomingSlot.value;

    // During backward animation this slot enters from above independently
    if (isIncoming) {
      return {
        transform: [{ translateY: incomingY.value }, { scale: 1 }],
        zIndex: VISIBLE_SLOTS + 1,
        opacity: 1,
      };
    }

    const deckPos = (slotKey - activeSlot.value + SLOT_COUNT) % SLOT_COUNT;

    // Preloaded slot: fully hidden below visible area
    if (deckPos >= VISIBLE_SLOTS) {
      return {
        transform: [
          { translateY: CARD_HEIGHT + (deckPos - 1) * SLOT_OFFSET },
          { scale: 1 - deckPos * SLOT_SCALE },
        ],
        zIndex: 0,
        opacity: 0,
      };
    }

    const drag = dragY.value;

    if (deckPos === 0) {
      // Active card: follows finger directly
      return {
        transform: [{ translateY: drag }, { scale: 1 }],
        zIndex: VISIBLE_SLOTS,
        opacity: 1,
      };
    }

    // Lower cards: interpolate toward promoted position during forward drag
    const forwardProgress = drag < 0 ? Math.min(1, -drag / THROW_THRESHOLD) : 0;

    // Base position: card TOP starts right below the card above it
    // deckPos 1 → top at CARD_HEIGHT; deckPos 2 → CARD_HEIGHT+SLOT_OFFSET, etc.
    const baseY = CARD_HEIGHT + (deckPos - 1) * SLOT_OFFSET;
    const promotedY = deckPos === 1 ? 0 : CARD_HEIGHT + (deckPos - 2) * SLOT_OFFSET;

    const baseScale = 1 - deckPos * SLOT_SCALE;
    const promotedScale = 1 - (deckPos - 1) * SLOT_SCALE;

    const translateY = baseY + (promotedY - baseY) * forwardProgress;
    const scale = baseScale + (promotedScale - baseScale) * forwardProgress;

    return {
      transform: [{ translateY }, { scale }],
      zIndex: VISIBLE_SLOTS - deckPos,
      opacity: 1,
    };
  });

  // ── Darkening overlay ──
  const overlayStyle = useAnimatedStyle(() => {
    'worklet';

    if (slotKey === incomingSlot.value) {
      return { opacity: 0 };
    }

    const deckPos = (slotKey - activeSlot.value + SLOT_COUNT) % SLOT_COUNT;
    if (deckPos === 0 || deckPos >= VISIBLE_SLOTS) {
      return { opacity: 0 };
    }

    const drag = dragY.value;
    const forwardProgress = drag < 0 ? Math.min(1, -drag / THROW_THRESHOLD) : 0;

    const baseOpacity = OVERLAY_OPACITY[deckPos] ?? 0.45;
    const promotedOpacity = OVERLAY_OPACITY[deckPos - 1] ?? 0;
    const opacity = baseOpacity + (promotedOpacity - baseOpacity) * forwardProgress;

    return { opacity };
  });

  // ── Top peek bandeau (visible when deckPos > 0) ──
  const topBandeauStyle = useAnimatedStyle(() => {
    'worklet';

    if (slotKey === incomingSlot.value) {
      return { opacity: 0 };
    }

    const deckPos = (slotKey - activeSlot.value + SLOT_COUNT) % SLOT_COUNT;

    if (deckPos === 0 || deckPos >= VISIBLE_SLOTS) {
      return { opacity: 0 };
    }

    // Fade the bandeau out as the card is promoted to the active position
    const drag = dragY.value;
    const forwardProgress = drag < 0 ? Math.min(1, -drag / THROW_THRESHOLD) : 0;

    // When this card reaches deckPos 0 (promoted), bandeau should disappear
    const opacity = deckPos === 1 ? 1 - forwardProgress : 1;
    return { opacity };
  });

  // ── Bottom info area (visible only for the active card, deckPos === 0) ──
  const bottomInfoStyle = useAnimatedStyle(() => {
    'worklet';

    if (slotKey === incomingSlot.value) {
      return { opacity: 1 };
    }

    const deckPos = (slotKey - activeSlot.value + SLOT_COUNT) % SLOT_COUNT;
    if (deckPos !== 0) {
      return { opacity: 0 };
    }

    // Fade out the bottom info when swiping up (the card is leaving)
    const drag = dragY.value;
    const leavingProgress = drag < 0 ? Math.min(1, -drag / THROW_THRESHOLD) : 0;
    return { opacity: 1 - leavingProgress * 0.6 };
  });

  if (!video) return null;

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <ImageBackground
        source={{ uri: video.thumbnail }}
        style={styles.thumbnail}
        imageStyle={styles.thumbnailImage}
        resizeMode="cover"
      >
        {/* ── Top peek bandeau ── */}
        {/* Positioned at the bottom of the visible ~90px peek zone so users can
            read the title of the card below without scrolling */}
        <Animated.View style={[styles.topBandeau, topBandeauStyle]} pointerEvents="none">
          <Text style={styles.topBandeauText} numberOfLines={1}>
            {video.title}
          </Text>
        </Animated.View>

        {/* ── Darkening overlay (increases with deck depth) ── */}
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}
          pointerEvents="none"
        />

        {/* ── Bottom info (active card only) ── */}
        <Animated.View style={[styles.bottomInfoWrap, bottomInfoStyle]} pointerEvents="none">
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.82)']}
            locations={[0, 0.5, 1]}
            style={styles.gradient}
          >
            <View style={styles.sourceRow}>
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceBadgeText}>{video.source.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {video.title}
            </Text>
            <Text style={styles.duration}>{formatDuration(video.duration)}</Text>
          </LinearGradient>
        </Animated.View>
      </ImageBackground>
    </Animated.View>
  );
}

// React.memo: the card only re-renders when its video prop changes.
// All animation is handled on the UI thread via shared values — no JS re-renders needed.
export const StackedCard = memo(StackedCardInner);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
  thumbnail: {
    flex: 1,
  },
  thumbnailImage: {
    borderRadius: 20,
  },
  overlay: {
    backgroundColor: '#000',
    borderRadius: 20,
  },

  // ── Top peek bandeau ──
  // Positioned at Y = (SLOT_OFFSET - 28) so its bottom edge aligns with the bottom
  // of the 90px peek zone. The user sees "thumbnail + title strip" in each peek.
  topBandeau: {
    position: 'absolute',
    top: SLOT_OFFSET - 28,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  topBandeauText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },

  // ── Bottom info ──
  bottomInfoWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 24,
    gap: 6,
  },
  sourceRow: {
    flexDirection: 'row',
  },
  sourceBadge: {
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
  duration: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
});
