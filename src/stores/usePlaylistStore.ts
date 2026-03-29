import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Playlist, ViewMode } from '../types';
import { generateId } from '../utils';

interface PlaylistState {
  playlists: Record<string, Playlist>;
  activePlaylistId: string | null;
  createPlaylist: (data: Omit<Playlist, 'id' | 'createdAt'>) => string;
  deletePlaylist: (id: string) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  addVideoToPlaylist: (playlistId: string, videoId: string) => void;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  reorderVideos: (playlistId: string, fromIndex: number, toIndex: number) => void;
  setViewMode: (playlistId: string, mode: ViewMode) => void;
  setActivePlaylist: (id: string) => void;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set) => ({
      playlists: {},
      activePlaylistId: null,

      createPlaylist: (data) => {
        const id = generateId();
        set((state) => ({
          playlists: {
            ...state.playlists,
            [id]: { ...data, id, createdAt: new Date().toISOString() },
          },
        }));
        return id;
      },

      deletePlaylist: (id) =>
        set((state) => {
          const { [id]: _, ...rest } = state.playlists;
          return {
            playlists: rest,
            activePlaylistId:
              state.activePlaylistId === id ? null : state.activePlaylistId,
          };
        }),

      updatePlaylist: (id, updates) =>
        set((state) => {
          const playlist = state.playlists[id];
          if (!playlist) return state;
          return {
            playlists: { ...state.playlists, [id]: { ...playlist, ...updates } },
          };
        }),

      addVideoToPlaylist: (playlistId, videoId) =>
        set((state) => {
          const playlist = state.playlists[playlistId];
          if (!playlist || playlist.videoIds.includes(videoId)) return state;
          return {
            playlists: {
              ...state.playlists,
              [playlistId]: {
                ...playlist,
                videoIds: [...playlist.videoIds, videoId],
              },
            },
          };
        }),

      removeVideoFromPlaylist: (playlistId, videoId) =>
        set((state) => {
          const playlist = state.playlists[playlistId];
          if (!playlist) return state;
          return {
            playlists: {
              ...state.playlists,
              [playlistId]: {
                ...playlist,
                videoIds: playlist.videoIds.filter((id) => id !== videoId),
              },
            },
          };
        }),

      reorderVideos: (playlistId, fromIndex, toIndex) =>
        set((state) => {
          const playlist = state.playlists[playlistId];
          if (!playlist) return state;
          const videoIds = [...playlist.videoIds];
          const [moved] = videoIds.splice(fromIndex, 1);
          videoIds.splice(toIndex, 0, moved);
          return {
            playlists: {
              ...state.playlists,
              [playlistId]: { ...playlist, videoIds },
            },
          };
        }),

      setViewMode: (playlistId, mode) =>
        set((state) => {
          const playlist = state.playlists[playlistId];
          if (!playlist) return state;
          return {
            playlists: {
              ...state.playlists,
              [playlistId]: { ...playlist, viewMode: mode },
            },
          };
        }),

      setActivePlaylist: (id) => set({ activePlaylistId: id }),
    }),
    {
      name: 'stackrl-playlists',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
