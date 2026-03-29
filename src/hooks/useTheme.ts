import { useThemeContext } from '../context/ThemeContext';
import type { Theme } from '../constants/theme';

export function useTheme(): Theme & { colors: Theme['colors'] } {
  return useThemeContext();
}
