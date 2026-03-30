import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Video } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Constants ────────────────────────────────────────────────────────────────

export const SLOT_COUNT = 5;          // slots always mounted (4 visible + 1 preloaded)
export const VISIBLE_SLOTS = 4;       // deck positions 0–3
export const CARD_HEIGHT_RATIO = 0.62;
export const SLOT_OFFSET = 90;        // px between successive peeks
export const SLOT_SCALE = 0.04;       // scale reduction per deck level
export const THROW_THRESHOLD = 100;   // px drag before committing throw
export const THROW_DURATION = 280;    // ms for throw animation
export const THROW_OUT_Y = SCREEN_HEIGHT + 200;
export const OVERLAY_OPACITY = [0, 0.15, 0.3, 0.45]; // per deck position 0–3
export const AUTO_SCROLL_NORMAL = 1200;  // ms between cards (method 2)
export const AUTO_SCROLL_HEAVY = 400;    // ms between cards (method 3)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UseStackedDeckResult {
  // Shared values – passed to cards for worklet-only animation
  dragY: SharedValue<number>;
  activeSlot: SharedValue<number>;
  incomingSlot: SharedValue<number>;
  incomingY: SharedValue<number>;
  autoProgress: SharedValue<number>;
  isAutoScrolling: SharedValue<boolean>;
  isHeavyMode: SharedValue<boolean>;
  // JS-thread state – used by StackedCardView for rendering
  currentIndex: number;
  activeSlotIndex: number;               // which slot key is currently at deck position 0
  slotVideoIndices: (number | null)[];   // slot key → video index or null
  // Composed gesture to attach to the top card
  gesture: ReturnType<typeof Gesture.Simultaneous>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useStackedDeck(
  videos: Video[],
  initialIndex = 0,
): UseStackedDeckResult {
  // ── JS-thread state ──
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [activeSlotJS, setActiveSlotJS] = useState(0);

  // Tracks a temporary video override for the incoming slot during backward animation.
  // The slot at (activeSlotJS-1) is normally showing a "future" video, but for backward
  // we override it to show the previous video before the animation starts.
  const [backwardOverride, setBackwardOverride] = useState<{
    slot: number;
    index: number;
  } | null>(null);

  // Stable JS-thread refs — used by runOnJS callbacks (JS thread only)
  const currentIndexRef = useRef(currentIndex);
  const activeSlotJSRef = useRef(activeSlotJS);
  useLayoutEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useLayoutEffect(() => { activeSlotJSRef.current = activeSlotJS; }, [activeSlotJS]);

  // ── Shared values ──
  const dragY = useSharedValue(0);
  const isBusy = useSharedValue(false);
  const activeSlot = useSharedValue(0);      // mirrors activeSlotJS on UI thread
  const incomingSlot = useSharedValue(-1);   // slot key of incoming card during backward (-1=none)
  const incomingY = useSharedValue(0);       // translateY for the incoming (backward) card
  const autoProgress = useSharedValue(0);    // 0→1, drives the progress bar
  const isAutoScrolling = useSharedValue(false);
  const isHeavyMode = useSharedValue(false);
  // Worklet-accessible mirrors so pan/longPress worklets can check bounds
  const currentIndexSV = useSharedValue(initialIndex);
  const videosLenSV = useSharedValue(videos.length);

  useLayoutEffect(() => { currentIndexSV.value = currentIndex; }, [currentIndex, currentIndexSV]);
  useLayoutEffect(() => { videosLenSV.value = videos.length; }, [videos.length, videosLenSV]);
  useLayoutEffect(() => { activeSlot.value = activeSlotJS; }, [activeSlotJS, activeSlot]);

  // ── Slot video index computation ──
  const slotVideoIndices = useMemo<(number | null)[]>(() => {
    const indices: (number | null)[] = Array(SLOT_COUNT).fill(null);
    for (let s = 0; s < SLOT_COUNT; s++) {
      const dp = (s - activeSlotJS + SLOT_COUNT) % SLOT_COUNT;
      const vi = currentIndex + dp;
      indices[s] = vi >= 0 && vi < videos.length ? vi : null;
    }
    // Override for backward preload: the incoming slot shows the previous video
    // before currentIndex decrements, so there's no visible glitch.
    if (backwardOverride) {
      const { slot, index } = backwardOverride;
      indices[slot] = index >= 0 && index < videos.length ? index : null;
    }
    return indices;
  }, [currentIndex, activeSlotJS, videos.length, backwardOverride]);

  // ── Transition completion callbacks ──
  // These run on the JS thread (called via runOnJS) after throw animations finish.

  const completeForwardTransition = useCallback(() => {
    setCurrentIndex((i) => i + 1);
    setActiveSlotJS((s) => (s + 1) % SLOT_COUNT);
    setBackwardOverride(null);
  }, []);

  const completeBackwardTransition = useCallback(() => {
    setCurrentIndex((i) => i - 1);
    setActiveSlotJS((s) => (s - 1 + SLOT_COUNT) % SLOT_COUNT);
    setBackwardOverride(null);
  }, []);

  // ── Auto-scroll ──
  // Defined before startProgressCycle so we can reference it directly.

  // Stable ref for triggerAutoNext — avoids stale closures across re-renders
  const triggerAutoNextRef = useRef<() => void>();

  const triggerAutoNext = useCallback(() => {
    if (!isAutoScrolling.value) return;
    if (isBusy.value) return;
    if (currentIndexRef.current >= videosLenSV.value - 1) {
      // Reached end — stop auto-scroll
      isAutoScrolling.value = false;
      isHeavyMode.value = false;
      autoProgress.value = withTiming(0, { duration: 200 });
      return;
    }
    isBusy.value = true;
    dragY.value = withTiming(-THROW_OUT_Y, { duration: THROW_DURATION }, (finished) => {
      'worklet';
      if (finished) runOnJS(completeForwardTransition)();
    });
  }, [dragY, isBusy, isAutoScrolling, isHeavyMode, autoProgress, videosLenSV, completeForwardTransition]);

  useLayoutEffect(() => { triggerAutoNextRef.current = triggerAutoNext; }, [triggerAutoNext]);

  // Stable proxy so the withTiming worklet callback always calls the latest triggerAutoNext.
  // Worklets capture function references at withTiming call time, so we delegate through
  // a stable wrapper that reads from the ref on the JS thread.
  const stableTriggerAutoNext = useCallback(() => {
    triggerAutoNextRef.current?.();
  }, []); // intentionally empty deps — this function is stable for the lifetime of the hook

  // Stable ref for startProgressCycle to allow re-entrant calls (e.g. after transition reset)
  const startProgressCycleRef = useRef<() => void>();

  const startProgressCycle = useCallback(() => {
    const duration = isHeavyMode.value ? AUTO_SCROLL_HEAVY : AUTO_SCROLL_NORMAL;
    autoProgress.value = 0;
    autoProgress.value = withTiming(1, { duration }, (finished) => {
      'worklet';
      if (finished && isAutoScrolling.value) {
        runOnJS(stableTriggerAutoNext)();
      }
    });
  }, [autoProgress, isHeavyMode, isAutoScrolling, stableTriggerAutoNext]);

  useLayoutEffect(() => { startProgressCycleRef.current = startProgressCycle; }, [startProgressCycle]);

  // ── Reset after any transition ──
  // Runs after re-render caused by completeForward/BackwardTransition.
  // Resets shared values to rest state and restarts auto-scroll if active.
  useLayoutEffect(() => {
    dragY.value = 0;
    isBusy.value = false;
    incomingSlot.value = -1;
    incomingY.value = 0;
    if (isAutoScrolling.value) {
      startProgressCycleRef.current?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, activeSlotJS]); // intentionally limited deps

  // ── Backward transition initiator ──
  // Called from JS thread (via runOnJS from pan.onEnd).
  // Preloads the previous video into the incoming slot, then starts both animations.
  const initiateBackwardTransition = useCallback(() => {
    if (isBusy.value) return;
    const prevIndex = currentIndexRef.current - 1;
    if (prevIndex < 0) return;

    // The slot that will become the new active card
    const targetSlot = (activeSlotJSRef.current - 1 + SLOT_COUNT) % SLOT_COUNT;

    // Override that slot's video to the previous video while it's off-screen (deckPos 4)
    setBackwardOverride({ slot: targetSlot, index: prevIndex });

    isBusy.value = true;
    incomingSlot.value = targetSlot;
    incomingY.value = -THROW_OUT_Y;

    // Outgoing card slides down; incoming card slides in from the top simultaneously
    dragY.value = withTiming(THROW_OUT_Y, { duration: THROW_DURATION }, (finished) => {
      'worklet';
      if (finished) runOnJS(completeBackwardTransition)();
    });
    incomingY.value = withTiming(0, { duration: THROW_DURATION });
  }, [isBusy, incomingSlot, incomingY, dragY, completeBackwardTransition]);

  // ── Haptic + auto-scroll control ──

  const startAutoScroll = useCallback(() => {
    isAutoScrolling.value = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    startProgressCycleRef.current?.();
  }, [isAutoScrolling]);

  const activateHeavyMode = useCallback(() => {
    if (!isAutoScrolling.value) return;
    isHeavyMode.value = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Cancel the running cycle and restart at the faster rate.
    // Assigning a new value to a shared value cancels its running animation in Reanimated.
    autoProgress.value = 0;
    startProgressCycleRef.current?.();
  }, [isAutoScrolling, isHeavyMode, autoProgress]);

  const stopAutoScroll = useCallback(() => {
    isAutoScrolling.value = false;
    isHeavyMode.value = false;
    autoProgress.value = withTiming(0, { duration: 200 });
  }, [isAutoScrolling, isHeavyMode, autoProgress]);

  // ── Pan gesture (method 1: swipe) ──
  // Rubber-band resistance at the first/last card.
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      if (isBusy.value) return;

      let dy = e.translationY;

      if (dy > 0 && currentIndexSV.value <= 0) {
        dy *= 0.15; // rubber-band at start of playlist
      }
      if (dy < 0 && currentIndexSV.value >= videosLenSV.value - 1) {
        dy *= 0.15; // rubber-band at end of playlist
      }

      dragY.value = dy;
    })
    .onEnd(() => {
      'worklet';
      if (isBusy.value) return;

      const dy = dragY.value;
      const canNext = currentIndexSV.value < videosLenSV.value - 1;
      const canPrev = currentIndexSV.value > 0;

      if (dy < -THROW_THRESHOLD && canNext) {
        isBusy.value = true;
        dragY.value = withTiming(-THROW_OUT_Y, { duration: THROW_DURATION }, (finished) => {
          'worklet';
          if (finished) runOnJS(completeForwardTransition)();
        });
      } else if (dy > THROW_THRESHOLD && canPrev) {
        // Delegate to JS thread — needs to update backwardOverride React state first
        runOnJS(initiateBackwardTransition)();
      } else {
        dragY.value = withSpring(0, { damping: 18, stiffness: 200 });
      }
    });

  // ── Long-press gestures (methods 2 and 3) ──
  // Gesture.Simultaneous is used because:
  //   - Pan activates on movement; LongPress activates on stationary hold
  //   - They don't naturally conflict, and Simultaneous lets both be recognised concurrently
  //   - Exclusive would cancel LongPress if the user shifts their finger slightly, which
  //     would break the "hold to auto-scroll" UX
  const longPress400 = Gesture.LongPress()
    .minDuration(400)
    .onStart(() => {
      'worklet';
      runOnJS(startAutoScroll)();
    })
    .onEnd(() => {
      'worklet';
      runOnJS(stopAutoScroll)();
    });

  const longPress800 = Gesture.LongPress()
    .minDuration(800)
    .onStart(() => {
      'worklet';
      runOnJS(activateHeavyMode)();
    });

  const gesture = Gesture.Simultaneous(pan, longPress400, longPress800);

  return {
    dragY,
    activeSlot,
    incomingSlot,
    incomingY,
    autoProgress,
    isAutoScrolling,
    isHeavyMode,
    currentIndex,
    activeSlotIndex: activeSlotJS,
    slotVideoIndices,
    gesture,
  };
}
