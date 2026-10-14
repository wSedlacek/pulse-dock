import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ColorValue,
} from 'react-native';
import { useMusicStore } from '../store/MusicStore';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const IPHONE_WIDTH = 390;
const IPHONE_HEIGHT = 844;

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

function StatusBarChrome() {
  const { colors, isDark } = useTheme();
  const time = new Date().toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <View style={styles.statusBar}>
      <Text style={[typography.caption1, { color: colors.label, fontWeight: '600' }]}>
        {time}
      </Text>
      <View style={[styles.island, { backgroundColor: isDark ? '#000' : '#111' }]} />
      <View style={styles.statusIcons}>
        <View style={[styles.signal, { backgroundColor: colors.label }]} />
        <View style={[styles.wifi, { borderColor: colors.label }]} />
        <View style={[styles.battery, { borderColor: colors.label }]}>
          <View style={[styles.batteryFill, { backgroundColor: colors.label }]} />
        </View>
      </View>
    </View>
  );
}

export default function AppTabs() {
  const { selectedIds } = useMusicStore();
  const { colors, isDark } = useTheme();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  return (
    <View
      style={[
        styles.desk,
        {
          backgroundColor: colors.desk,
          minHeight: windowHeight,
          width: windowWidth,
        },
      ]}
    >
      <View
        style={[
          styles.phone,
          {
            backgroundColor: colors.groupedBackground,
            borderColor: isDark ? '#2C2C2E' : '#1C1C1E',
          },
        ]}
      >
        <StatusBarChrome />
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.tint,
            tabBarInactiveTintColor: colors.secondaryLabel,
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '500',
            },
            tabBarStyle: {
              position: 'absolute',
              backgroundColor: 'transparent',
              borderTopColor: colors.separator,
              borderTopWidth: StyleSheet.hairlineWidth,
              elevation: 0,
              height: 49,
            },
            tabBarBackground: () => (
              <BlurView
                intensity={80}
                tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
                style={StyleSheet.absoluteFill}
              />
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
                color: colors.onTint,
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
        <View style={[styles.homeIndicator, { backgroundColor: colors.label }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desk: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  phone: {
    width: IPHONE_WIDTH,
    height: IPHONE_HEIGHT,
    maxHeight: '96%',
    borderRadius: 47,
    borderWidth: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
  },
  statusBar: {
    height: 54,
    paddingHorizontal: 28,
    paddingTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  island: {
    position: 'absolute',
    top: 11,
    left: (IPHONE_WIDTH - 126) / 2 - 12,
    width: 126,
    height: 37,
    borderRadius: 20,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signal: {
    width: 16,
    height: 10,
    borderRadius: 2,
    opacity: 0.9,
  },
  wifi: {
    width: 14,
    height: 10,
    borderWidth: 1.5,
    borderRadius: 8,
    opacity: 0.9,
  },
  battery: {
    width: 22,
    height: 11,
    borderWidth: 1.2,
    borderRadius: 3,
    padding: 1.5,
    opacity: 0.9,
  },
  batteryFill: {
    flex: 1,
    borderRadius: 1,
    width: '70%',
  },
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
  homeIndicator: {
    alignSelf: 'center',
    width: 134,
    height: 5,
    borderRadius: 3,
    marginBottom: 8,
    opacity: 0.9,
  },
});
