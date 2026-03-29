import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Theme, ViewMode } from '../types';

interface SettingsState {
  theme: Theme;
  defaultViewMode: ViewMode;
  isOnboarded: boolean;
  setTheme: (theme: Theme) => void;
  setDefaultViewMode: (mode: ViewMode) => void;
  setOnboarded: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      defaultViewMode: 'list',
      isOnboarded: false,

      setTheme: (theme) => set({ theme }),
      setDefaultViewMode: (defaultViewMode) => set({ defaultViewMode }),
      setOnboarded: (isOnboarded) => set({ isOnboarded }),
    }),
    {
      name: 'stackrl-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
