import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Track } from '../types/music';
import { colors } from '../theme/colors';
import { formatBytes, formatDuration } from '../utils/format';

type Props = {
  track: Track;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  trailingLabel?: string;
  mode?: 'select' | 'plain';
};

export function TrackRow({
  track,
  selected,
  onToggle,
  onRemove,
  trailingLabel,
  mode = 'select',
}: Props) {
  return (
    <Pressable
      onPress={mode === 'select' ? onToggle : undefined}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && styles.pressed,
      ]}
    >
      {mode === 'select' ? (
        <View style={[styles.check, selected && styles.checkOn]}>
          {selected ? <Text style={styles.checkMark}>✓</Text> : null}
        </View>
      ) : (
        <View style={styles.dot} />
      )}

      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {track.artist}
          {track.durationSec > 0 ? ` · ${formatDuration(track.durationSec)}` : ''}
          {` · ${formatBytes(track.sizeBytes)}`}
        </Text>
      </View>

      {trailingLabel ? <Text style={styles.badge}>{trailingLabel}</Text> : null}

      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={10} style={styles.removeBtn}>
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  rowSelected: {
    backgroundColor: colors.glow,
  },
  pressed: {
    opacity: 0.85,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    backgroundColor: colors.led,
    borderColor: colors.led,
  },
  checkMark: {
    color: colors.ink,
    fontSize: 13,
    fontFamily: 'IBMPlexSans_700Bold',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.amber,
  },
  meta: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 15,
    color: colors.chalk,
  },
  sub: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.mist,
  },
  badge: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 11,
    color: colors.led,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  removeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  removeText: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
    color: colors.danger,
  },
});
