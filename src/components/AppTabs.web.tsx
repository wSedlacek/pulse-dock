import { Ionicons } from '@expo/vector-icons';
import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from 'expo-router/ui';
import type { ComponentProps, Ref } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useMusicStore } from '../store/MusicStore';
import { useTheme } from '../theme/ThemeProvider';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

const IPHONE_WIDTH = 390;
const IPHONE_HEIGHT = 844;

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
  icon: IoniconName;
  iconActive: IoniconName;
  badge?: number;
  ref?: Ref<View>;
};

function TabButton({
  label,
  icon,
  iconActive,
  badge,
  isFocused,
  ref,
  ...props
}: TabButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable {...props} ref={ref} style={styles.tabItem}>
      <View>
        <Ionicons
          name={isFocused ? iconActive : icon}
          size={24}
          color={isFocused ? colors.accent : colors.mist}
        />
        {badge && badge > 0 ? (
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.badgeText, { color: colors.accentContrast }]}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        style={[
          styles.tabLabel,
          { color: isFocused ? colors.accent : colors.mist },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function AppTabs() {
  const { selectedIds } = useMusicStore();
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.desk, { backgroundColor: colors.desk }]}>
      <View
        style={[
          styles.phone,
          {
            backgroundColor: colors.ink,
            borderColor: isDark ? '#1A2740' : '#C5D0E2',
          },
        ]}
      >
        <View style={styles.notch} />
        <Tabs style={styles.tabs}>
          <TabSlot style={styles.slot} />
          <TabList
            style={[
              styles.tabList,
              {
                backgroundColor: colors.tabBar,
                borderTopColor: colors.line,
              },
            ]}
          >
            <TabTrigger name="index" href="/" asChild>
              <TabButton
                label="Library"
                icon="musical-notes-outline"
                iconActive="musical-notes"
                badge={selectedIds.length}
              />
            </TabTrigger>
            <TabTrigger name="player" href="/player" asChild>
              <TabButton
                label="Player"
                icon="phone-portrait-outline"
                iconActive="phone-portrait"
              />
            </TabTrigger>
            <TabTrigger name="sync" href="/sync" asChild>
              <TabButton label="Sync" icon="sync-outline" iconActive="sync" />
            </TabTrigger>
          </TabList>
        </Tabs>
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
    maxHeight: '100%',
    borderRadius: 44,
    borderWidth: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 18 },
  },
  notch: {
    position: 'absolute',
    top: 10,
    width: 120,
    height: 28,
    borderRadius: 18,
    zIndex: 20,
    left: (IPHONE_WIDTH - 120) / 2 - 10,
    backgroundColor: '#111',
  },
  tabs: {
    flex: 1,
  },
  slot: {
    flex: 1,
  },
  tabList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingBottom: 22,
    minHeight: 72,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    minWidth: 72,
    paddingVertical: 4,
  },
  tabLabel: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 10,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'IBMPlexSans_700Bold',
  },
});
