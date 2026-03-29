import { Tabs, router } from 'expo-router';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppStore } from '../../src/stores/useAppStore';
import { ThemeToggle } from '../../src/components/ThemeToggle';

// ─── Constants ────────────────────────────────────────────────────────────────

const TAB_COUNT = 3;
const TAB_BAR_HEIGHT = 64;
const PILL_HEIGHT = 40;
const PILL_WIDTH = 52;

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SearchIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth={1.8} />
      <Path
        d="M15.5 15.5L20 20"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function HeartIcon({
  color,
  size = 22,
  filled = false,
}: {
  color: string;
  size?: number;
  filled?: boolean;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
      <Path
        d="M12 20.35L10.55 19.03C5.4 14.36 2 11.27 2 7.5C2 4.41 4.42 2 7.5 2C9.24 2 10.91 2.81 12 4.08C13.09 2.81 14.76 2 16.5 2C19.58 2 22 4.41 22 7.5C22 11.27 18.6 14.36 13.45 19.03L12 20.35Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const tabItemWidth = screenWidth / TAB_COUNT;

  const pillX = useSharedValue(
    state.index * tabItemWidth + (tabItemWidth - PILL_WIDTH) / 2
  );

  useEffect(() => {
    pillX.value = withSpring(
      state.index * tabItemWidth + (tabItemWidth - PILL_WIDTH) / 2,
      { damping: 18, stiffness: 180 }
    );
  }, [state.index, tabItemWidth]);

  const favCount = useAppStore((s) =>
    s.playlists.reduce(
      (acc, p) => acc + p.videos.filter((v) => v.isFavorite).length,
      0
    )
  );

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
  }));

  return (
    <BlurView
      intensity={85}
      tint={mode === 'dark' ? 'dark' : 'light'}
      style={[
        tabStyles.container,
        {
          paddingBottom: insets.bottom,
          borderTopColor: colors.border,
        },
      ]}
    >
      <View style={tabStyles.content}>
        {/* Animated pill indicator */}
        <Animated.View
          style={[
            tabStyles.pill,
            { backgroundColor: colors.accentDim },
            pillStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const iconColor = isFocused ? colors.accent : colors.textMuted;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              // @ts-ignore – React Navigation navigate typing
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={tabStyles.tabItem}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              {route.name === 'index' && <HomeIcon color={iconColor} />}
              {route.name === 'search' && <SearchIcon color={iconColor} />}
              {route.name === 'favorites' && (
                <View>
                  <HeartIcon color={iconColor} filled={isFocused} />
                  {favCount > 0 && (
                    <View
                      style={[tabStyles.badge, { backgroundColor: colors.accent }]}
                    >
                      <Text style={tabStyles.badgeText}>
                        {favCount > 99 ? '99+' : String(favCount)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
}

// ─── App Header ───────────────────────────────────────────────────────────────

function AppHeader() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        headerStyles.container,
        {
          backgroundColor: colors.surface,
          paddingTop: insets.top + 8,
          borderBottomColor: colors.borderSubtle,
        },
      ]}
    >
      {/* Logo */}
      <View style={headerStyles.logo}>
        <Text style={[headerStyles.logoText, { color: colors.text }]}>VIDEO</Text>
        <Text style={[headerStyles.logoAccent, { color: colors.accent }]}>HUB</Text>
      </View>

      {/* Actions */}
      <View style={headerStyles.actions}>
        <Pressable
          onPress={() => router.push('/(tabs)/search')}
          style={[headerStyles.iconBtn, { backgroundColor: colors.card }]}
          hitSlop={8}
        >
          <SearchIcon color={colors.text} size={18} />
        </Pressable>

        <View style={[headerStyles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={headerStyles.avatarText}>JD</Text>
        </View>

        <ThemeToggle />
      </View>
    </View>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        header: () => <AppHeader />,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="search" options={{ title: 'Recherche' }} />
      <Tabs.Screen name="favorites" options={{ title: 'Favoris' }} />
    </Tabs>
  );
}

// ─── Tab bar styles ───────────────────────────────────────────────────────────

const tabStyles = StyleSheet.create({
  container: {
    borderTopWidth: 0.5,
    overflow: 'hidden',
  },
  content: {
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  pill: {
    position: 'absolute',
    top: (TAB_BAR_HEIGHT - PILL_HEIGHT) / 2,
    left: 0,
    width: PILL_WIDTH,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: TAB_BAR_HEIGHT,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});

// ─── Header styles ────────────────────────────────────────────────────────────

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  logoAccent: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
