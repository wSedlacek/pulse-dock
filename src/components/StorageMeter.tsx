import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { formatBytes } from '../utils/format';

type Props = {
  usedBytes: number;
  capacityBytes: number;
  label?: string;
};

export function StorageMeter({ usedBytes, capacityBytes, label }: Props) {
  const { colors } = useTheme();
  const ratio = capacityBytes > 0 ? Math.min(1, usedBytes / capacityBytes) : 0;
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(ratio, { duration: 700 });
  }, [ratio, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.mist }]}>
          {label ?? 'Player storage'}
        </Text>
        <Text style={[styles.value, { color: colors.chalkDim }]}>
          {formatBytes(usedBytes)} / {formatBytes(capacityBytes)}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.line }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: colors.accent }, fillStyle]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
  },
  value: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 12,
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
