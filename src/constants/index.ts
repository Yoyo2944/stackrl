export {
  COLORS,
  THEME_COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  SPACING,
  RADIUS,
  SHADOWS,
  buildTheme,
} from './theme';

export type { Theme, ThemeMode, ColorTokens, Typography } from './theme';

export const BREAKPOINTS = {
  sm: 375,
  md: 768,
  lg: 1024,
} as const;

export const THUMBNAIL_RATIO = 16 / 9;
