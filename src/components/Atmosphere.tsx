import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

export function Atmosphere({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.washTop, colors.washMid, colors.washBottom]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbA} />
      <View style={styles.orbB} />
      <View style={styles.grain} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  orbA: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(61, 255, 200, 0.08)',
  },
  orbB: {
    position: 'absolute',
    bottom: 120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 179, 71, 0.05)',
  },
  grain: {
    ...StyleSheet.absoluteFill,
    opacity: 0.04,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
});
