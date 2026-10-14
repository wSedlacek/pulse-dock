import { Tabs } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useMusicStore } from '../../store/MusicStore';
import { colors } from '../../theme/colors';

export default function TabsLayout() {
  const { ready, selectedIds } = useMusicStore();

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.led} size="large" />
        <Text style={styles.bootText}>Spinning up host library…</Text>
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.led,
        tabBarInactiveTintColor: colors.mist,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarBadge: selectedIds.length || undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tabs.Screen name="player" options={{ title: 'Player' }} />
      <Tabs.Screen name="sync" options={{ title: 'Sync' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  bootText: {
    fontFamily: 'IBMPlexSans_400Regular',
    color: colors.mist,
    fontSize: 14,
  },
  tabBar: {
    backgroundColor: '#09131D',
    borderTopColor: colors.line,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabLabel: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 11,
  },
  badge: {
    backgroundColor: colors.led,
    color: colors.ink,
    fontSize: 11,
  },
});
