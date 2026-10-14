import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMusicStore } from '../store/MusicStore';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const TAB_BAR_CONTENT_HEIGHT = 49;

function TabIcon({
  name,
  color,
  badge,
}: {
  name: IoniconName;
  color: ColorValue;
  badge?: number;
}) {
  const { colors } = useTheme();
  return (
    <View>
      <Ionicons name={name} size={24} color={color as string} />
      {badge && badge > 0 ? (
        <View style={[styles.badge, { backgroundColor: colors.danger }]}>
          <Text style={[typography.caption2, { color: colors.onTint, fontWeight: '700' }]}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/**
 * Web tab navigator only — phone frame / status bar / home indicator live in
 * `demo/DemoPhoneShell.web.tsx`, which injects matching safe-area insets.
 */
export default function AppTabs() {
  const { selectedIds } = useMusicStore();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + bottomInset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.groupedBackground },
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.secondaryLabel,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent',
          borderTopColor: colors.separator,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          height: tabBarHeight,
          paddingBottom: bottomInset,
        },
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: isDark
                    ? 'rgba(28,28,30,0.94)'
                    : 'rgba(249,249,249,0.94)',
                },
              ]}
            />
            <BlurView
              intensity={80}
              tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
              style={StyleSheet.absoluteFill}
            />
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarBadge: selectedIds.length || undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.danger,
            color: colors.onTint as string,
            fontSize: 11,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'musical-notes' : 'musical-notes-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="player"
        options={{
          title: 'Player',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? 'phone-portrait' : 'phone-portrait-outline'}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sync"
        options={{
          title: 'Sync',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? 'sync' : 'sync-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -11,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
