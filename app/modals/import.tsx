import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/stores/useAppStore';
import { parseVideoUrl } from '../../src/services/urlParser';
import type { Playlist } from '../../src/types';

export default function ImportModal() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const { colors, radius } = useTheme();
  const playlists = useAppStore((s) => s.playlists);
  const addVideoToPlaylist = useAppStore((s) => s.addVideoToPlaylist);

  const [selected, setSelected] = useState<string | null>(
    playlists[0]?.id ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const decodedUrl = url ? decodeURIComponent(url) : '';
  const parsed = decodedUrl ? parseVideoUrl(decodedUrl) : null;

  // Pre-select the first playlist when playlists load
  useEffect(() => {
    if (!selected && playlists.length > 0) {
      setSelected(playlists[0].id);
    }
  }, [playlists]);

  const handleImport = () => {
    if (!selected || !decodedUrl) return;
    setLoading(true);
    try {
      addVideoToPlaylist(selected, {
        url: decodedUrl,
        title: `Vidéo ${parsed?.source ?? 'importée'}`,
        thumbnail: parsed?.thumbnailUrl ?? '',
        duration: 0,
        source: parsed?.source ?? 'unknown',
      });
      setDone(true);
      setTimeout(() => router.back(), 800);
    } finally {
      setLoading(false);
    }
  };

  if (!decodedUrl) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          Aucune URL reçue.
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.cancel, { color: colors.accent }]}>Fermer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* URL preview */}
      <View style={[styles.urlCard, { backgroundColor: colors.card, borderRadius: radius.md }]}>
        <Text style={[styles.urlLabel, { color: colors.textSecondary }]}>URL reçue</Text>
        <Text
          style={[styles.urlText, { color: colors.text }]}
          numberOfLines={3}
        >
          {decodedUrl}
        </Text>
        {parsed && (
          <Text style={[styles.sourceTag, { color: colors.accent }]}>
            {parsed.source}  ·  {parsed.videoId}
          </Text>
        )}
      </View>

      {/* Playlist picker */}
      <Text style={[styles.sectionLabel, { color: colors.text }]}>
        Ajouter à la playlist
      </Text>

      {playlists.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          Aucune playlist. Créez-en une d'abord.
        </Text>
      ) : (
        playlists.map((p: Playlist) => (
          <Pressable
            key={p.id}
            onPress={() => setSelected(p.id)}
            style={[
              styles.playlistRow,
              {
                backgroundColor: selected === p.id ? colors.accentDim : colors.card,
                borderRadius: radius.md,
                borderColor: selected === p.id ? colors.accent : 'transparent',
              },
            ]}
          >
            <Text style={[styles.playlistName, { color: colors.text }]}>
              {p.name}
            </Text>
            <Text style={[styles.playlistCount, { color: colors.textSecondary }]}>
              {p.videos.length} vidéo{p.videos.length !== 1 ? 's' : ''}
            </Text>
          </Pressable>
        ))
      )}

      {/* Actions */}
      <Pressable
        onPress={handleImport}
        disabled={!selected || loading || done || playlists.length === 0}
        style={({ pressed }) => [
          styles.importBtn,
          {
            backgroundColor: done ? colors.success ?? colors.accent : colors.accent,
            borderRadius: radius.lg,
            opacity: (!selected || loading || done || playlists.length === 0 || pressed) ? 0.6 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.importBtnText}>
            {done ? 'Ajouté ✓' : 'Importer'}
          </Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
        <Text style={[styles.cancel, { color: colors.textSecondary }]}>Annuler</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  urlCard: { padding: 14, gap: 6 },
  urlLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  urlText: { fontSize: 14, lineHeight: 20 },
  sourceTag: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  sectionLabel: { fontSize: 14, fontWeight: '700' },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderWidth: 1.5,
  },
  playlistName: { fontSize: 15, fontWeight: '500' },
  playlistCount: { fontSize: 13 },
  importBtn: { height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  importBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancel: { fontSize: 15 },
  empty: { fontSize: 14, textAlign: 'center' },
});
