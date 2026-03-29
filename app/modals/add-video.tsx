import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/stores/useAppStore';
import { parseVideoUrl } from '../../src/services/urlParser';

export default function AddVideoModal() {
  const { playlistId } = useLocalSearchParams<{ playlistId: string }>();
  const { colors, radius } = useTheme();
  const addVideoToPlaylist = useAppStore((s) => s.addVideoToPlaylist);
  const playlist = useAppStore((s) => s.playlists.find((p) => p.id === playlistId));

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState<ReturnType<typeof parseVideoUrl> | null>(null);

  const handleAnalyze = () => {
    setError('');
    const trimmed = url.trim();
    if (!trimmed) return;
    const result = parseVideoUrl(trimmed);
    setParsed(result);
    if (!title) {
      setTitle(`Vidéo ${result.source}`);
    }
  };

  const handleAdd = () => {
    if (!parsed || !playlistId) return;
    setLoading(true);
    try {
      addVideoToPlaylist(playlistId, {
        url: url.trim(),
        title: title.trim() || `Vidéo ${parsed.source}`,
        thumbnail: parsed.thumbnailUrl ?? '',
        duration: 0,
        source: parsed.source,
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const isValid = parsed && title.trim().length > 0;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {playlist && (
        <Text style={[styles.playlistName, { color: colors.textSecondary }]}>
          Ajouter à : {playlist.name}
        </Text>
      )}

      {/* URL input */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>URL de la vidéo</Text>
        <View style={styles.urlRow}>
          <TextInput
            value={url}
            onChangeText={(v) => { setUrl(v); setParsed(null); setError(''); }}
            placeholder="https://youtube.com/watch?v=…"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderRadius: radius.md,
                borderColor: error ? colors.danger : colors.border,
                flex: 1,
              },
            ]}
          />
          <Pressable
            onPress={handleAnalyze}
            disabled={!url.trim()}
            style={({ pressed }) => [
              styles.analyzeBtn,
              {
                backgroundColor: colors.accentDim,
                borderRadius: radius.md,
                opacity: !url.trim() || pressed ? 0.5 : 1,
              },
            ]}
          >
            <Text style={[styles.analyzeBtnText, { color: colors.accent }]}>
              Analyser
            </Text>
          </Pressable>
        </View>
        {error ? (
          <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
        ) : null}
      </View>

      {/* Parsed info */}
      {parsed && (
        <View
          style={[
            styles.parsedCard,
            { backgroundColor: colors.card, borderRadius: radius.md },
          ]}
        >
          <Text style={[styles.parsedSource, { color: colors.accent }]}>
            {parsed.source}
          </Text>
          <Text style={[styles.parsedId, { color: colors.textSecondary }]}>
            ID : {parsed.videoId}
          </Text>
        </View>
      )}

      {/* Title input */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Titre</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Titre de la vidéo"
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderRadius: radius.md,
              borderColor: colors.border,
            },
          ]}
        />
      </View>

      {/* Submit */}
      <Pressable
        onPress={handleAdd}
        disabled={!isValid || loading}
        style={({ pressed }) => [
          styles.submitBtn,
          {
            backgroundColor: colors.accent,
            borderRadius: radius.lg,
            opacity: !isValid || loading || pressed ? 0.5 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.submitText}>Ajouter la vidéo</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  playlistName: {
    fontSize: 13,
    fontWeight: '500',
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  urlRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    height: 44,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  analyzeBtn: {
    height: 44,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    fontSize: 12,
  },
  parsedCard: {
    padding: 12,
    gap: 4,
  },
  parsedSource: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  parsedId: {
    fontSize: 12,
  },
  submitBtn: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
