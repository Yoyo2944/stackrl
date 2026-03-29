import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, Playlist, Video } from '../types';
import { generateId } from '../utils';

interface AppState {
  // Data
  playlists: Playlist[];
  // Settings
  settings: AppSettings;
  // Actions — playlists
  addPlaylist: (playlist: Omit<Playlist, 'id' | 'createdAt' | 'videos'>) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  // Actions — videos
  addVideoToPlaylist: (playlistId: string, video: Omit<Video, 'id' | 'addedAt' | 'isFavorite'>) => void;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  toggleFavorite: (playlistId: string, videoId: string) => void;
  // Actions — settings
  updateSettings: (updates: Partial<AppSettings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      playlists: [],
      settings: {
        theme: 'dark',
        defaultViewMode: 'list',
      },

      addPlaylist: (data) =>
        set((state) => ({
          playlists: [
            ...state.playlists,
            {
              ...data,
              id: generateId(),
              videos: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updatePlaylist: (id, updates) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),

      deletePlaylist: (id) =>
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id),
        })),

      addVideoToPlaylist: (playlistId, videoData) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? {
                  ...p,
                  videos: [
                    ...p.videos,
                    {
                      ...videoData,
                      id: generateId(),
                      addedAt: new Date().toISOString(),
                      isFavorite: false,
                    },
                  ],
                }
              : p,
          ),
        })),

      removeVideoFromPlaylist: (playlistId, videoId) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, videos: p.videos.filter((v) => v.id !== videoId) }
              : p,
          ),
        })),

      toggleFavorite: (playlistId, videoId) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? {
                  ...p,
                  videos: p.videos.map((v) =>
                    v.id === videoId ? { ...v, isFavorite: !v.isFavorite } : v,
                  ),
                }
              : p,
          ),
        })),

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),
    }),
    {
      name: 'stackrl-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
