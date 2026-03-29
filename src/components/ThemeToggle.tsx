import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../stores/useAppStore';

interface ThemeToggleProps {
  size?: number;
}

export function ThemeToggle({ size = 22 }: ThemeToggleProps) {
  const { mode, colors } = useTheme();
  const updateSettings = useAppStore((state) => state.updateSettings);

  function toggle() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSettings({ theme: mode === 'dark' ? 'light' : 'dark' });
  }

  return (
    <Pressable
      onPress={toggle}
      style={({ pressed }) => [styles.btn, { opacity: pressed ? 0.6 : 1 }]}
      hitSlop={8}
    >
      <Ionicons
        name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
        size={size}
        color={colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 4,
  },
});
