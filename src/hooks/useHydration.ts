import { useEffect, useState } from 'react';
import { useVideoStore } from '../stores/useVideoStore';
import { usePlaylistStore } from '../stores/usePlaylistStore';
import { useSettingsStore } from '../stores/useSettingsStore';

/**
 * Retourne `true` une fois que les 3 stores persistés ont fini
 * de se réhydrater depuis AsyncStorage.
 *
 * Usage dans le layout racine :
 *   const hydrated = useHydration()
 *   if (!hydrated) return <SplashScreen />
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(() => {
    // Si les stores sont déjà hydratés (hot-reload / SSR-like), on part à true
    return (
      useVideoStore.persist.hasHydrated() &&
      usePlaylistStore.persist.hasHydrated() &&
      useSettingsStore.persist.hasHydrated()
    );
  });

  useEffect(() => {
    if (hydrated) return;

    let pending = 3;

    const onDone = () => {
      pending -= 1;
      if (pending === 0) setHydrated(true);
    };

    const unsubVideo = useVideoStore.persist.onFinishHydration(onDone);
    const unsubPlaylist = usePlaylistStore.persist.onFinishHydration(onDone);
    const unsubSettings = useSettingsStore.persist.onFinishHydration(onDone);

    // Double-check : si hydratation déjà terminée entre le render et useEffect
    if (
      useVideoStore.persist.hasHydrated() &&
      usePlaylistStore.persist.hasHydrated() &&
      useSettingsStore.persist.hasHydrated()
    ) {
      setHydrated(true);
    }

    return () => {
      unsubVideo();
      unsubPlaylist();
      unsubSettings();
    };
  }, [hydrated]);

  return hydrated;
}
