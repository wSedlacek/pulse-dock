import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import AppTabs from '../../components/AppTabs';
import { useMusicStore } from '../../store/MusicStore';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/typography';

export default function TabsLayout() {
  const { ready } = useMusicStore();
  const { colors } = useTheme();

  if (!ready) {
    return (
      <View style={[styles.boot, { backgroundColor: colors.groupedBackground }]}>
        <ActivityIndicator color={colors.tint} />
        <Text style={[typography.footnote, { color: colors.secondaryLabel }]}>
          Loading library…
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
    gap: 10,
  },
});
