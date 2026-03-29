import { Platform } from 'react-native';

// ─── Color tokens ─────────────────────────────────────────────────────────────

const darkColors = {
  // Backgrounds
  background: '#1A1D2E',
  surface: '#252838',
  card: '#2D3147',
  // Accent
  accent: '#6C63FF',
  accentDim: 'rgba(108, 99, 255, 0.15)',
  // Text
  text: '#FFFFFF',
  textSecondary: '#A8AABB',
  textMuted: '#5C5E72',
  // Borders
  border: '#363952',
  borderSubtle: '#2A2D40',
  // States
  success: '#4ADE80',
  warning: '#FB923C',
  danger: '#F87171',
  // Thumbnail overlay
  thumbnailOverlay: 'rgba(0, 0, 0, 0.7)',
  // Misc
  overlay: 'rgba(0, 0, 0, 0.5)',
  tabBarBackground: '#1E2133',
} as const;

const lightColors = {
  // Backgrounds
  background: '#F5F5F7',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  // Accent
  accent: '#5A52E0',
  accentDim: 'rgba(90, 82, 224, 0.1)',
  // Text
  text: '#0F1020',
  textSecondary: '#5C5E72',
  textMuted: '#A8AABB',
  // Borders
  border: '#E2E4EF',
  borderSubtle: '#ECEDF5',
  // States
  success: '#16A34A',
  warning: '#EA580C',
  danger: '#DC2626',
  // Thumbnail overlay
  thumbnailOverlay: 'rgba(0, 0, 0, 0.7)',
  // Misc
  overlay: 'rgba(0, 0, 0, 0.3)',
  tabBarBackground: '#FFFFFF',
} as const;

export type ColorTokens = typeof darkColors;

export const THEME_COLORS = {
  dark: darkColors,
  light: lightColors,
} as const;

// Backward-compat alias (maps old COLORS shape to new tokens)
export const COLORS = {
  dark: {
    ...darkColors,
    primary: darkColors.accent,
    accent: '#FF6584',
    surfaceElevated: '#2D3147',
    error: darkColors.danger,
  },
  light: {
    ...lightColors,
    primary: lightColors.accent,
    accent: '#FF6584',
    surfaceElevated: lightColors.card,
    error: lightColors.danger,
  },
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  display: 36,
} as const;

export const FONT_WEIGHTS = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const LINE_HEIGHTS = {
  xs: 16,
  sm: 18,
  md: 22,
  lg: 24,
  xl: 28,
  xxl: 36,
  display: 44,
} as const;

export type Typography = {
  fontSizes: typeof FONT_SIZES;
  fontWeights: typeof FONT_WEIGHTS;
  lineHeights: typeof LINE_HEIGHTS;
};

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const SPACING = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  // Named aliases
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

const iosShadow = (color: string, opacity: number, radius: number, y: number) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: y },
  shadowOpacity: opacity,
  shadowRadius: radius,
});

export const SHADOWS = {
  card: Platform.select({
    ios: iosShadow('#000', 0.12, 8, 2),
    android: { elevation: 3 },
    default: {},
  })!,
  cardElevated: Platform.select({
    ios: iosShadow('#000', 0.2, 16, 6),
    android: { elevation: 8 },
    default: {},
  })!,
  none: {},
} as const;

// ─── Full theme object ────────────────────────────────────────────────────────

export type ThemeMode = 'dark' | 'light';

export type Theme = {
  mode: ThemeMode;
  colors: ColorTokens;
  fontSizes: typeof FONT_SIZES;
  fontWeights: typeof FONT_WEIGHTS;
  lineHeights: typeof LINE_HEIGHTS;
  spacing: typeof SPACING;
  radius: typeof RADIUS;
  shadows: typeof SHADOWS;
};

export function buildTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: THEME_COLORS[mode],
    fontSizes: FONT_SIZES,
    fontWeights: FONT_WEIGHTS,
    lineHeights: LINE_HEIGHTS,
    spacing: SPACING,
    radius: RADIUS,
    shadows: SHADOWS,
  };
}
