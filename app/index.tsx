import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../src/hooks/useTheme';

export default function HomeScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Stackrl</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Votre gestionnaire de playlists vidéo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
  },
});
