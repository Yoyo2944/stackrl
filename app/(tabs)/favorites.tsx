import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/stores/useAppStore';
import type { Video } from '../../src/types';

type FavoriteVideo = Video & { playlistId: string; playlistName: string };

function VideoItem({ item }: { item: FavoriteVideo }) {
  const { colors, radius } = useTheme();

  return (
    <Pressable
      onPress={() => router.push(`/video/${item.id}`)}
      style={({ pressed }) => [
        itemStyles.row,
        {
          backgroundColor: colors.card,
          borderRadius: radius.md,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View
        style={[
          itemStyles.thumb,
          { backgroundColor: colors.surface, borderRadius: radius.sm },
        ]}
      />
      <View style={itemStyles.info}>
        <Text
          style={[itemStyles.title, { color: colors.text }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text style={[itemStyles.playlist, { color: colors.accent }]}>
          {item.playlistName}
        </Text>
        <Text style={[itemStyles.source, { color: colors.textMuted }]}>
          {item.source}
        </Text>
      </View>
    </Pressable>
  );
}

export default function FavoritesScreen() {
  const { colors } = useTheme();
  const playlists = useAppStore((s) => s.playlists);

  const favorites: FavoriteVideo[] = playlists.flatMap((p) =>
    p.videos
      .filter((v) => v.isFavorite)
      .map((v) => ({ ...v, playlistId: p.id, playlistName: p.name }))
  );

  if (favorites.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyIcon, { color: colors.textMuted }]}>♡</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Aucun favori
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Marque des vidéos comme favorites pour les retrouver ici
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VideoItem item={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={[styles.count, { color: colors.textSecondary }]}>
            {favorites.length} vidéo{favorites.length > 1 ? 's' : ''} en favori
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 8,
    paddingBottom: 100,
  },
  count: {
    fontSize: 13,
    marginBottom: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

const itemStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  thumb: {
    width: 80,
    height: 52,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  playlist: {
    fontSize: 12,
    fontWeight: '500',
  },
  source: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
});
