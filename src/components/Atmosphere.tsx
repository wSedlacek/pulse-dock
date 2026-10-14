import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function Atmosphere({ children }: { children: ReactNode }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.ink }]}>
      <LinearGradient
        colors={[colors.washTop, colors.washMid, colors.washBottom]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.orbA, { backgroundColor: colors.orbA }]} />
      <View style={[styles.orbB, { backgroundColor: colors.orbB }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  orbA: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  orbB: {
    position: 'absolute',
    bottom: 120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
  },
});
