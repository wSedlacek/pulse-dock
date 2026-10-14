import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Track } from '../types/music';
import { useTheme } from '../theme/ThemeProvider';
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
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={mode === 'select' ? onToggle : undefined}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.line },
        selected && { backgroundColor: colors.glow },
        pressed && styles.pressed,
      ]}
    >
      {mode === 'select' ? (
        <View
          style={[
            styles.check,
            {
              borderColor: selected ? colors.accent : colors.mist,
              backgroundColor: selected ? colors.accent : 'transparent',
            },
          ]}
        >
          {selected ? (
            <Text style={[styles.checkMark, { color: colors.accentContrast }]}>✓</Text>
          ) : null}
        </View>
      ) : (
        <View style={[styles.dot, { backgroundColor: colors.amber }]} />
      )}

      <View style={styles.meta}>
        <Text style={[styles.title, { color: colors.chalk }]} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={[styles.sub, { color: colors.mist }]} numberOfLines={1}>
          {track.artist}
          {track.durationSec > 0 ? ` · ${formatDuration(track.durationSec)}` : ''}
          {` · ${formatBytes(track.sizeBytes)}`}
        </Text>
      </View>

      {trailingLabel ? (
        <Text style={[styles.badge, { color: colors.accent }]}>{trailingLabel}</Text>
      ) : null}

      {onRemove ? (
        <Pressable onPress={onRemove} hitSlop={10} style={styles.removeBtn}>
          <Text style={[styles.removeText, { color: colors.danger }]}>Remove</Text>
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
  },
  pressed: {
    opacity: 0.85,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 13,
    fontFamily: 'IBMPlexSans_700Bold',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  meta: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 15,
  },
  sub: {
    fontFamily: 'IBMPlexSans_400Regular',
    fontSize: 12,
  },
  badge: {
    fontFamily: 'IBMPlexSans_500Medium',
    fontSize: 11,
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
  },
});
