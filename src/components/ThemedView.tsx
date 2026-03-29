import { View, type ViewProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import type { ColorTokens } from '../constants/theme';

type Surface = 'background' | 'surface' | 'card';

interface ThemedViewProps extends ViewProps {
  surface?: Surface;
  colorKey?: keyof ColorTokens;
}

export function ThemedView({
  surface = 'background',
  colorKey,
  style,
  ...props
}: ThemedViewProps) {
  const { colors } = useTheme();
  const bg = colorKey ? colors[colorKey] : colors[surface];

  return <View style={[{ backgroundColor: bg as string }, style]} {...props} />;
}
