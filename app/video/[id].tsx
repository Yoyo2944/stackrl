import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/stores/useAppStore';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 18L9 12L15 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HeartIcon({ color, filled }: { color: string; filled: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path
        d="M12 20.35L10.55 19.03C5.4 14.36 2 11.27 2 7.5C2 4.41 4.42 2 7.5 2C9.24 2 10.91 2.81 12 4.08C13.09 2.81 14.76 2 16.5 2C19.58 2 22 4.41 22 7.5C22 11.27 18.6 14.36 13.45 19.03L12 20.35Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function VideoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Find the video across all playlists
  const { video, playlistId } = useAppStore((s) => {
    for (const p of s.playlists) {
      const v = p.videos.find((v) => v.id === id);
      if (v) return { video: v, playlistId: p.id };
    }
    return { video: null, playlistId: null };
  });

  const toggleFavorite = useAppStore((s) => s.toggleFavorite);

  if (!video || !playlistId) {
    return (
      <View style={[styles.root, { backgroundColor: '#000' }]}>
        <StatusBar barStyle="light-content" />
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { top: insets.top + 8 }]}
        >
          <BackIcon color="#FFF" />
        </Pressable>
        <Text style={styles.notFound}>Vidéo introuvable</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: '#000' }]}>
      <StatusBar barStyle="light-content" />

      {/* Video placeholder (full screen) */}
      <View style={styles.player}>
        <Text style={styles.playerPlaceholder}>▶</Text>
      </View>

      {/* Controls overlay */}
      <View
        style={[
          styles.overlay,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 },
        ]}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <BackIcon color="#FFF" />
          </Pressable>
          <Pressable
            onPress={() => toggleFavorite(playlistId, video.id)}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <HeartIcon color={colors.accent} filled={video.isFavorite} />
          </Pressable>
        </View>

        {/* Bottom info */}
        <View
          style={[
            styles.info,
            { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12 },
          ]}
        >
          <Text style={styles.title} numberOfLines={2}>
            {video.title}
          </Text>
          <Text style={styles.source}>{video.source}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  player: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  playerPlaceholder: {
    fontSize: 64,
    color: 'rgba(255,255,255,0.3)',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 16,
    gap: 6,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  source: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  notFound: {
    color: '#FFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});
