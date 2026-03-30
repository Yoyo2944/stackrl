import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { ThemeProvider } from '../src/context/ThemeContext';
import { useThemeContext } from '../src/context/ThemeContext';
import { useSharedUrl } from '../src/hooks/useSharedUrl';
import { useHydration } from '../src/hooks/useHydration';
import { useVideoStore } from '../src/stores/useVideoStore';
import { usePlaylistStore } from '../src/stores/usePlaylistStore';
import { seedVideos, seedPlaylists } from '../src/stores/seed';

function AppNavigator() {
  const { mode, colors } = useThemeContext();
  const hydrated = useHydration();

  // Seed demo data on first launch (when stores are empty after hydration)
  useEffect(() => {
    if (!hydrated) return;
    if (Object.keys(useVideoStore.getState().videos).length === 0) {
      useVideoStore.setState({ videos: seedVideos });
    }
    if (Object.keys(usePlaylistStore.getState().playlists).length === 0) {
      usePlaylistStore.setState({ playlists: seedPlaylists });
    }
  }, [hydrated]);

  useSharedUrl((url) => {
    router.push({ pathname: '/modals/import', params: { url } });
  });

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="playlist/[id]"
          options={{
            title: '',
            headerBackTitle: 'Retour',
          }}
        />
        <Stack.Screen
          name="video/[id]"
          options={{
            headerShown: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="modals/add-video"
          options={{
            presentation: 'modal',
            title: 'Ajouter une vidéo',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="modals/create-playlist"
          options={{
            presentation: 'modal',
            title: 'Nouvelle playlist',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="modals/import"
          options={{
            presentation: 'modal',
            title: 'Importer une vidéo',
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
