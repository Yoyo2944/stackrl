import { Text, type TextProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import type { ColorTokens } from '../constants/theme';
import type { FONT_SIZES, FONT_WEIGHTS } from '../constants/theme';

type TextVariant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  size?: keyof typeof FONT_SIZES;
  weight?: keyof typeof FONT_WEIGHTS;
  colorKey?: keyof ColorTokens;
  secondary?: boolean;
  muted?: boolean;
}

const variantStyles: Record<TextVariant, {
  size: keyof typeof FONT_SIZES;
  weight: keyof typeof FONT_WEIGHTS;
}> = {
  display: { size: 'display', weight: 'bold' },
  title: { size: 'xl', weight: 'semibold' },
  subtitle: { size: 'lg', weight: 'medium' },
  body: { size: 'md', weight: 'regular' },
  caption: { size: 'sm', weight: 'regular' },
  label: { size: 'xs', weight: 'medium' },
};

export function ThemedText({
  variant = 'body',
  size,
  weight,
  colorKey,
  secondary = false,
  muted = false,
  style,
  ...props
}: ThemedTextProps) {
  const { colors, fontSizes, fontWeights, lineHeights } = useTheme();

  const resolved = variantStyles[variant];
  const finalSize = size ?? resolved.size;
  const finalWeight = weight ?? resolved.weight;

  const color = colorKey
    ? (colors[colorKey] as string)
    : muted
    ? colors.textMuted
    : secondary
    ? colors.textSecondary
    : colors.text;

  return (
    <Text
      style={[
        {
          fontSize: fontSizes[finalSize],
          fontWeight: fontWeights[finalWeight] as '400' | '500' | '600' | '700',
          lineHeight: lineHeights[finalSize] ?? undefined,
          color,
        },
        style,
      ]}
      {...props}
    />
  );
}
