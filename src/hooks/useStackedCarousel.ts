import { useCallback, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const THROW_THRESHOLD = 120;
// Visual constants – tuned so bottom cards peek ~45 px below the top card
export const SLOT_OFFSET = 58; // px shift per slot (translateY)
export const SLOT_SCALE = 0.04; // scale reduction per slot
export const SLOT_OPACITY_STEP = 0.15; // opacity reduction per slot

interface UseStackedCarouselParams {
  total: number;
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

export interface UseStackedCarouselResult {
  dragY: SharedValue<number>;
  gesture: ReturnType<typeof Gesture.Pan>;
  resetAnimation: () => void;
}

/**
 * Manages the vertical drag gesture and shared animation values for a
 * stacked-card carousel.
 *
 * - Swipe UP  past threshold → throws top card off-screen, calls onNext()
 * - Swipe DOWN past threshold → throws top card down, calls onPrev()
 * - Below threshold → springs back to rest
 * - Rubber-band resistance at first/last card
 *
 * The caller is responsible for resetting the animation (via resetAnimation())
 * after currentIndex changes, ideally inside a useLayoutEffect.
 */
export function useStackedCarousel({
  total,
  currentIndex,
  onNext,
  onPrev,
}: UseStackedCarouselParams): UseStackedCarouselResult {
  const dragY = useSharedValue(0);
  const isBusy = useSharedValue(false);

  // Keep shared mirrors of JS-thread props so worklets always see the latest values
  const currentIndexSV = useSharedValue(currentIndex);
  const totalSV = useSharedValue(total);

  useEffect(() => {
    currentIndexSV.value = currentIndex;
  }, [currentIndex, currentIndexSV]);

  useEffect(() => {
    totalSV.value = total;
  }, [total, totalSV]);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (isBusy.value) return;

      let dy = e.translationY;

      // Rubber-band at boundaries
      if (dy < 0 && currentIndexSV.value >= totalSV.value - 1) {
        dy *= 0.15;
      } else if (dy > 0 && currentIndexSV.value <= 0) {
        dy *= 0.15;
      }

      dragY.value = dy;
    })
    .onEnd(() => {
      if (isBusy.value) return;

      const dy = dragY.value;
      const canGoNext = currentIndexSV.value < totalSV.value - 1;
      const canGoPrev = currentIndexSV.value > 0;

      if (dy < -THROW_THRESHOLD && canGoNext) {
        isBusy.value = true;
        dragY.value = withTiming(
          -(SCREEN_HEIGHT + 120),
          { duration: 280 },
          (done) => {
            if (done) runOnJS(onNext)();
          },
        );
      } else if (dy > THROW_THRESHOLD && canGoPrev) {
        isBusy.value = true;
        dragY.value = withTiming(
          SCREEN_HEIGHT + 120,
          { duration: 280 },
          (done) => {
            if (done) runOnJS(onPrev)();
          },
        );
      } else {
        dragY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  // Called by the parent after currentIndex updates (via useLayoutEffect) so
  // the new top card starts from rest without a visible flash.
  const resetAnimation = useCallback(() => {
    dragY.value = 0;
    isBusy.value = false;
  }, [dragY, isBusy]);

  return { dragY, gesture, resetAnimation };
}
