import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { usePlaylistStore } from '../../src/stores/usePlaylistStore';

// ─── Mock data (shown when store is empty) ────────────────────────────────────

const MOCK_SECTIONS = [
  {
    category: 'Gaming',
    playlists: [
      { id: 'm1', name: 'CS2 Highlights', count: 12 },
      { id: 'm2', name: 'Speedruns Any%', count: 8 },
      { id: 'm3', name: 'Tutorials FPS', count: 5 },
    ],
  },
  {
    category: 'Musique',
    playlists: [
      { id: 'm4', name: 'Chill Vibes', count: 20 },
      { id: 'm5', name: 'DJ Sets 2024', count: 7 },
      { id: 'm6', name: 'Covers Acoustique', count: 11 },
    ],
  },
  {
    category: 'Développement',
    playlists: [
      { id: 'm7', name: 'React Native', count: 15 },
      { id: 'm8', name: 'Rust pour débutants', count: 9 },
      { id: 'm9', name: 'System Design', count: 6 },
    ],
  },
];

type SectionItem = { id: string; name: string; count: number };
type Section = { category: string; playlists: SectionItem[] };

// ─── Playlist card ────────────────────────────────────────────────────────────

function PlaylistCard({
  item,
  onPress,
}: {
  item: SectionItem;
  onPress: () => void;
}) {
  const { colors, radius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [cardStyles.card, { opacity: pressed ? 0.75 : 1 }]}
    >
      <View
        style={[
          cardStyles.thumbnail,
          { backgroundColor: colors.card, borderRadius: radius.md },
        ]}
      />
      <Text
        style={[cardStyles.title, { color: colors.text }]}
        numberOfLines={2}
      >
        {item.name}
      </Text>
      <Text style={[cardStyles.count, { color: colors.textMuted }]}>
        {item.count} vidéo{item.count > 1 ? 's' : ''}
      </Text>
    </Pressable>
  );
}

// ─── Section row ──────────────────────────────────────────────────────────────

function SectionRow({ section }: { section: Section }) {
  const { colors } = useTheme();

  return (
    <View style={rowStyles.container}>
      <View style={rowStyles.header}>
        <Text style={[rowStyles.category, { color: colors.text }]}>
          {section.category}
        </Text>
        <Pressable hitSlop={8}>
          <Text style={[rowStyles.seeAll, { color: colors.accent }]}>
            Voir tout
          </Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={section.playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlaylistCard
            item={item}
            onPress={() => router.push(`/playlist/${item.id}`)}
          />
        )}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={rowStyles.cards}
      />
    </View>
  );
}

// ─── FAB ──────────────────────────────────────────────────────────────────────

function FAB() {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => router.push('/modals/create-playlist')}
      style={({ pressed }) => [
        fabStyles.btn,
        { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={fabStyles.icon}>+</Text>
    </Pressable>
  );
}

// ─── Home screen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { colors } = useTheme();
  const playlistsMap = usePlaylistStore((s) => s.playlists);
  const playlists = Object.values(playlistsMap);

  const sections: Section[] =
    playlists.length > 0
      ? Object.entries(
          playlists.reduce<Record<string, SectionItem[]>>((acc, p) => {
            const cat = p.category || 'Autre';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push({ id: p.id, name: p.name, count: p.videoIds.length });
            return acc;
          }, {})
        ).map(([category, ps]) => ({ category, playlists: ps }))
      : MOCK_SECTIONS;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={sections}
        keyExtractor={(item) => item.category}
        renderItem={({ item }) => <SectionRow section={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
      <FAB />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  list: {
    paddingTop: 16,
    paddingBottom: 100,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    width: 144,
  },
  thumbnail: {
    width: 144,
    height: 96,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  count: {
    fontSize: 11,
    marginTop: 2,
  },
});

const rowStyles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  category: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  cards: {
    paddingHorizontal: 12,
    gap: 12,
  },
});

const fabStyles = StyleSheet.create({
  btn: {
    position: 'absolute',
    bottom: 88,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  icon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
    marginTop: -2,
  },
});
