import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';
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
    width.value = withTiming(ratio, { duration: 500 });
  }, [ratio, width]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={[typography.footnote, { color: colors.secondaryLabel }]}>
          {label ?? 'Storage'}
        </Text>
        <Text style={[typography.footnote, { color: colors.secondaryLabel }]}>
          {formatBytes(usedBytes)} of {formatBytes(capacityBytes)}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.fill }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: colors.tint }, fillStyle]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
