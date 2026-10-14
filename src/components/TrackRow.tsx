import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Track } from '../types/music';
import { useTheme } from '../theme/ThemeProvider';
import { typography } from '../theme/typography';
import { formatBytes, formatDuration } from '../utils/format';

type Props = {
  track: Track;
  selected?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  trailingLabel?: string;
  mode?: 'select' | 'plain';
  showSeparator?: boolean;
};

function RowIcon({
  name,
  color,
  size = 22,
}: {
  name: 'checkmark.circle.fill' | 'circle' | 'music.note';
  color: string;
  size?: number;
}) {
  if (Platform.OS === 'ios') {
    return <SymbolView name={name} tintColor={color} size={size} />;
  }
  const map = {
    'checkmark.circle.fill': 'checkmark-circle' as const,
    circle: 'ellipse-outline' as const,
    'music.note': 'musical-note' as const,
  };
  return <Ionicons name={map[name]} size={size} color={color} />;
}

export function TrackRow({
  track,
  selected,
  onToggle,
  onRemove,
  trailingLabel,
  mode = 'select',
  showSeparator = true,
}: Props) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={
        mode === 'select'
          ? () => {
              if (Platform.OS === 'ios') void Haptics.selectionAsync();
              onToggle?.();
            }
          : undefined
      }
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? colors.fill : 'transparent' },
      ]}
    >
      {mode === 'select' ? (
        <RowIcon
          name={selected ? 'checkmark.circle.fill' : 'circle'}
          color={selected ? colors.tint : colors.tertiaryLabel}
        />
      ) : (
        <View style={[styles.noteBadge, { backgroundColor: colors.tint }]}>
          <RowIcon name="music.note" color={colors.onTint} size={14} />
        </View>
      )}

      <View
        style={[
          styles.meta,
          showSeparator && {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.separator,
          },
        ]}
      >
        <View style={styles.metaInner}>
          <Text style={[typography.body, { color: colors.label }]} numberOfLines={1}>
            {track.title}
          </Text>
          <Text
            style={[typography.subhead, { color: colors.secondaryLabel }]}
            numberOfLines={1}
          >
            {track.artist}
            {track.durationSec > 0 ? ` · ${formatDuration(track.durationSec)}` : ''}
            {` · ${formatBytes(track.sizeBytes)}`}
          </Text>
        </View>

        {trailingLabel ? (
          <Text style={[typography.footnote, { color: colors.secondaryLabel }]}>
            {trailingLabel}
          </Text>
        ) : null}

        {onRemove ? (
          <Pressable
            onPress={() => {
              if (Platform.OS === 'ios') void Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
              onRemove();
            }}
            hitSlop={10}
            style={styles.removeBtn}
          >
            <Text style={[typography.subhead, { color: colors.danger }]}>Delete</Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    minHeight: 60,
    gap: 12,
  },
  noteBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingRight: 16,
    minHeight: 60,
  },
  metaInner: {
    flex: 1,
    gap: 2,
  },
  removeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
});
