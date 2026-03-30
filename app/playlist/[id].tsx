import { useMemo } from 'react';
import { View, Text, Image, FlatList, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { usePlaylistStore } from '../../src/stores/usePlaylistStore';
import { useVideoStore } from '../../src/stores/useVideoStore';
import { StackedCardView } from '../../src/components/playlist/StackedCardView';
import type { Video } from '../../src/types';

// ─── VideoRow (list mode) ─────────────────────────────────────────────────────

function VideoRow({
  video,
  onPress,
}: {
  video: Video;
  onPress: () => void;
}) {
  const { colors, radius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        rowStyles.row,
        {
          backgroundColor: colors.card,
          borderRadius: radius.md,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View style={[rowStyles.thumbWrap, { borderRadius: radius.sm, backgroundColor: colors.surface }]}>
        {video.thumbnail ? (
          <Image
            source={{ uri: video.thumbnail }}
            style={rowStyles.thumb}
            resizeMode="cover"
          />
        ) : null}
      </View>
      <View style={rowStyles.info}>
        <Text style={[rowStyles.title, { color: colors.text }]} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={[rowStyles.meta, { color: colors.textMuted }]}>
          {video.source} · {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
        </Text>
      </View>
      {video.isFavorite && (
        <Text style={[rowStyles.heart, { color: colors.accent }]}>♥</Text>
      )}
    </Pressable>
  );
}

// ─── PlaylistScreen ───────────────────────────────────────────────────────────

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, radius } = useTheme();

  const playlist = usePlaylistStore((s) => s.playlists[id]);
  // Select the raw videos map (stable reference) and derive the list with useMemo
  // to avoid creating a new array on every Zustand snapshot.
  const videosMap = useVideoStore((s) => s.videos);
  const videos = useMemo<Video[]>(
    () => (playlist ? playlist.videoIds.flatMap((vid) => (videosMap[vid] ? [videosMap[vid]] : [])) : []),
    [playlist, videosMap],
  );

  if (!playlist) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>
          Playlist introuvable
        </Text>
      </View>
    );
  }

  // ── Stack mode: full-screen card carousel ──────────────────────────────────
  if (playlist.viewMode === 'stack') {
    return (
      <>
        <Stack.Screen options={{ title: playlist.name }} />
        <StackedCardView
          videos={videos}
          onVideoPress={(video) => router.push(`/video/${video.id}`)}
        />
      </>
    );
  }

  // ── List mode ──────────────────────────────────────────────────────────────
  return (
    <>
      <Stack.Screen options={{ title: playlist.name }} />
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.surface, borderBottomColor: colors.border },
          ]}
        >
          <View style={[styles.cover, { backgroundColor: colors.card, borderRadius: radius.lg }]}>
            {playlist.coverImage ? (
              <Image
                source={{ uri: playlist.coverImage }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
            ) : null}
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{playlist.name}</Text>
            {playlist.description ? (
              <Text
                style={[styles.description, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {playlist.description}
              </Text>
            ) : null}
            <View style={styles.meta}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: colors.accentDim, borderRadius: radius.full },
                ]}
              >
                <Text style={[styles.categoryText, { color: colors.accent }]}>
                  {playlist.category}
                </Text>
              </View>
              <Text style={[styles.count, { color: colors.textMuted }]}>
                {videos.length} vidéo{videos.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Add video */}
        <Pressable
          onPress={() =>
            router.push({ pathname: '/modals/add-video', params: { playlistId: id } })
          }
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.accent, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.addBtnText}>+ Ajouter une vidéo</Text>
        </Pressable>

        {/* Video list */}
        <FlatList
          data={videos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VideoRow
              video={item}
              onPress={() => router.push(`/video/${item.id}`)}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aucune vidéo dans cette playlist
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    borderBottomWidth: 0.5,
  },
  cover: { width: 72, height: 72, overflow: 'hidden' },
  headerInfo: { flex: 1, gap: 6 },
  name: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  description: { fontSize: 13, lineHeight: 18 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 3 },
  categoryText: { fontSize: 12, fontWeight: '600' },
  count: { fontSize: 12 },
  addBtn: {
    marginHorizontal: 16,
    marginVertical: 12,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  list: { padding: 16, gap: 8, paddingBottom: 40 },
  empty: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});

const rowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  thumbWrap: { width: 80, height: 52, overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 14, fontWeight: '500', lineHeight: 19 },
  meta: { fontSize: 12, textTransform: 'capitalize' },
  heart: { fontSize: 16 },
});
