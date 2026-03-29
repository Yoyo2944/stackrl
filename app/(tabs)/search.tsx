import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/stores/useAppStore';
import type { Playlist } from '../../src/types';

function PlaylistResult({ playlist }: { playlist: Playlist }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={() => router.push(`/playlist/${playlist.id}`)}
      style={({ pressed }) => [
        resultStyles.row,
        {
          backgroundColor: colors.card,
          borderRadius: radius.md,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View
        style={[
          resultStyles.thumb,
          { backgroundColor: colors.surface, borderRadius: radius.sm },
        ]}
      />
      <View style={resultStyles.info}>
        <Text style={[resultStyles.name, { color: colors.text }]} numberOfLines={1}>
          {playlist.name}
        </Text>
        <Text style={[resultStyles.meta, { color: colors.textSecondary }]}>
          {playlist.category} · {playlist.videos.length} vidéo
          {playlist.videos.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </Pressable>
  );
}

export default function SearchScreen() {
  const { colors, radius } = useTheme();
  const [query, setQuery] = useState('');
  const playlists = useAppStore((s) => s.playlists);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return playlists;
    return playlists.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [query, playlists]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Search input */}
      <View style={styles.inputWrapper}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Rechercher une playlist…"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderRadius: radius.lg,
              borderColor: colors.border,
            },
          ]}
        />
      </View>

      {/* Results */}
      {playlists.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Aucune playlist
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Crée ta première playlist depuis l'accueil
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PlaylistResult playlist={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.noMatch, { color: colors.textMuted }]}>
              Aucun résultat pour "{query}"
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  input: {
    height: 44,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
  },
  list: {
    padding: 16,
    gap: 8,
    paddingBottom: 100,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  noMatch: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 14,
  },
});

const resultStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 40,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
  },
});
