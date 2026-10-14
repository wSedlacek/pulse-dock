import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AppTabs from '../../components/AppTabs';
import { useMusicStore } from '../../store/MusicStore';
import { useTheme } from '../../theme/ThemeProvider';

export default function TabsLayout() {
  const { ready } = useMusicStore();
  const { colors } = useTheme();

  if (!ready) {
    return (
      <View style={[styles.boot, { backgroundColor: colors.ink }]}>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={[styles.bootText, { color: colors.mist }]}>
          Spinning up host library…
        </Text>
      </View>
    );
  }

  return <AppTabs />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  bootText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 14,
  },
});
