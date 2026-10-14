import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs, TabList, TabTrigger, TabSlot, type TabTriggerSlotProps } from 'expo-router/ui';
import type { ComponentProps, Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useMusicStore } from '../store/MusicStore';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';

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
          color={isFocused ? colors.tint : colors.secondaryLabel}
        />
        {badge && badge > 0 ? (
          <View style={[styles.badge, { backgroundColor: colors.danger }]}>
            <Text style={[typography.caption2, { color: colors.onTint, fontWeight: '700' }]}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        style={[
          typography.caption2,
          { color: isFocused ? colors.tint : colors.secondaryLabel, fontWeight: '500' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function StatusBarChrome() {
  const { colors, isDark } = useTheme();
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

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
        <Tabs style={styles.tabs}>
          <TabSlot style={styles.slot} />
          <View style={styles.tabBarWrap}>
            <BlurView
              intensity={80}
              tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
              style={StyleSheet.absoluteFill}
            />
            <TabList style={[styles.tabList, { borderTopColor: colors.separator }]}>
              <TabTrigger name="index" href="/(tabs)/index" asChild>
                <TabButton
                  label="Library"
                  icon="musical-notes-outline"
                  iconActive="musical-notes"
                  badge={selectedIds.length}
                />
              </TabTrigger>
              <TabTrigger name="player" href="/(tabs)/player" asChild>
                <TabButton
                  label="Player"
                  icon="phone-portrait-outline"
                  iconActive="phone-portrait"
                />
              </TabTrigger>
              <TabTrigger name="sync" href="/(tabs)/sync" asChild>
                <TabButton label="Sync" icon="sync-outline" iconActive="sync" />
              </TabTrigger>
            </TabList>
          </View>
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
    alignSelf: 'center',
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
  tabs: {
    flex: 1,
  },
  slot: {
    flex: 1,
  },
  tabBarWrap: {
    overflow: 'hidden',
  },
  tabList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    paddingBottom: 8,
    minHeight: 49,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 64,
    paddingVertical: 2,
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
