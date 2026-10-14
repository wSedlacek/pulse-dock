import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '../theme/colors';
import { formatBytes } from '../utils/format';

type Props = {
  usedBytes: number;
  capacityBytes: number;
  label?: string;
};

export function StorageMeter({ usedBytes, capacityBytes, label }: Props) {
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
        <Text style={styles.label}>{label ?? 'Player storage'}</Text>
        <Text style={styles.value}>
          {formatBytes(usedBytes)} / {formatBytes(capacityBytes)}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
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
    color: colors.mist,
  },
  value: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 12,
    color: colors.chalkDim,
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(232, 241, 247, 0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.led,
  },
});
