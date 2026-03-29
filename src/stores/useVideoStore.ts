import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Video } from '../types';

interface VideoState {
  videos: Record<string, Video>;
  addVideo: (video: Video) => void;
  removeVideo: (id: string) => void;
  updateVideo: (id: string, updates: Partial<Video>) => void;
  toggleFavorite: (id: string) => void;
  getVideoById: (id: string) => Video | undefined;
  getVideosByIds: (ids: string[]) => Video[];
}

export const useVideoStore = create<VideoState>()(
  persist(
    (set, get) => ({
      videos: {},

      addVideo: (video) =>
        set((state) => ({
          videos: { ...state.videos, [video.id]: video },
        })),

      removeVideo: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.videos;
          return { videos: rest };
        }),

      updateVideo: (id, updates) =>
        set((state) => {
          const video = state.videos[id];
          if (!video) return state;
          return {
            videos: { ...state.videos, [id]: { ...video, ...updates } },
          };
        }),

      toggleFavorite: (id) =>
        set((state) => {
          const video = state.videos[id];
          if (!video) return state;
          return {
            videos: {
              ...state.videos,
              [id]: { ...video, isFavorite: !video.isFavorite },
            },
          };
        }),

      getVideoById: (id) => get().videos[id],

      getVideosByIds: (ids) => {
        const { videos } = get();
        return ids.flatMap((id) => (videos[id] ? [videos[id]] : []));
      },
    }),
    {
      name: 'stackrl-videos',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
