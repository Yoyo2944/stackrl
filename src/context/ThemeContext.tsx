import React, { createContext, useContext, useMemo } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { buildTheme } from '../constants/theme';
import type { Theme } from '../constants/theme';

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useAppStore((state) => state.settings.theme);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used inside <ThemeProvider>');
  return ctx;
}
