import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/stores/useAppStore';
import type { ViewMode } from '../../src/types';

const CATEGORIES = [
  'Gaming', 'Musique', 'Développement', 'Sport',
  'Cinéma', 'Éducation', 'Tech', 'Autre',
];

export default function CreatePlaylistModal() {
  const { colors, radius } = useTheme();
  const addPlaylist = useAppStore((s) => s.addPlaylist);
  const defaultViewMode = useAppStore((s) => s.settings.defaultViewMode);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [viewMode] = useState<ViewMode>(defaultViewMode);

  const isValid = name.trim().length > 0 && category.length > 0;

  const handleCreate = () => {
    if (!isValid) return;
    addPlaylist({
      name: name.trim(),
      description: description.trim(),
      category,
      viewMode,
    });
    router.back();
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Name */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Nom *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ma super playlist"
          placeholderTextColor={colors.textMuted}
          maxLength={60}
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

      {/* Description */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description optionnelle…"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={3}
          maxLength={200}
          style={[
            styles.textarea,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderRadius: radius.md,
              borderColor: colors.border,
            },
          ]}
        />
      </View>

      {/* Category */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.text }]}>Catégorie *</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((cat) => {
            const selected = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? colors.accent : colors.card,
                    borderColor: selected ? colors.accent : colors.border,
                    borderRadius: radius.full,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selected ? '#FFF' : colors.text },
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Submit */}
      <Pressable
        onPress={handleCreate}
        disabled={!isValid}
        style={({ pressed }) => [
          styles.submitBtn,
          {
            backgroundColor: colors.accent,
            borderRadius: radius.lg,
            opacity: !isValid || pressed ? 0.5 : 1,
          },
        ]}
      >
        <Text style={styles.submitText}>Créer la playlist</Text>
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
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    height: 44,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  textarea: {
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 15,
    borderWidth: 1,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
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
